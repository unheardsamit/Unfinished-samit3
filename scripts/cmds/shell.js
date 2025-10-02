const { exec } = require("child_process");

async function onStart({ message, args }) {
  if (!args.length) return message.reply("⚠️ Please provide a shell command.");

  const a = args.join(" ");
  exec(a, (b, c, d) => {
    if (b) return message.reply("❌ Error: " + b.message);
    if (d) return message.reply("⚠️ Shell: " + d);
    message.reply(c || "✅ Command executed with no output.");
  });
}

module.exports = {
  config: {
    name: "shell",
    aliases: ["sh", "bash"],
    version: "2.0",
    author: "ArYAN",
    role: 2,
    category: "system",
    description: "Run shell commands from chat",
    guide: { en: "{p}{n} <command>" },
    countDown: 5
  },
  onStart
};
