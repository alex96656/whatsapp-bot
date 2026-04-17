const TelegramBot = require("node-telegram-bot-api");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

// BOT INFO
const BOT_NAME = "ᴹᴿ•ᴀʟᴇx-md";
const OWNER_NAME = "ᴹᴿ•ᴀʟᴇx᭄";

// TELEGRAM BOT
const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

function sendToTelegram(text) {
    if (!process.env.TG_CHAT_ID) return;
    bot.sendMessage(process.env.TG_CHAT_ID, text);
}

// COMMAND
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    if (text.startsWith("/pair")) {
        const number = text.split(" ")[1];

        if (!number) {
            return bot.sendMessage(chatId, "Usage: /pair 234xxxxxxxx");
        }

        bot.sendMessage(chatId, "⏳ Generating code...");

        const { state, saveCreds } = await useMultiFileAuthState(`session_${chatId}`);

        const sock = makeWASocket({
            auth: state,
            logger: pino({ level: "silent" })
        });

        sock.ev.on("connection.update", (update) => {
            const { pairingCode } = update;

            if (pairingCode) {
                sendToTelegram(
                    `📱 ${BOT_NAME}\n👨‍💻 ${OWNER_NAME}\n📞 ${number}\n🔑 Code: ${pairingCode}`
                );

                bot.sendMessage(chatId, "✅ Code sent to Telegram");
            }
        });

        await sock.requestPairingCode(number);
        sock.ev.on("creds.update", saveCreds);
    }
});