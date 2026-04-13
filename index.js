const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const owner = {
  name: "ᴹᴿ•ᴀʟᴇx᭄",
  number: "YOUR_NUMBER_HERE"
}

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("./auth")

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("messages.upsert", async ({ messages }) => {

    const msg = messages[0]
    if (!msg.message) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    const sender = msg.key.remoteJid

    // 🌟 Simple menu command
    if (text === ".menu") {
      await sock.sendMessage(sender, {
        text: `
🤖 BOT MENU

👤 Owner: ${owner.name}
📞 Number: ${owner.number}

Commands:
.menu - show menu
.ping - test bot
        `
      })
    }

    // 🟢 Ping test
    if (text === ".ping") {
      await sock.sendMessage(sender, { text: "🏓 Pong!" })
    }

  })

}

startBot()