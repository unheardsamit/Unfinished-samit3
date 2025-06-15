const toBold = (text) => {
  const map = {
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝",
    K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧",
    U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
    k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁",
    u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇"
  };
  return [...text].map(c => map[c] || c).join("");
};

const toSans = (text) => {
  const map = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃",
    k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍",
    u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓"
  };
  return [...text].map(c => map[c] || c).join("");
};

module.exports = {
  config: {
    name: "help",
    aliases: ["he"],
    version: "0.0.1",
    author: "ArYAN",
    description: "Show all commands or info about a specific one",
    category: "system",
    guide: "{pn}\n{pn} [command name]\n{pn} -[letter]"
  },

  onStart: async function ({ args, message }) {
    const commands = global.GoatBot.commands;
    const allCommands = Array.from(commands.values());

    if (args[0] && commands.has(args[0].toLowerCase())) {
      const cmd = commands.get(args[0].toLowerCase());
      const cfg = cmd.config;

      const guideText = typeof cfg.guide === "string"
        ? cfg.guide.replace(/{pn}/g, global.GoatBot.config.prefix + cfg.name).replace(/\n/g, "\n  • ")
        : `${global.GoatBot.config.prefix}${cfg.name}`;

      const replyMsg = 
        `🔍 ${toBold("Command Info")}: *${toBold(cfg.name)}*\n\n` +
        `📚 ${toBold("Description")}:\n  ${toSans(cfg.description || "No description provided.")}\n\n` +
        `🛠️ ${toBold("Usage")}:\n  • ${toSans(guideText)}\n\n` +
        `📂 ${toBold("Category")}: ${toSans(cfg.category || "Unknown")}\n` +
        `👤 ${toBold("Author")}: ${toSans(cfg.author || "Unknown")}\n` +
        `🆚 ${toBold("Version")}: ${toSans(cfg.version || "1.0.0")}`;

      return message.reply(replyMsg);
    }

    if (args[0]?.startsWith("-") && args[0].length === 2) {
      const letter = args[0][1].toLowerCase();
      const filteredCommands = allCommands.filter(cmd => cmd.config.name.toLowerCase().startsWith(letter));

      if (filteredCommands.length === 0)
        return message.reply(`❌ ${toSans(`No commands start with '${letter.toUpperCase()}'`)}`);

      let msg = `📖 ${toBold(`Commands with '${letter.toUpperCase()}'`)}:\n\n`;
      filteredCommands.forEach(cmd => {
        msg += `📁 ${toSans(cmd.config.name)}\n`;
      });

      return message.reply(msg.trim());
    }

    const categories = {};

    for (const cmd of allCommands) {
      const catRaw = cmd.config.category || "uncategorized";
      const cat = catRaw.charAt(0).toUpperCase() + catRaw.slice(1).toLowerCase();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    let fullMsg = "";
    for (const cat in categories) {
      fullMsg += `📁 ${toBold(cat)} — ${toSans(categories[cat].length + " cmds")}\n`;
    }

    fullMsg += `\n${toSans("Type: help [command name] to get more info")}\n${toSans("Example: help ping")}\n`;
    fullMsg += `\n${toSans("Type: help -f tryp for available all commands")}`;

    return message.reply(fullMsg.trim());
  }
};
