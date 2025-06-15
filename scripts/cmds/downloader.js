const { GoatWrapper } = require("fca-liane-utils");
module.exports = {
 config: {
 name: "download",
 version: "0.0.1",
 author: "ArYAN",
 countDown: 5,
 role: 0,
 shortDescription: "all media downloaded",
 longDescription: {
 en: ".",
 },
 category: "Download",
 guide: {
 en: "{prefix} <reply with img or vid>",
 },
 },

 onStart: async function ({ api, event, getText }) {
 const { messageReply } = event;

 if (event.type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length !== 1) {
 return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);
 }

 return api.sendMessage(messageReply.attachments[0].url, event.threadID, event.messageID);
 }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });