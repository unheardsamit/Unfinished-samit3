const fs = require("fs-extra");
const moment = require("moment-timezone");
const crypto = require("crypto");


const secretKey = "B4Yj1D"; 


function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-ctr', secretKey);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}


function decrypt(text) {
  const decipher = crypto.createDecipher('aes-256-ctr', secretKey);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


const config = Object.freeze({
  name: "bot"," Alia"
  version: "1.0",
  author: encrypt("BaYjid"), 
  countDown: 5,
  role: 0,
  description: "Bot",
  category: "no prefix",
  guide: {
    en: "{p}{n}",
  },
});

module.exports = {
  config,

  onStart: async function ({}) {
    
    if (decrypt(config.author) !== "BaYjid") {
      console.error("Invalid configuration: Author must be 'BaYjid'. Bot will not work.");
      process.exit(1);
    }
  },

  onChat: async function ({ api, event, args, Threads, usersData }) {
    const data = await usersData.get(event.senderID);
    const name = data.name;
    const { threadID, messageID } = event;
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss L");

    const messages = [
      " আমরা দারুণ রকমের দুঃখ সাজাই প্রবল ভালোবেসে..!😅💔",
      "- আমি যখন একটু খুশি হওয়ার চেষ্টা করি, তখন দুঃখ এসে আবার আমাকে আঁকড়ে ধরে 😅💔",
      " °°অনুভূতি প্রকাশ করতে নেই মানুষ নাটক মনে করে মজা নেয়°..! 😥💔🥀",
      " কিছু মানুষ স্বল্প সময়ের জন্য আমাদের জীবনে আসে।কিন্তু দীর্ঘ সময় স্মৃতি রেখে যায়..!🙂💔",
      "𝙴𝙸 𝙿𝙰𝙶𝙾𝙻 𝙴𝚃𝙾 𝙳𝙰𝙺𝙾𝚂 𝙺𝙴𝙽?",
      " 𝙼𝚈𝙱 𝙸 𝙹𝚄𝚂𝚃 𝚆𝙰𝙽𝙽𝙰 𝙱𝙴 𝚈𝙾𝚄𝚁𝚂 ? 😌💝",
      " 𝙸 𝚂𝙰𝚈 𝙸 𝙻𝙾𝚅𝙴 𝚈𝙾𝚄 𝙵𝙾𝚁𝙴𝚅𝙴𝚁💝🐼",
      "আমরা কি বন্ধু হতে পারি? নাহলে তার থেকে বেশি কিছু??😋",
      " 𝚈𝚄𝙼𝙼𝚈 𝙱𝙱𝚈 𝚈𝙾𝚄 𝙰𝚁𝙴 𝚂𝙾 𝚂𝚆𝙴𝙴𝚃😋🤤",
      "তোর সাথে কথা নাই কারণ তুই অনেক লুচ্চা",
      " এইখানে লুচ্চামি করলে লাথি দিবো কিন্তু",
      "আমাকে চুমু দিবি 🫢🦋",
      "হেহে বাবু আমার কাছে আসো 😘💋",
      "আমি তোমাকে অনেক ভালোবাসি বাবু🥺💖",
      "SAMITS BOT:;)🤍  বট এর help list dekhte type koron Help",
      "কিরে বলদ তুই এইখানে 🙂",
      " আমাকে চিনো না জানু? মনু",
      "hey bbe I'm your personal Based chatbot you ask me anything",
      "AR asbo na tor kache",
      "আমাকে ডাকলে ,আমি কিন্তু চিল্লা চিল্লি করবো 🫢",
      "Hop beda dakos kn🥲",
 
      " ওই আর ডাকিস না প্লিজ🥲",
      " হ্যা বলো, শুনছি আমি",
      "বলো কি করতে পারি তোমার জন্য😌 ",
      "𝐁𝐨𝐭 না জানু,বলো কারন আমি সিংগেল 😌 ",
      " এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
      " দেখা হলে কাঠগোলাপ দিও..🤗",
      "𝗕𝗲𝘀𝗵𝗶 𝗱𝗮𝗸𝗹𝗲 𝗮𝗺𝗺𝘂 𝗯𝗼𝗸𝗮 𝗱𝗲𝗯𝗮 𝘁𝗼__🥺 ",
      "•-কিরে🫵 তরা নাকি  prem করস..😐🐸•আমারে একটা করাই দিলে কি হয়-🥺 ",
      "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈💋 ",
      "Single taka ki oporad🥺 ",
      " Premer mora jole dube na😛",
      "Ufff matha gorom kore disos😒 ",
      "Boss Samit er kache😜 ",
      "bashi dakle boss BaYjid ke bole dimu😒 ",
      "Xhipay atke gaci jan🥲 ",
      "Washroom a🤣 ",
      "bado maser kawwa police amar sawwa😞 ",
      "I am single plz distrab me🥺🥲 ",
      "𝗮𝗺𝗶 𝗯𝗼𝘁 𝗻𝗮 𝗮𝗺𝗮𝗸𝗲 𝗯𝗯𝘆 𝗯𝗼𝗹𝗼 𝗯𝗯𝘆!!😘 ",
      "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲 ",
      "𝗛𝗶𝗶 𝗶 𝗮𝗺 𝗯𝗼𝘁 𝗰𝗮𝗻 𝗶 𝗵𝗲𝗹𝗽 𝘆𝗼𝘂!🤖 ",
      "𝗲𝘁𝗼 𝗯𝗼𝘁 𝗯𝗼𝘁 𝗻𝗮 𝗸𝗼𝗿𝗲 𝘁𝗮𝗸𝗮 𝗼 𝘁𝗼 𝗽𝗮𝗧𝗵𝗮𝘁𝗲 𝗽𝗮𝗿𝗼😒🥳🥳 ",
      "𝘁𝗼𝗿𝗲 𝗺𝗮𝗿𝗮𝗿 𝗽𝗿𝗲𝗽𝗲𝗿𝗮𝘁𝗶𝗼𝗻 𝗻𝗶𝗰𝗵𝗶...!!.🫡 ",
      "𝘂𝗺𝗺𝗮𝗵 𝗱𝗶𝗹𝗲 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂 𝗸𝗼𝗺𝘂 𝗸𝗶𝗻𝗧𝘂😑 ",
      " আমাকে ডাকলে ,আমি কিন্তু 𝐊𝐢𝐬𝐬 করে দিবো 😘",
      " Bal falaw😩",
      "Tapraiya dat falai demu🥴 ",
      "He🤤bolo amar jan kmn aso🤭 ",
      "Hmmm jan ummmmmmah🫣 ",
      "Chup kor ato bot bot koros kn😬 ",
      "Yes sir/mem😍 ",
      "Assalamualikum☺️💖 ",
      "Walaikumsalam😫🤓 ",
      "Chaiya takos kn ki kobi kooo☹️ ",
      "Onek boro beyadop re tui😒 ",
    ];

    const rand = messages[Math.floor(Math.random() * messages.length)];

    if (event.body.toLowerCase() === "🙂" || event.body.toLowerCase() === "🦈") {
      return api.sendMessage("-  𝐔𝐟𝐟'𝐬 𝐀𝐦𝐚𝐫 𝐁𝐚𝐛𝐮 𝐓𝐚🐥", "- ইসস আমার সোনা বাবু টা 🙊", threadID);
    }

    if (event.body.toLowerCase().startsWith("বট") || event.body.toLowerCase() === "Bot") {
      const msg = {
        body: `${rand}`,
      };
      return api.sendMessage(msg, threadID, messageID);
    }
  },
};
