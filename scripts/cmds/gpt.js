const axios = require('axios');

module.exports.config = {
  name: "gpt",
  version: "0.0.1",
  role: 0,
  author: "ArYAN",
  description: "Gemini AI",
  category: "general",
  cooldowns: 2,
  hasPrefix: false,
};

const API_SERVER_URL = 'https://xyz-gemini-pi.vercel.app/aryan/gemini';

module.exports.onStart = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const question = args.join(' ').trim();

  if (!question) {
    return api.sendMessage("⚠️ Please provide your question.", threadID, messageID);
  }

  try {
    const response = await axios.get(`${API_SERVER_URL}?prompt=${encodeURIComponent(question)}`);

    if (response.data.error) {
      return api.sendMessage(`❌ Error: ${response.data.error}`, threadID, messageID);
    }

    const geminiAnswer = response.data.response;

    if (geminiAnswer) {
      return api.sendMessage(geminiAnswer, threadID, messageID);
    } else {
      return api.sendMessage("❌ Something went wrong. Please try again.", threadID, messageID);
    }
  } catch (error) {
    console.error('Gemini API Error:', error.response ? error.response.data : error.message);
    return api.sendMessage("📛 Failed to get a response from Gemini.", threadID, messageID);
  }
};
