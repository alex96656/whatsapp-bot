const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

function sendTelegramMessage(text) {
    bot.sendMessage(process.env.TG_CHAT_ID, text);
}

module.exports = { sendTelegramMessage };