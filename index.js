const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const readline = require("readline");

// ===== YOUR DETAILS =====
const BOT_NAME = "ᴹᴿ•ᴀʟᴇx᭄";
const OWNER_NUMBER = "2347032527540";

// ===== INPUT =====
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (text) => new Promise(resolve => rl.question(text, resolve));

// ===== START BOT =====
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  // ===== PAIRING =====
  if (!sock.authState.creds.registered) {
    let number = await question("📱 Enter your WhatsApp number (234xxxxxxxxxx): ");
    number = number.replace(/[^0-9]/g, "");

    const code = await sock.requestPairingCode(number);
    console.log("\n🔑 Your Pairing Code:", code.match(/.{1,4}/g).join("-"));
  }

  // ===== CONNECTION =====
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log(`✅ ${BOT_NAME} is now connected!`);
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("♻️ Reconnecting...");
        startBot();
      } else {
        console.log("❌ Logged out.");
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ===== MESSAGES =====
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    console.log("📩 Message:", text);

    // ===== COMMANDS =====

    // HI
    if (text.toLowerCase() === "hi") {
      await sock.sendMessage(from, {
        text: `👋 Hello! I'm ${BOT_NAME}\nHow can I help you today?`
      });
    }

    // MENU
    if (text === ".menu") {
      await sock.sendMessage(from, {
        text: `
╭━━━〔 🤖 ${BOT_NAME} 〕━━━⬣
┃ 👋 Welcome!
┃
┃ 📌 Commands:
┃ • hi
┃ • .menu
┃ • .owner
┃ • .ping
┃
┃ ⚡ Status: Online
╰━━━━━━━━━━━━━━⬣
        `
      });
    }

    // OWNER
    if (text === ".owner") {
      await sock.sendMessage(from, {
        text: `👑 Owner:\nhttps://wa.me/${OWNER_NUMBER}`
      });
    }

    // PING
    if (text === ".ping") {
      await sock.sendMessage(from, {
        text: "🏓 Pong! Bot is working perfectly ✅"
      });
    }

    // AUTO REPLY
    if (text.toLowerCase().includes("bot")) {
      await sock.sendMessage(from, {
        text: `🤖 Yes, I'm ${BOT_NAME} and I'm active!`
      });
    }
  });
}

startBot();