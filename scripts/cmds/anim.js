const axios = require('axios');
const { getStreamFromURL } = global.utils;

const xyz = "ArYAN";

module.exports = {
  config: {
    name: "ghibli",
    aliases: ["art"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 10,
    role: 2,
    shortDescription: "Anime transformation",
    longDescription: "Convert photos to anime-style artwork",
    category: "Art",
    guide: {
      en: "{pn} [reply to image]"
    }
  },

  onStart: async function ({ api, message, event }) {
    try {
      const attachment = event.messageReply?.attachments?.[0];
      if (!attachment?.url || attachment.type !== "photo") {
        return message.reply("❌ Please reply to an image (photo)!");
      }

      const imageUrl = attachment.url;
      const waitMessage = await message.reply("⏳ Generating your image art...");

      const apiEndpoint = `https://aryan-xyz-ghibli.vercel.app/ghibli?image=${encodeURIComponent(imageUrl)}&apikey=${xyz}`;
      const { data } = await axios.get(apiEndpoint);

      if (!data?.image) {
        return message.reply("❌ Could not generate image. Try again later.");
      }

      const imageStream = await getStreamFromURL(data.image);

      await message.reply({
        body: "✅ Here's your Ghibli-style image 🎨",
        attachment: imageStream
      });

      await api.unsendMessage(waitMessage.messageID);

    } catch (err) {
      console.error("Ghibli Command Error:", err);
      message.reply("❌ Something went wrong. Try again with a different image.");
    }
  }
};
