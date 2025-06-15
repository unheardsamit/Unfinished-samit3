const { GoatWrapper } = require("fca-liane-utils");
module.exports = {
  config: {
    name: "uid",
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "Uid for Facebook and messenger",
    longDescription: "UID",
    category: "UID",
    cooldowns: 5
  },

  onStart: async function({ api, event, usersData }) {
    let uid;

    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else {
      uid = event.senderID;
    }

    try {
      
      let name = await usersData.getName(uid);
      const msg = `${uid}`;

      await api.shareContact(msg, uid, event.threadID);

      let avt;
      if (event.messageReply) {
        avt = await usersData.getAvatarUrl(event.messageReply.senderID);
      } else if (event.attachments && event.attachments[0] && event.attachments[0].target && event.attachments[0].target.id) {
        avt = await usersData.getAvatarUrl(event.attachments[0].target.id);
      } else {
        avt = await usersData.getAvatarUrl(uid);
      }


      if (!avt) {
        throw new Error("Avatar URL not found.");
      }


      const attachment = await global.utils.getStreamFromURL(avt);
      if (!attachment) {
        throw new Error("Failed to fetch the avatar image.");
      }

      await api.sendMessage({ body: "", attachment: attachment }, event.threadID);

      api.sendMessage("Contact shared successfully.", event.threadID, event.messageID);
    } catch (error) {
    	
      api.sendMessage("Error sharing contact: " + error.message, event.threadID, event.messageID);
    }
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });