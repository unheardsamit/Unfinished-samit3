const fs = require("fs");
const path = __dirname + "/unsendData.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));
let unsendData = JSON.parse(fs.readFileSync(path));

module.exports = {
  config: {
    name: "unsenddetect",
    aliases: ["unsdct"],
    version: "1.0",
    author: "samit",
    countDown: 5,
    role: 0,
    shortDescription: "Detect unsent messages",
    longDescription: "Detect and resend messages that users unsend in the group chat.",
    category: "utility",
    guide: "{pn} on | off"
  },

  onStart: async function ({ message, even
