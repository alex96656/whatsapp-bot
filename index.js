import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import readline from "readline";
import { Boom } from "@hapi/boom";
import { handleCommand } from "./handler.js";
import {
  BotName,
  BotVersion,
} from "../config.js";

console.clear();
console.log(`🚀 Starting ${BotName} V${BotVersion} Bot...`);

// --- Mode Pairing activé ---
const usePairingCode = true;

// --- Lecture console ---
const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(text, (ans) => {
    rl.close();
    resolve(ans);
  }));
};

// --- Lancement principal ---
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  const obito = makeWASocket({
    version,
    printQRInTerminal: !usePairingCode,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    logger: pino({ level: "silent" }),
    auth: state,
  });

  // --- Mode Pairing (pour se connecter sans QR) ---
  if (usePairingCode && !obito.authState.creds.registered) {
    const number = await question("📱 Enter your number (e.g.: 225070000000): ");
    const code = await obito.requestPairingCode(number);
    console.log(`✅ PAIRING CODE: ${code}`);
  }

  // --- Gestion de la connexion ---
  obito.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") {
      console.log("✅ BOT SUCCESSFULLY CONNECTED !");
    } else if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Session expired. Delete the 'session' folder and log back in.");
      } else {
        console.log("⚠️ Log out, restart...");
        startBot();
      }
    }
  });

  // --- Gestion des messages entrants ---
  obito.ev.on("messages.upsert", async (chatUpdate) => {
    const msg = chatUpdate.messages[0];
    if (!msg.message) return;
    if (msg.key.remoteJid === "status@broadcast") return;
    await handleCommand(msg, obito);
  });

  obito.ev.on("creds.update", saveCreds);
}

startBot();