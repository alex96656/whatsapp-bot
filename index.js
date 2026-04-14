const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(text) {
  return new Promise((resolve) => rl.question(text, resolve))
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  // Save session
  sock.ev.on("creds.update", saveCreds)

  // Pairing code login
  if (!sock.authState.creds.registered) {
    const phoneNumber = await question("Enter your WhatsApp number (e.g 234703xxxxxxx): ")

    const code = await sock.requestPairingCode(phoneNumber)
    console.log("Your Pairing Code:", code)
  }

  sock.ev.on("connection.update", (update) => {
    const { connection } = update

    if (connection === "open") {
      console.log("Bot connected successfully ✅")
    }

    if (connection === "close") {
      console.log("Connection closed, restarting...")
      startBot()
    }
  })
}

startBot()