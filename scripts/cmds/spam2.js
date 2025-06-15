module.exports = {
  config: {
    name: "spam",
    aliases: [],
    version: "0.0.1",
    author: "ArYAN",
    category: "fun",
    description: "Send a message multiple times one by one (1–50) and auto-unsend after 20s."
  },

  onStart: async ({ message, args, api, event }) => {
    const count = parseInt(args[args.length - 1]);
    const text = args.slice(0, -1).join(" ");

    if (!text || isNaN(count)) {
      return message.reply("❌ Usage: spam [text] [count 1–50]");
    }

    if (count < 1 || count > 50) {
      return message.reply("⚠️ Count must be between 1 and 50.");
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    for (let i = 0; i < count; i++) {
      const sent = await message.reply(text);
      
      // Unsend after 20 seconds
      setTimeout(() => {
        api.unsendMessage(sent.messageID);
      }, 20000);

      await delay(1000); // 1 second delay between each message
    }
  }
};
