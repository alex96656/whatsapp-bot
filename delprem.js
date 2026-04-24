import { delPremium, getAllPremium } from "../database/premium.js";

export default async function delpremCommand(message, minato, { sender, args, isCreator }) {
  if (!isCreator) {
    return obito.sendMessage(message.key.remoteJid, {
      text: "❌ Only the creator can remove a Premium user.",
    });
  }

  const target = args[0]?.replace(/[^0-9]/g, "");
  if (!target) {
    return minato.sendMessage(message.key.remoteJid, {
      text: "❌ Example: *.delprem 2420700000000*",
    });
  }

  const removed = delPremium(target);
  if (!removed) {
    return minato.sendMessage(message.key.remoteJid, {
      text: `⚠️ The user ${target} was not a Premium user.`,
    });
  }

  const allPrem = getAllPremium().length;
  await minato.sendMessage(message.key.remoteJid, {
    text: `✅ User *${target}* removed from the Premium list. 👑 Total Premium remaining: ${allPrem}`,
  });
}