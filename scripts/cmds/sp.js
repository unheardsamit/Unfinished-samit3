const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Tesseract = require("tesseract.js");

module.exports = {
  config: {
    name: "sp",
    aliases: [],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Extract text from a replied image"
    },
    longDescription: {
      en: "Reply to a photo and use this command to read the text inside the image"
    },
    category: "tools",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event }) {
    const { messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("❌ Please reply to an image.");
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return message.reply("❌ This command only works on image replies.");
    }

    const imgUrl = attachment.url;
    const imgPath = path.join(__dirname, "cache", `${Date.now()}.jpg`);

    try {
      const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.ensureDirSync(path.dirname(imgPath));
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      // Send scanning message and save messageID for unsend
      const scanningMsg = await message.reply("⏳ Scanning image for text...");

      // Start OCR processing
      const result = await Tesseract.recognize(imgPath, "eng");
      const text = result.data.text.trim();
      fs.unlinkSync(imgPath);

      // Unsending the scanning message 1 second before sending the result
      setTimeout(() => {
        message.unsend(scanningMsg.messageID).catch(() => {});
      }, 0);  // 0 ms delay to unsend immediately after OCR done

      if (!text) {
        return message.reply("❌ No text found in the image.");
      }

      // Format text nicely with bullet points and emojis
      const formattedText = text
        .split("\n")
        .filter(line => line.trim())
        .map(line => `• ${line.trim()}`)
        .join("\n");

      const responseText = `✅ 𝗧𝗲𝘅𝘁 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝗶𝗺𝗮𝗴𝗲:\n\n${formattedText}`;

      return message.reply(responseText);
    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to process the image.");
    }
  }
};
