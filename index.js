const TelegramBot = require("node-telegram-bot-api");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

// =====================
// BOT BRAND INFO
// =====================
const BOT_NAME = "ᴹᴿ•ᴀʟᴇx-md";
const OWNER_NAME = "ᴹᴿ•ᴀʟᴇx᭄";

// =====================
// TELEGRAM SETUP
// =====================
const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

// =====================
// TELEGRAM COMMAND
// =====================
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    // =====================
    // /pair COMMAND
    // =====================
    if (text.startsWith("/pair")) {
        const number = text.split(" ")[1];

        if (!number) {
            return bot.sendMessage(
                chatId,
                `❌ Usage: /pair 234xxxxxxxx\n\n🤖 Bot: ${BOT_NAME}`
            );
        }

        bot.sendMessage(
            chatId,
            `⏳ Generating pairing code...\n🤖 Bot: ${BOT_NAME}\n👨‍💻 Owner: ${OWNER_NAME}`
        );

        try {
            const { state, saveCreds } = await useMultiFileAuthState(`session_${chatId}`);

            const sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" })
            });

            sock.ev.on("connection.update", async (update) => {
                const { connection, pairingCode } = update;

                if (pairingCode) {
                    bot.sendMessage(
                        chatId,
                        `📱 *${BOT_NAME}*\n\n👨‍💻 Owner: ${OWNER_NAME}\n\n📞 Number: ${number}\n🔑 Code: ${pairingCode}`,
                        { parse_mode: "Markdown" }
                    );
                }

                if (connection === "open") {
                    bot.sendMessage(
                        chatId,
                        `✅ WhatsApp Connected Successfully!\n🤖 ${BOT_NAME}`
                    );
                }
            });

            await sock.requestPairingCode(number);

            sock.ev.on("creds.update", saveCreds);

        } catch (err) {
            console.log(err);
            bot.sendMessage(
                chatId,
                `❌ Error generating pairing code\n🤖 ${BOT_NAME}`
            );
        }
    }
});