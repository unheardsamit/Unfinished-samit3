const axios = require("axios");

module.exports.config = {
  name: "add",
  version: "1.0.0",
  role: 0, // user permission level
  author: "ArYAN",
  description: "Reply to a video and give a name to add it",
  category: "user",
  cooldowns: 5
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;

  if (args.length !== 1) {
    return api.sendMessage(
      "Invalid usage.\nReply to 1 video then type:\nadd <your name>",
      threadID,
      messageID
    );
  }

  try {
    const apis = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
    const apiUrl = apis.data.api;

    if (!messageReply?.attachments?.length) {
      return api.sendMessage('Please reply to a video file.', threadID, messageID);
    }

    const videoAttachments = messageReply.attachments.filter(att => att.type === 'video');

    if (videoAttachments.length === 0) {
      return api.sendMessage('The reply must contain a video file.', threadID, messageID);
    }

    const uploadedVideos = await Promise.all(videoAttachments.map(async (video) => {
      const encodedUrl = encodeURIComponent(video.url.replace(/\s/g, ''));
      const imgurRes = await axios.get(`${apiUrl}/imgur?url=${encodedUrl}`);
      return imgurRes.data.link;
    }));

    const name = args.join(' ');
    const finalUrl = `${apiUrl}/mixadd?name=${encodeURIComponent(name)}&url=${encodeURIComponent(uploadedVideos.join('\n'))}`;
    const res = await axios.get(finalUrl);

    const { data } = res.data;
    const messageBody = `✅ Video URL added successfully\n🎀 Name: ${data.name}\n⚙️ URL: ${data.url}`;

    return api.sendMessage({ body: messageBody }, threadID, messageID);
  } catch (error) {
    console.error("Add command error:", error);
    return api.sendMessage("📛 An error occurred while processing your request.", threadID, messageID);
  }
};
