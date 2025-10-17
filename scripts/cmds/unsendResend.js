//====================================================//
// Author: Samit (GoatBot v2)
// File: unsendResend.js
// Feature: Detect & resend unsent messages (photo, video, audio, gif, file)
//====================================================//

const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "unsendResend",
  eventType: ["message", "message_unsend"],
  version: "2.4.0",
  author: "Samit (GoatBot)",
  role: 0,
  description: "Detect and resend any unsent message (text, photo, video, audio, gif, etc.)",
  category: "event"
};

// Local message cache
const cache = new Map();

// 🔹 When the bot starts
module.exports.onStart = function () {
  console.log("✅ unsendResend event loaded and ready to detect unsent messages!");
};

// 🔹 When any event happens (message or unsend)
module.exports.onEvent = async function ({ api, event, usersData }) {
  try {
    // Step 1️⃣: Save message to cache
    if (event.type === "message") {
      if (!event.messageID) return;
      cache.set(event.messageID, {
        senderID: event.senderID,
        body: event.body || "",
        attachments: event.attachments || []
      });

      // Limit cache size
      if (cache.size > 600) cache.clear();
    }

    // Step 2️⃣: Detect unsend
    if (event.logMessageType === "message_unsend") {
      const msgData = cache.get(event.messageID);
      if (!msgData) return;

      const senderName = await usersData.getName(msgData.senderID).catch(() => msgData.senderID);
      let msgText = `🚫 ${senderName} just unsent a message!`;

      if (msgData.body) msgText += `\n💬 Message: ${msgData.body}`;

      // Step 3️⃣: Handle attachments
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
              case "file": ext = ".bin"; break;
              default: ext = ".dat";
            }

            const tempPath = path.join(__dirname, `unsend_${Date.now()}${ext}`);
            const res = await axios.get(att.url, {
              responseType: "arraybuffer",
              timeout: 15000
            });

            fs.writeFileSync(tempPath, Buffer.from(res.data));
            files.push(fs.createReadStream(tempPath));
          } catch (err) {
            console.error("⚠️ Error downloading attachment:", err.message);
          }
        }

        // Step 4️⃣: Resend message with attachments
        api.sendMessage(
          { body: msgText, attachment: files },
          event.threadID,
          (err) => {
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
    console.error("🔥 unsendResend error:", err.message);
  }
};
