const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "unsenddetect",
  version: "2.0.0",
  author: "Samit",
  role: 0,
  description: "Detect and resend unsent messages (text, photo, video, audio)",
  category: "event"
};

const cache = new Map();
let isEnabled = true;

module.exports.onStart = async function ({ message, event, args }) {
  if (args[0] === "on") {
    isEnabled = true;
    return message.reply("✅ Unsend detection is now ON");
  } else if (args[0] === "off") {
    isEnabled = false;
    return message.reply("🚫 Unsend detection is now OFF");
  } else {
    return message.reply("⚙️ Use: unsenddetect on / unsenddetect off");
  }
};

module.exports.onEvent = async function ({ api, event, usersData }) {
  try {
    if (!isEnabled) return;

    // Step 1: Save message to cache
    if (event.type === "message") {
      if (!event.messageID) return;
      cache.set(event.messageID, {
        senderID: event.senderID,
        body: event.body || "",
        attachments: event.attachments || []
      });
      if (cache.size > 600) cache.clear();
    }

    // Step 2: Detect unsend
    if (event.logMessageType === "message_unsend") {
      const msgData = cache.get(event.messageID);
      if (!msgData) return;

      const senderName = await usersData.getName(msgData.senderID).catch(() => msgData.senderID);
      let msgText = `🚫 ${senderName} unsent a message!`;
      if (msgData.body) msgText += `\n💬 ${msgData.body}`;

      // Step 3: Handle attachments
      if (msgData.attachments.length > 0) {
        const files = [];
        for (const att of msgData.attachments) {
          try {
            let ext;
            switch (att.type) {
              case "photo": ext = ".jpg"; break;
              case "video": ext = ".mp4"; break;
              case "audio": ext = ".mp3"; break;
              case "animated_image": ext = ".gif"; break;
              default: ext = ".dat";
            }

            const tempPath = path.join(__dirname, `unsend_${Date.now()}${ext}`);
            const res = await axios.get(att.url, { responseType: "arraybuffer" });
            fs.writeFileSync(tempPath, Buffer.from(res.data));
            files.push(fs.createReadStream(tempPath));
          } catch (err) {
            console.log("⚠️ Attachment download failed:", err.message);
          }
        }

        api.sendMessage(
          { body: msgText, attachment: files },
          event.threadID,
          () => {
            for (const f of files) {
              try { fs.unlinkSync(f.path); } catch {}
            }
          }
        );
      } else {
        api.sendMessage(msgText, event.threadID);
      }

      cache.delete(event.messageID);
    }
  } catch (err) {
    console.error("🔥 unsenddetect error:", err.message);
  }
};
