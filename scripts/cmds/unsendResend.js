//=========================//
//  Author: Samit (GoatBot)
//  Feature: Detect unsent messages and resend them
//=========================//

const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "unsendResend",
  eventType: ["message_unsend"],
  version: "1.2.0",
  author: "Samit (GoatBot)",
  role: 0,
  description: "Detects and re-sends unsent messages, including media",
  category: "event",
};

const cache = new Map(); // Store messages temporarily

// Message listener — store messages
module.exports.onChat = async function ({ event }) {
  if (event.body || (event.attachments && event.attachments.length > 0)) {
    cache.set(event.messageID, {
      body: event.body,
      attachments: event.attachments || [],
      senderID: event.senderID,
    });
  }
};

// When someone unsends
module.exports.onEvent = async function ({ api, event, usersData }) {
  if (event.logMessageType === "message_unsend") {
    const unsent = cache.get(event.messageID);
    if (!unsent) return;

    const senderName = await usersData.getName(unsent.senderID).catch(() => "Unknown User");
    let msg = `🚫 ${senderName} just unsent a message!\n`;

    // If text message
    if (unsent.body) msg += `💬 Message: ${unsent.body}`;

    // If attachments exist
    if (unsent.attachments.length > 0) {
      const attachments = [];

      for (const att of unsent.attachments) {
        try {
          const fileExt =
            att.type === "photo"
              ? ".jpg"
              : att.type === "video"
              ? ".mp4"
              : att.type === "audio"
              ? ".mp3"
              : att.type === "animated_image"
              ? ".gif"
              : ".bin";

          const filePath = path.join(__dirname, `temp_${Date.now()}${fileExt}`);
          const response = await axios.get(att.url, { responseType: "arraybuffer" });
          fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));
          attachments.push(fs.createReadStream(filePath));
        } catch (err) {
          console.log("⚠️ Attachment download failed:", err.message);
        }
      }

      msg += `\n📎 Re-sending ${unsent.attachments.length} attachment(s)...`;
      api.sendMessage({ body: msg, attachment: attachments }, event.threadID, () => {
        // Clean up temp files
        attachments.forEach((stream) => {
          try {
            fs.unlinkSync(stream.path);
          } catch {}
        });
      });
    } else {
      api.sendMessage(msg, event.threadID);
    }

    cache.delete(event.messageID);
  }
};
