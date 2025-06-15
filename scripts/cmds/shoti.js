const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const request = require("request");
const fs = require("fs");
const path = require("path");

module.exports = {
 config: {
 name: "shoti",
 version: "0.0.1",
 author: "ArYAN",
 countDown: 5,
 role: 0,
 shortDescription: {
 en: "Fetch a Shoti video",
 },
 longDescription: {
 en: "Fetches a Shoti video and sends it to the chat.",
 },
 category: "media",
 guide: {
 en: "Just type !shoti to get a random Shoti video",
 },
 },

 onStart: async function ({ api, event }) {
 const cacheDir = path.join(__dirname, "cache");
 const videoPath = path.join(cacheDir, "shoti.mp4");

 if (!fs.existsSync(cacheDir)) {
 fs.mkdirSync(cacheDir);
 }

 const apiUrl = "https://shotiiapi.vercel.app/v1/shoti";

 try {
 const response = await axios.get(apiUrl);
 const data = response.data;

 if (!data || !data.shotiurl) {
 return api.sendMessage("Failed to fetch Shoti video.", event.threadID, event.messageID);
 }

 const { title, shotiurl, username, nickname, duration, region } = data;

 const file = fs.createWriteStream(videoPath);
 request(shotiurl)
 .pipe(file)
 .on("finish", () => {
 api.sendMessage(
 {
 body: `🎀 𝗦𝗵𝗼𝘁𝗶 𝗩𝗶𝗱𝗲𝗼\n━━━━━━━━━━\n📝 𝗧𝗶𝘁𝗹𝗲: ${title}\n👤 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${username}\n🎯 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${nickname}\n⏳ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${duration} sec\n🌍 𝗥𝗲𝗴𝗶𝗼𝗻: ${region}`,
 attachment: fs.createReadStream(videoPath),
 },
 event.threadID,
 () => fs.unlink(videoPath, () => {}),
 event.messageID
 );
 })
 .on("error", (err) => {
 console.error("Download error:", err);
 api.sendMessage("Failed to download the video.", event.threadID, event.messageID);
 });
 } catch (error) {
 console.error("API error:", error.message);
 api.sendMessage("An error occurred while fetching the video.", event.threadID, event.messageID);
 }
 },
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });