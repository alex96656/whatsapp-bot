import { getCommands } from "../handler.js";
import {
  BotName,
  BotVersion,
  OwnerName,
  MenuImage,
  MenuAudio
} from "../config.js";

export default async function menuCommand(message, minato) {
  try {
    const remoteJid = message.key.remoteJid;
    const pushName = message.pushName || "User";

    const commands = getCommands();

    let commandList = "";
    for (const cmdName of commands.keys()) {
      commandList += `│► ${cmdName}\n`;
    }

    const menuText = `┏──『${BotName} MENU』──

╭─❍ 𝐈𝐍𝐅𝐎𝐒 𝐁𝐎𝐓
│
│ 👋 Welcome ${pushName}
│  
│ • 𝐁𝐨𝐭      : ${BotName} 
│ • 𝐕𝐞𝐫𝐭𝐢𝐨𝐧   : ${BotVersion}
│ • 𝐂𝐫𝐞𝐚𝐭𝐨𝐫  : ${OwnerName}
╰────────────────
╭─❍🍷 𝐌𝐀𝐈𝐍 𝐌𝐄𝐍𝐔 🍷
│
${commandList}
╰────────────────
> ${Footer}
`;

    await minato.sendMessage(remoteJid, {
      image: { url: MenuImage },
      caption: menuText
    });

  } catch (err) {
    console.error("Erreur dans menuCommand:", err);
  }
}