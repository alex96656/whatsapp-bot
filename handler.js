import fs from "fs";
import path from "path";
import url from "url";
import { isPremium } from "./database/premium.js";
import {
  Prefix,
  OwnerNumber,
  CreatorNumber,
  Mode
} from "./config.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "config.json");

// --- CONFIG ---
let CONFIG = {
  owner: "",
  creator: CreatorNumber,
  mode: Mode
};

if (fs.existsSync(configPath)) {
  CONFIG = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} else {
  fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
}

// --- COMMANDS ---
const commands = new Map();
const commandsPath = path.join(__dirname, "commands");

//  Load the orders
export async function loadCommands() {
  commands.clear();

  const files = fs.readdirSync(commandsPath);

  for (const file of files) {
    if (file.endsWith(".js")) {
      const commandName = file.replace(".js", "");

      try {
        const modulePath = `./commands/${file}?update=${Date.now()}`;
        const module = await import(modulePath);

        const cmd =
          module.default || module[`${commandName}Command`];

        if (cmd) {
          commands.set(commandName, cmd);
        }
      } catch (err) {
        console.error(`❌ Loading error ${file}:`, err);
      }
    }
  }

  console.log(`✅ ${commands.size} orders loaded`);
}

// 🔥 Récupérer les commandes (menu dynamique)
export function getCommands() {
  return commands;
}

// 🔁 Hot reload auto
fs.watch(commandsPath, async (eventType, filename) => {
  if (filename && filename.endsWith(".js")) {
    console.log(`♻️ Reload command: ${filename}`);
    await loadCommands();
  }
});

// Load at startup
await loadCommands();

// --- REACT ---
let react = null;
try {
  const reactModule = await import(`./commands/react.js?update=${Date.now()}`);
  react = reactModule.default || reactModule.reactCommand;
} catch (err) {
  console.log("⚠️ react.js not found or error ignored");
}

// --- OWNER AUTO ---
export async function setOwnerOnConnect(minato) {
  if (!CONFIG.owner) {
    const me = minato.user?.id || minato.user?.jid;
    if (me) {
      CONFIG.owner = me.replace(/[^0-9]/g, "");
      fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
      console.log(`✅ Owner automatically defined : ${CONFIG.owner}`);
    }
  }
}

// --- UTILS ---
function getSenderNumber(message) {
  let senderJid = "";

  if (message.key.fromMe) {
    senderJid = CONFIG.owner + "@s.whatsapp.net";
  } else if (message.key.participant) {
    senderJid = message.key.participant;
  } else {
    senderJid = message.key.remoteJid;
  }

  return senderJid.replace(/[^0-9]/g, "");
}

function getTargetUser(message, args) {
  const quoted =
    message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  const mentions =
    message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (quoted)
    return message.message.extendedTextMessage.contextInfo.participant.replace(
      /[^0-9]/g,
      ""
    );

  if (mentions.length > 0)
    return mentions[0].replace(/[^0-9]/g, "");

  if (args[0])
    return args[0].replace(/[^0-9]/g, "");

  return null;
}

// --- LOGS ---
function logMessage(message, type = "IN") {
  const remoteJid = message.key.remoteJid;
  const isGroup = remoteJid.endsWith("@g.us");
  const isChannel = remoteJid.endsWith("@broadcast");

  const sender = getSenderNumber(message);
  const senderName = message.pushName || "Unknown";

  const text =
    message.message?.conversation ||
    message.message?.extendedTextMessage?.text ||
    "";

  let logText = `[${type}] `;

  if (isGroup) {
    logText += `GROUP (${remoteJid}) | ${senderName} (${sender}) → ${text}`;
  } else if (isChannel) {
    logText += `CHANNEL | ${senderName} → ${text}`;
  } else {
    logText += `DM | ${senderName} (${sender}) → ${text}`;
  }

  console.log(logText);
}

// --- HANDLER PRINCIPAL ---
export async function handleCommand(message, minato) {
  try {
    logMessage(message, "IN");

    const text =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      "";

    const prefix = Prefix;
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const sender = getSenderNumber(message);

    const isOwner = sender === CONFIG.owner;
    const isCreator = sender === CONFIG.creator;
    const premium = isPremium(sender);

    // 🔒 Mode private
    if (CONFIG.mode === "private" && !isOwner && !isCreator) return;

    // 🚀 Execution
    if (commands.has(command)) {
      if (react) {
        try {
          await react(message, obito);
        } catch (err) {
          console.error("Erreur react.js:", err);
        }
      }

      const cmd = commands.get(command);
      const target = getTargetUser(message, args);

      await cmd(message, obito, {
        sender,
        target,
        args,
        isOwner,
        isCreator,
        isPremium: premium,
        config: CONFIG,
        updateConfig: (newConfig) => {
          CONFIG = { ...CONFIG, ...newConfig };
          fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
          console.log("⚙️ Configuration updated :", CONFIG);
        },
      });

      logMessage(
        {
          key: message.key,
          message: { conversation: `Command ${command} executed` },
          pushName: message.pushName,
        },
        "OUT"
      );
    }
  } catch (e) {
    console.error("❌ Error handleCommand:", e);
  }
}