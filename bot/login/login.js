const nixModule = require('./nix.js');

global.GoatBot.reLoginBot = nixModule.startBot;

nixModule.startBot();
