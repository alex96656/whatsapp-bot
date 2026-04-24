import {
  BotName
} from "../config.js";

export default async function pingCommand(message, minato) {
  const remoteJid = message.key.remoteJid;
  const start = Date.now();

  await minato.sendMessage(remoteJid, { text: "_🏓 Pong!_" });
  const latency = Date.now() - start;

  await minato.sendMessage(remoteJid, {
    text: `_${BotName} speed: ${latency} ms_`,
  });
}