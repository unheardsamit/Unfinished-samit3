//====================================//
//  Author: Samit (GoatBot v2)
//  Feature: Detect & resend unsent messages
//====================================//

const fs = require("fs");
const path = require("path");
const axios = require("axios"); // GoatBot v2 তে axios আগে থেকেই থাকে

module.exports.config = {
  name: "unsendDetect",
  eventType: ["message", "message_unsend"],
  version: "2.0.0",
  author: "Samit (GoatBot)",
  role: 0,
  description: "Detects deleted/unsent messages and re-sends them",
  category: "event"
};

const messageCache = new Map();

// ✅ Step 1: যখন কেউ মেসেজ পাঠায় → cache এ সংরক্ষণ
module.exports.onEvent = async function ({ api, event, usersData }) {
  // মেসেজ সেভ করা
  if (event.type === "message") {
    if (!event.messageID) return;
    messageCache.set(event.messageID, {
      body: event.body || "",
      attachments: event.attachments || [],
      senderID: event.senderID
    });
    // cache বেশি বড় হলে ক্লিন করো
    if (messageCache.size > 300) messageCache.clear();
  }

  // ✅ Step 2: যখন কেউ আনসেন্ড করে
  if (event.logMessageType === "message_unsend") {
    const data = messageCache.get(event.messageID);
    if (!data) return;

    const sender = await usersData.getName(data.senderID).catch(() => data.senderID);
    let msg = `🚫 ${sender} just unsent a message!`;

    // টেক্সট থাকলে
    if (data.body) msg += `\n💬 Message: ${data.body}`;

    // যদি মিডিয়া থাকে (ছবি, ভিডিও, অডিও ইত্যাদি)
    if (data.attachments.length > 0) {
      const files = [];

      for (const att of data.attachments) {
        try {
          const ext =
            att.type === "photo"
              ? ".jpg"
              : att.type === "video"
              ? ".mp4"
              : att.type === "audio"
              ? ".mp3"
              : att.type === "animated_image"
              ? ".gif"
              : ".bin";
          const filePath = path.join(__dirname, `temp_${Date.now()}${ext}`);

          // axios দিয়ে ফাইল ডাউনলোড
          const res = await axios.get(att.url, { responseType: "arraybuffer" });
          fs.writeFileSync(filePath, Buffer.from(res.data));
          files.push(fs.createReadStream(filePath));
        } catch (err) {
          console.log("⚠️ Failed to download attachment:", err.message);
        }
      }

      // মিডিয়া + মেসেজ পাঠানো
      api.sendMessage({ body: msg, attachment: files }, event.threadID, () => {
        // টেম্প ফাইল ডিলিট
        for (const file of files) {
          try {
            fs.unlinkSync(file.path);
          } catch {}
        }
      });
    } else {
      // শুধু টেক্সট হলে
      api.sendMessage(msg, event.threadID);
    }

    messageCache.delete(event.messageID);
  }
};
