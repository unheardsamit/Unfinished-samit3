const { GoatWrapper } = require("fca-liane-utils");
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'tidinfo',
    version: '0.0.1',
    role: 0,
    author: 'ArYAN',
    category: 'thread',
    shortDescription: {
      en: 'Get the thread ID and invite link',
    },
    longDescription: {
      en: 'Get the thread ID and invite link of the current thread.',
    },
  },
  onStart: async function ({ api, event, args, message }) {
    try {
      const threadID = event.threadID;
      const threadInfo = await api.getThreadInfo(threadID);
      const threadName = threadInfo.threadName || 'Unnamed Thread';
      const threadImage = threadInfo.imageSrc;
      const threadLink = `https://www.facebook.com/messages/t/${threadID}`;
      const threadapprovalMode = threadInfo.approvalMode ? "✅ On" : "❌ Off";
      const threademoji = threadInfo.emoji || "N/A";
      const threadcolor = threadInfo.color || "N/A";
      const threadmessageCount = threadInfo.messageCount || "Unknown";
      let inviteLink;
      

      if (threadInfo.inviteLink && threadInfo.inviteLink.enable) {
        inviteLink = threadInfo.inviteLink.link;
      } else if (threadInfo.inviteLink) {
        inviteLink = 'Invite link feature is disabled for this group.';
      } else {
        inviteLink = 'Invite link not available.';
      }

      // Prepare the base message
      let threadIDMessage = `${threadName}\n♻️ 𝗧𝗜𝗗: ${threadID}\n📨 𝗠𝘀𝗴 𝗰𝗼𝘂𝗻𝘁: ${threadmessageCount}\n🎨 𝗧𝗵𝗲𝗺𝗲: ${threadcolor}\n🏷️ 𝗘𝗺𝗼𝗷𝗶: ${threademoji}\n🛡 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹: ${threadapprovalMode}\n⚙️ 𝗹𝗶𝗻𝗸: ${inviteLink}`;

      if (threadImage) {
        // Fetch the thread image
        const response = await axios.get(threadImage, { responseType: 'arraybuffer' });
        const imagePath = path.resolve(__dirname, 'threadImage.jpg');
        fs.writeFileSync(imagePath, response.data);

        // Send message with image attachment
        await api.sendMessage(
          {
            body: threadIDMessage,
            attachment: fs.createReadStream(imagePath)
          },
          threadID
        );

        // Remove the temporary image file
        fs.unlinkSync(imagePath);
      } else {
        // Send message without image attachment
        message.reply(threadIDMessage);
      }
    } catch (error) {
      console.error("Error fetching thread info:", error);
      message.reply("An error occurred while retrieving thread information. Please try again later.");
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
