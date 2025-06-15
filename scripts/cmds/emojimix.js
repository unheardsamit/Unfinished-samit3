const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
    const base = 'https://aryan-error-api.onrender.com';
    return base;
};

module.exports = {
	config: {
		name: "emojimix",
		aliases: ["mix"],
		version: "0.0.1",
		author: "ArYAN",
		countDown: 5,
		role: 0,
		guide: "Example: {pn} 🙂 😘",
		category: "FUN"
	},

	langs: {
		en: {
			error: "Sorry, emoji %1 and %2 can't mix",
			success: "Emoji %1 and %2 mix successfully"
		}
	},

	onStart: async function ({ message, args, getLang }) {
		const emoji1 = args[0];
		const emoji2 = args[1];

		if (!emoji1 || !emoji2)
			return message.SyntaxError();

		const base = await baseApiUrl();
		const image = await generateEmojimix(emoji1, emoji2, base);
		if (!image)
			return message.reply(getLang("error", emoji1, emoji2));

		message.reply({
			body: getLang("success", emoji1, emoji2),
			attachment: image
		});
	}
};

async function generateEmojimix(emoji1, emoji2, base) {
	try {
		const { data: response } = await axios.get(`${base}/emojimix`, {
			params: { emoji1, emoji2 },
			responseType: "stream"
		});
		response.path = `emojimix${Date.now()}.png`;
		return response;
	} catch (e) {
		return null;
	}
                                                  }

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
