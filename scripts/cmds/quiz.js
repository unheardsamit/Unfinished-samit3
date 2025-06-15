const { GoatWrapper } = require("fca-liane-utils");
const axios = require('axios');

const BASE_URL = 'https://quixapii.onrender.com/api';

module.exports = {
  config: {
    name: "qz",
    aliases: ["quiz","game"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 0, 
    role: 0,
    longDescription: { 
      en: "Play quiz game in multiple categories with enhanced features" 
    },
    category: "economy",
    guide: {
      en: `📚 𝗤𝘂𝗶𝘇 𝗚𝘂𝗶𝗱𝗲
━━━━━━━━━━━━━
🎮 𝗣𝗹𝗮𝘆 𝗚𝗮𝗺𝗲𝘀:
{pn} <category> - Start quiz in specific category
{pn} torf - Play True/False quiz
{pn} flag - Play Flag Guessing quiz
━━━━━━━━━━━━━
🎮 𝗣𝗹𝗮𝘆 Ｑｕ𝗶ｚ:
{pn} <category> - Start quiz in specific category
{pn} torf - Play True/False quiz

📊 𝗦𝘁𝗮𝘁𝗶𝘀𝘁𝗶𝗰𝘀:
{pn} rank - View your detailed stats
{pn} leaderboard - View global rankings

ℹ️ 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻:
{pn} categories - List all categories`
    }
  },

  langs: {
    en: {
      reply: "🎯 𝗤𝘂𝗶𝘇\n━━━━━━━━━━━━━\n\n📚 𝖢𝖺𝗍𝖾𝗀𝗈𝗋𝗒: {category}\n❓ 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: {question}\n\n{options}\n\n⏰ 𝖸𝗈𝗎 𝗁𝖺𝗏𝖾 30 𝗌𝖾𝖼𝗈𝗇𝖽𝗌 𝗍𝗈 𝖺𝗇𝗌𝗐𝖾𝗋 𝗋𝖾𝗉𝗅𝗒 𝗐𝗂𝗍𝗁 (A/B/C/D):",
      torfReply: "⚙ 𝗤𝘂𝗶𝘇 ( True/False )\n━━━━━━━━━━━━━\n\n💭 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: {question}\n\n😆: True\n😮: False",
      correctMessage: "🎯 𝗤𝘂𝗶𝘇\n━━━━━━━━━━━━━\n\n🎉 𝖢𝗈𝗋𝗋𝖾𝖼𝗍 𝖠𝗇𝗌𝗐𝖾𝗋!\n✅ 𝖲𝖼𝗈𝗋𝖾: {correct}/{total}\n🏆 𝖱𝖺𝗇𝗄: {position}\n🔥 𝖲𝗍𝗋𝖾𝖺𝗄: {streak}",
      wrongMessage: "🎯 𝗤𝘂𝗶𝘇\n━━━━━━━━━━━━━\n\n❌ 𝖮𝗉𝗌 𝗐𝗋𝗈𝗇𝗀 𝖺𝗇𝗌𝗐𝖾𝗋!\n𝖢𝗈𝗋𝗋𝖾𝖼𝗍 𝖺𝗇𝗌𝗐𝖾𝗋 𝗂𝗌: {correctAnswer}\n📊 𝖲𝖼𝗈𝗋𝖾: {correct}/{total}",
      timeoutMessage: "⏰ 𝖳𝗂𝗆𝖾'𝗌 up! 𝖳𝗁𝖾 𝖼𝗈𝗋𝗋𝖾𝖼𝗍 𝖺𝗇𝗌𝗐𝖾𝗋 𝗐𝖺𝗌: {correctAnswer}"
    }
  },

  generateProgressBar(percentile) {
    const filled = Math.round(percentile / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  },


  onStart: async function ({ message, event, args, commandName, getLang, api, usersData }) {
    try {
      const command = args[0]?.toLowerCase();

      if (!args[0]) {
        return await this.handleCategories(message, getLang);
      }

      switch (command) {
        case "rank":
          return await this.handleRank(message, event, getLang, api);
        case "leaderboard":
          return await this.handleLeaderboard(message, getLang, args.slice(1));
        case "torf":
          return await this.handleTrueOrFalse(message, event, commandName, api);
        default:
          return await this.handleQuiz(message, event, args, commandName, getLang, api, usersData);
      }
    } catch (err) {
      console.error("Quiz start error:", err);
      return message.reply("⚠️ Error occurred, try again.");
    }
  },

    async handleRank(message, event, getLang, api) {
  try {
    const res = await axios.get(`${BASE_URL}/user/${event.senderID}`);
    const user = res.data;

    if (!user || user.total === 0) {
      return message.reply("❌ You haven't played any quiz yet!");
    }

    let userName = "Unknown User";
    try {
      const userInfo = await api.getUserInfo(event.senderID);
      userName = userInfo[event.senderID]?.name || "Unknown User";
    } catch (error) {
      console.warn("User info fetch failed:", error);
    }

    const position = user.position ?? "N/A";
    const totalUser = user.totalUsers ?? "N/A";
    const progressBar = this.generateProgressBar(user.percentile ?? 0);

    const achievementIcons = {
      QuizChampion: "👑",
      Perfectionist: "💯",
      Speedster: "⚡",
      Veteran: "🎖️"
    };

    const badges = (user.achievements || [])
      .map(ach => achievementIcons[ach] || "")
      .filter(Boolean)
      .join(" ");

    return message.reply(
      `🎮 𝗤𝘂𝗶𝘇 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 ${badges}\n━━━━━━━━━━━━━\n\n` +
      `👤 ${userName}\n` +
      `🏆 𝖦𝗅𝗈𝖻𝖺𝗅 𝖱𝖺𝗇𝗄: ${position}/${totalUser}\n` +
      `📈 𝖯𝖾𝗋𝖼𝖾𝗇𝗍𝗂𝗅𝖾: ${progressBar} ${user.percentile ?? 0}%\n\n` +
      `📊 𝗦𝘁𝗮𝘁𝗶𝘀𝘁𝗶𝗰𝘀\n` +
      `✅ 𝖢𝗈𝗋𝗋𝖾𝖼𝗍: ${user.correct ?? 0}\n` +
      `❌ 𝖶𝗋𝗈𝗇𝗀: ${user.wrong ?? 0}\n` +
      `📝 𝖳𝗈𝗍𝖺𝗅 𝖯𝗅𝖺𝗒𝖾𝖽: ${user.total ?? 0}\n` +
      `⚡ 𝖠𝗏𝗀 𝖱𝖾𝗌𝗉𝗈𝗇𝗌𝖾: ${(user.avgResponseTime ?? 0).toFixed(1)}s\n\n` +
      `🎯 𝗣𝗿𝗼𝗴𝗿𝗲𝘀𝘀\n` +
      `📊 𝖠𝖼𝖼𝗎𝗋𝖺𝖼𝗒: ${user.accuracy ?? 0}%\n` +
      `🔥 𝖢𝗎𝗋𝗋𝖾𝗇𝗍 𝖲𝗍𝗋𝖾𝖺𝗄: ${user.currentStreak ?? 0}\n` +
      `🏅 𝖡𝖾𝗌𝗍 𝖲𝗍𝗋𝖾𝖺𝗄: ${user.bestStreak ?? 0}\n` +
      `🎯 𝖭𝖾𝗑𝗍 𝖱𝖺𝗇𝗄: ${user.nextMilestone || "N/A"}`
    );
  } catch (err) {
    console.error("Rank error:", err);
    return message.reply("⚠️ Could not fetch rank. Please try again later.");
  }
},

  getNextRankProgress(correct) {
    if (correct >= 50) return "Maximum Rank Achieved! 👑";
    if (correct >= 25) return `${50 - correct} correct answers to Quiz Champion`;
    if (correct >= 10) return `${25 - correct} correct answers to Quiz Master`;
    return `${10 - correct} correct answers to Quiz Pro`;
  },

  async handleLeaderboard(message, getLang, args) {
    try {
      const limit = 10;
      const page = parseInt(args?.[0]) || 1;
      const timeframe = args?.[1] || 'all';

      if (page < 1) {
        return message.reply("⚠️ Invalid page number. Please use a positive number.");
      }

      const res = await axios.get(`${BASE_URL}/leaderboards?page=${page}&limit=${limit}&timeframe=${timeframe}`);
      const { rankings, stats, pagination, categoryStats } = res.data;

      const timeframeText = {
        all: "All Time",
        daily: "Today's",
        weekly: "This Week's",
        monthly: "This Month's"
      }[timeframe];

      const achievementIcons = {
        "Quiz Novice": "🌱",
        "Quiz Legend": "👑",
        "Streak Master": "🔥",
        "Speed Demon": "⚡",
        "Perfect Scorer": "💯",
        "Quiz God": "🌟"
      };

      const topPlayers = rankings.map((u, i) => {
        const position = pagination.currentPage === 1 ? i + 1 : (pagination.currentPage - 1) * limit + i + 1;
        const acc = Math.round((u.correct / (u.total || 1)) * 100);
        const crown = position === 1 ? "👑" : position === 2 ? "🥈" : position === 3 ? "🥉" : "🏅";
        return `${crown} ${position}. ${u.name || 'Anonymous'}\n🆔 𝖴𝗌𝖾𝗋𝖨𝖣: ${u.userId}\n📚 𝖯𝗅𝖺𝗒𝖾𝖽 𝖦𝖺𝗆𝖾𝗌: ${u.total}\n✅ 𝖢𝗈𝗋𝗋𝖾𝖼𝗍: ${u.correct}/${u.total} (${acc}% accuracy)\n❌ 𝖶𝗋𝗈𝗇𝗀: ${u.wrong}\n🔥 𝖲𝗍𝗋𝖾𝖺𝗄: ${u.currentStreak || 0}\n🥇 𝖡𝖾𝗌𝗍 𝖲𝗍𝗋𝖾𝖺𝗄: ${u.bestStreak || 0}`;
      }).join('\n\n');

      const globalStats = `📊 𝗚𝗹𝗼𝗯𝗮𝗹 𝗦𝘁𝗮𝘁𝘀\n` +
        `🎮 𝖳𝗈𝗍𝖺𝗅 𝖯𝗅𝖺𝗒𝖾𝗋𝗌: ${stats.totalUsers}\n` +
        `📝 𝖳𝗈𝗍𝖺𝗅 𝖰𝗎𝖾𝗌𝗍𝗂𝗈𝗇𝗌: ${stats.totalQuestions}\n` +
        `✨ 𝖳𝗈𝗍𝖺𝗅 𝖠𝗇𝗌𝗐𝖾𝗋𝖾𝖽: ${stats.totalAnswered}`;

      const paginationInfo = `\n\n📖 𝗣𝗮𝗴𝗲 ${pagination.currentPage}/${pagination.totalPages}\n` +
        `Use {p}quiz leaderboard <page> to view more`;

      return message.reply(`🏆 𝗤𝘂𝗶𝘇 𝗟𝗲𝗮𝗱𝗲𝗿𝗯𝗼𝗮𝗿𝗱\n━━━━━━━━━━━━━\n\n${topPlayers}\n\n${globalStats}${paginationInfo}`);
    } catch (err) {
      console.error("Leaderboard error:", err);
      return message.reply("⚠️ Could not fetch leaderboard.");
    }
  },

  async handleCategories(message, getLang) {
    try {
      const res = await axios.get(`${BASE_URL}/categories`);
      const catText = res.data.map(c => `📍 ${c.charAt(0).toUpperCase() + c.slice(1)}`).join("\n");
      return message.reply(`📚 𝗤𝘂𝗶𝘇 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝗶𝗲𝘀\n━━━━━━━━━━━━━\n\n${catText}\n━━━━━━━━━━━━━\n\n{p}quiz <category> - to start a quiz\n{p}quiz torf - to play True/False\n{p}quiz rank - to show your rank\n{p}quiz leaderboard - to show global rank data`);
    } catch (err) {
      console.error("Categories error:", err);
      return message.reply("⚠️ Could not fetch categories.");
    }
  },

  async handleTrueOrFalse(message, event, commandName, api) {
    try {
      const res = await axios.get(`${BASE_URL}/question?category=torf`);
      const { _id, question, answer } = res.data;

      const info = await message.reply(this.langs.en.torfReply.replace("{question}", question));

      global.GoatBot.onReaction.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID,
        answer: answer === "True",
        reacted: false,
        reward: this.envConfig.reward,
        questionId: _id,
        startTime: Date.now()
      });

      setTimeout(() => {
        const reaction = global.GoatBot.onReaction.get(info.messageID);
        if (reaction && !reaction.reacted) {
          message.reply(this.langs.en.timeoutMessage.replace("{correctAnswer}", answer));
          message.unsend(info.messageID);
          global.GoatBot.onReaction.delete(info.messageID);
        }
      }, 30000);
    } catch (err) {
      console.error("True/False error:", err);
      return message.reply("⚠️ Could not create True/False question.");
    }
  },

  calculateLevel(correct) {
    const levels = [
      {threshold: 0, name: "Novice"},
      {threshold: 10, name: "Apprentice"},
      {threshold: 25, name: "Expert"},
      {threshold: 50, name: "Master"},
      {threshold: 100, name: "Legend"}
    ];
    return levels.reverse().find(level => correct >= level.threshold) || levels[0];
  },

  async handleQuiz(message, event, args, commandName, getLang, api, usersData) {
    try {
      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID].name;
      const category = args[0]?.toLowerCase() || "";

      if (category === 'flag') {
        const res = await axios.get(`${BASE_URL}/question?category=flag`);
        const { _id, imageUrl, options, answer } = res.data;
        
        const flagEmbed = {
          body: "🎯 𝗙𝗹𝗮𝗴 𝗤𝘂𝗶𝘇\n━━━━━━━━━━━━━\n\n🌍 Guess this flag:\n\n" +
                options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n") +
                "\n\n⏰ Time: 30 seconds",
          attachment: await global.utils.getStreamFromURL(imageUrl)
        };

        const info = await message.reply(flagEmbed);

        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          author: event.senderID,
          messageID: info.messageID,
          answer,
          questionId: _id,
          startTime: Date.now(),
          isFlag: true,
          reward: this.envConfig.reward * 2 
        });

        setTimeout(() => {
          const r = global.GoatBot.onReply.get(info.messageID);
          if (r) {
            message.reply(getLang("timeoutMessage").replace("{correctAnswer}", answer));
            message.unsend(info.messageID);
            global.GoatBot.onReply.delete(info.messageID);
          }
        }, 30000);
        return;
      }

      const res = await axios.get(`${BASE_URL}/question`, {
        params: { category: category || undefined }
      });

      const { _id, question, options, answer } = res.data;
      const optText = options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n");

      const info = await message.reply(getLang("reply")
        .replace("{name}", userName)
        .replace("{category}", category || "Random")
        .replace("{question}", question)
        .replace("{options}", optText));

      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID,
        answer,
        questionId: _id,
        startTime: Date.now()
      });

      setTimeout(() => {
        const r = global.GoatBot.onReply.get(info.messageID);
        if (r) {
          message.reply(getLang("timeoutMessage").replace("{correctAnswer}", answer));
          message.unsend(info.messageID);
          global.GoatBot.onReply.delete(info.messageID);
        }
      }, 30000);
    } catch (err) {
      console.error("Quiz error:", err);
      message.reply("⚠️ Could not get quiz question.");
    }
  },

  onReaction: async function ({ message, event, Reaction, api, usersData }) {
    try {
      const { author, messageID, answer, reacted, reward } = Reaction;

      if (event.userID !== author || reacted) return;

      const userAnswer = event.reaction === '😆';
      const isCorrect = userAnswer === answer;

      const timeSpent = (Date.now() - Reaction.startTime) / 1000;
      if (timeSpent > 30) {
        return message.reply("⏰ Time's up!");
      }

      const userInfo = await api.getUserInfo(event.userID);
      const userName = userInfo[event.userID].name;

      const answerData = {
        userId: event.userID,
        questionId: Reaction.questionId,
        answer: userAnswer ? "True" : "False",
        timeSpent,
        userName,
        correct: isCorrect ? 1 : 0,
        wrong: !isCorrect ? 1 : 0,
        total: 1
      };

      try {
        const res = await axios.post(`${BASE_URL}/answer`, answerData);
        const { user } = res.data;
        const userData = await usersData.get(event.userID);
        userData.money = (userData.money || 0) + (isCorrect ? reward : 0);
        await usersData.set(event.userID, userData);
      } catch (error) {
        console.error("Error updating score:", error);
      }

      const tfSuccessMessages = [
        `🌟 Perfect intuition {name}! You've earned ${reward} coins! Keep it up! 🎉`,
        `🏆 That's right {name}! Your instincts are spot on! Here's ${reward} coins! ✨`,
        `💫 You've got it {name}! Excellent judgment! Enjoy your ${reward} coins! 🎯`,
        `🎉 Way to go {name}! That's correct! Take these ${reward} coins! 🔥`,
        `⭐ You nailed it {name}! Here's ${reward} coins for your wisdom! 💰`
      ];

      const tfFailureMessages = [
        `😅 Not this time {name}! The answer was {answer}. Keep going! 💪`,
        `🤔 Close one {name}! It was actually {answer}. You'll get it next time! ✨`,
        `💫 Good try {name}! The correct answer was {answer}. Stay positive! 🎯`,
        `🌟 Nice attempt {name}! It was {answer}. Keep that spirit up! 📚`,
        `✨ Almost {name}! The answer we wanted was {answer}. Next one's yours! 🎓`
      ];

      const randomMessage = (isCorrect ? 
        tfSuccessMessages[Math.floor(Math.random() * tfSuccessMessages.length)] :
        tfFailureMessages[Math.floor(Math.random() * tfFailureMessages.length)])
        .replace('{name}', userInfo[event.userID].name)
        .replace('{answer}', answer ? 'true' : 'false');

      message.reply(randomMessage);

      global.GoatBot.onReaction.get(messageID).reacted = true;
      setTimeout(() => global.GoatBot.onReaction.delete(messageID), 1000);
    } catch (err) {
      console.error("Quiz reaction error:", err);
    }
  },

  onReply: async function ({ message, event, Reply, getLang, api, usersData }) {
    if (Reply.author !== event.senderID) return;

    try {
      const ans = event.body.trim().toUpperCase();
      const baseReward = Reply.isFlag ? this.envConfig.reward * 2 : this.envConfig.reward;
      if (!["A", "B", "C", "D"].includes(ans)) {
        return message.reply("❌ Reply with A, B, C or D only!");
      }

      const timeSpent = (Date.now() - Reply.startTime) / 1000;
      if (timeSpent > 30) {
        return message.reply("⏰ Time's up!");
      }

      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID].name;

      const isCorrect = ans === Reply.answer;
      const answerData = {
        userId: event.senderID,
        questionId: Reply.questionId,
        answer: ans,
        timeSpent,
        userName
      };

      const res = await axios.post(`${BASE_URL}/answer`, answerData);
      const { result, user } = res.data;

      if (result === "correct") {
        const userData = await usersData.get(event.senderID);
        userData.money = (userData.money || 0) + this.envConfig.reward;
        await usersData.set(event.senderID, userData);
      }

      const successMessages = [
        `🌟 Congratulations {name}! Your brilliance shines through! You've earned ${this.envConfig.reward} coins! 🎉`,
        `🏆 Outstanding {name}! That's absolutely correct! Here's ${this.envConfig.reward} coins for your genius! ✨`,
        `💫 Amazing work {name}! Your knowledge is impressive! Enjoy your ${this.envConfig.reward} coin reward! 🎯`,
        `🎉 Brilliant answer {name}! You're on fire! Take these ${this.envConfig.reward} coins! 🔥`,
        `⭐ You're unstoppable {name}! Perfect answer! ${this.envConfig.reward} coins added to your wallet! 💰`
      ];

      const failureMessages = [
        `😅 Oops {name}! Not quite right this time. Keep trying, you're getting better! 💪`,
        `🤔 Almost there {name}! The correct answer was: {answer}. Don't give up! ✨`,
        `💫 Nice try {name}! Keep that enthusiasm going! The right answer was: {answer} 🎯`,
        `🌟 Good attempt {name}! Learning is a journey. The correct answer was: {answer} 📚`,
        `✨ Don't worry {name}! Everyone learns differently. The answer we wanted was: {answer} 🎓`
      ];

      const randomMessage = (result === "correct" ? 
        successMessages[Math.floor(Math.random() * successMessages.length)] :
        failureMessages[Math.floor(Math.random() * failureMessages.length)])
        .replace('{name}', userName)
        .replace('{answer}', Reply.answer);

      const msg = `${randomMessage}\n\n📊 𝖲𝖼𝗈𝗋𝖾: ${user.correct}/${user.total}\n🔥 𝖲𝗍𝗋𝖾𝖺𝗄: ${user.currentStreak || 0}`;

      await message.reply(msg);

      if (user.achievement) {
        const bonusReward = this.envConfig.achievementReward;
        const userData = await usersData.get(event.senderID);
        userData.money = (userData.money || 0) + bonusReward;
        await usersData.set(event.senderID, userData);

        await message.reply(`🏆 𝖠𝖼𝗁𝗂𝖾𝗏𝖾𝗆𝖾𝗇𝗍 𝖴𝗇𝗅𝗈𝖼𝗄𝖾𝖽: ${user.achievement}\n💰 +${bonusReward} bonus coins!`);
      }

      message.unsend(Reply.messageID);
      global.GoatBot.onReply.delete(Reply.messageID);
    } catch (err) {
      console.error("Answer error:", err);
      message.reply("⚠️ Error processing your answer.");
    }
  },

  envConfig: {
    reward: 10000,
    achievementReward: 20000,
    streakReward: 5000,
    flagReward: 20000,
    flagStreakBonus: 2000 
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });