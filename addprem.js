import { addPremium, getAllPremium } from "../database/premium.js";

export default async function addpremCommand(message, minato, { sender, args, isCreator }) {
  if (!isCreator) {
    return minato.sendMessage(message.key.remoteJid, {
      text: "❌ Only the creator can add a Premium user.",
    });
  }

  const target = args[0]?.replace(/[^0-9]/g, "");
  if (!target) {
    return minato.sendMessage(message.key.remoteJid, {
      text: "❌ Exemple : *.addprem 2420700000000*",
    });
  }

  const added = addPremium(target);
  if (!added) {
    return minato.sendMessage(message.key.remoteJid, {
      text: `⚠️ The user ${target} is already a Premium user.`,

});
  }

  const allPrem = getAllPremium().length;
  await minato.sendMessage(message.key.remoteJid, {
    text: `✅ User *${target}* added to the Premium list. 👑 Total Premium: ${allPrem}`,
  });
}