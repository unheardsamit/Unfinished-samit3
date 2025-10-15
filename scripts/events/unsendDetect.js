//=========================//
//  Author: Samit (GoatBot)
//  Feature: Detect unsent message
//=========================//

module.exports.config = {
  name: "unsendDetect",
  eventType: ["message_unsend"],
  version: "1.0.0",
  author: "Samit (GoatBot)",
  role: 0,
  description: "Detects and reveals unsent messages in the chat",
  category: "event",
};

const cache = new Map(); // store messages before unsend

module.exports.onStart = async function () {};

// Message listener
module.exports.onChat = async function ({ event }) {
  if (event.body && event.messageID)
    cache.set(event.messageID, {
      body: event.body,
      attachments: event.attachments || [],
      senderID: event.senderID,
    });
};

// When someone unsends
module.exports.onEvent = async function ({ api, event, usersData }) {
  if (event.logMessageType === "message_unsend") {
    const unsent = cache.get(event.messageID);
    if (!unsent) return;

    const senderName = await usersData.getName(unsent.senderID).catch(() => "Unknown User");
    let msg = `🚫 ${senderName} just unsent a message!\n`;

    if (unsent.body) msg += `💬 Message: ${unsent.body}`;
    else if (unsent.attachments.length > 0)
      msg += `📎 They unsent a media file (${unsent.attachments[0].type}).`;
    else msg += `❌ (Message not found in cache)`;

    api.sendMessage(msg, event.threadID);
    cache.delete(event.messageID);
  }
};
