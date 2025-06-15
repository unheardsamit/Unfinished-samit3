const axios = require("axios");

const apiURL = "https://smfahim.xyz/gedit";

module.exports = {
  config: {
    name: "edits",
    version: "0.0.1",
    author: "ArYAN",
    description: "Edit images using Edit-AI (reply to an image).",
    usage: "reply image → refine [prompt]",
    cooldown: 5,
    category: "ai",
    hasPrefix: false
  },

  onStart: async function ({ api, event, args }) {
    const imgURL = event.messageReply?.attachments?.[0]?.url;
    const prompt = args.join(" ") || "What is this";

    if (!imgURL) {
      return api.sendMessage(
        "❌ Please reply to an image to edit it.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const res = await axios.get(
        `${apiURL}?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imgURL)}`,
        { responseType: "stream", validateStatus: () => true }
      );

      if (res.headers["content-type"]?.startsWith("image/")) {
        return api.sendMessage(
          { attachment: res.data },
          event.threadID,
          event.messageID
        );
      }

      let raw = "";
      for await (const chunk of res.data) raw += chunk;
      const data = JSON.parse(raw || "{}");

      if (data.response) {
        return api.sendMessage(data.response, event.threadID, event.messageID);
      }

      return api.sendMessage(
        "❌ No valid response from the API.",
        event.threadID,
        event.messageID
      );
    } catch (e) {
      console.error("Refine error:", e);
      return api.sendMessage(
        "❌ Failed to process your request. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
