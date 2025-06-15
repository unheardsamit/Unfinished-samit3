const axios = require("axios");
const fs = require("fs");
const path = require("path");
const request = require("request");

module.exports.config = {
  name: "rndm",
  version: "0.0.1",
  role: 0,
  author: "ArYAN",
  description: "Send a random video by name",
  category: "user",
  noPrefix: true,
  cooldowns: 5
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args.length) {
    return api.sendMessage("⚠️ Please provide a name. Example:\n`rndm Lisa`", threadID, messageID);
  }

  try {
    const name = args.join(" ");
    const query = encodeURIComponent(name);
    const apiUrl = `http://65.109.80.126:20392/random?name=${query}`;

    const res = await axios.get(apiUrl);
    const data = res.data?.data;

    if (!data || !data.url) {
      return api.sendMessage("❌ Could not find video for that name.", threadID, messageID);
    }

    const { url: videoUrl, name: authorName, cp, length: ln } = data;

    // Ensure /cache folder exists
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, "video.mp4");
    const file = fs.createWriteStream(filePath);

    request(videoUrl)
      .pipe(file)
      .on("close", () => {
        api.sendMessage({
          body: `^•^ VIDEO ^•^\n\n🕹️ total video : [${ln}]\n🎀 added by [${authorName}]`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          fs.unlinkSync(filePath); // Clean up
        }, messageID);
      })
      .on("error", err => {
        console.error("Download error:", err);
        return api.sendMessage("📛 Failed to download the video.", threadID, messageID);
      });

  } catch (err) {
    console.error("API fetch error:", err);
    return api.sendMessage("📛 Something went wrong while processing your request.", threadID, messageID);
  }
};
