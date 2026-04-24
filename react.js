export default async function react(message, minato) {
  try {
    await minato.sendMessage(message.key.remoteJid, {
      react: { text: "🥷", key: message.key },
    });
  } catch (e) {
    console.error("Reaction error:", e);
  }
}