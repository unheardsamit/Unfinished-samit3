module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    description: "Show how long the bot has been running.",
    usage: "",
    cooldown: 3,
    author: "ArYAN",
    version: "0.0.1"
  },

  onStart: async function ({ message }) {
    const totalSeconds = Math.floor(process.uptime());

    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const reply =
`⏱️ Bot Uptime
• ${days} days
• ${hours} hours
• ${minutes} minutes
• ${seconds} seconds`;

    return message.reply(reply);
  }
};
