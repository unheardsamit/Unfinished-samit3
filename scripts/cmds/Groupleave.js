export default {
  name: "groupLeave",
  async execute(api, event) {
    const leftUserID = event.logMessageData.leftParticipantFbId;
    const threadID = event.threadID;

    try {
      await api.addUserToGroup(leftUserID, threadID);
      api.sendMessage("😎 সদস্য চলে গিয়েছিল, আবার এড করে দিলাম!", threadID);
    } catch (err) {
      api.sendMessage("⚠️ ইউজারকে আবার এড দিতে পারলাম না (সম্ভবত প্রাইভেসি লক)।", threadID);
    }
  }
};
