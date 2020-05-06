process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const config = require('config');

const apiKey = config.get('notification.telegram.apiKey');
const channel = config.get('notification.telegram.channel');

let bot = null;
let _enable = false;

if (apiKey && channel) {
    bot = new TelegramBot(apiKey, { polling: false });
    _enable = true;
}

function isEnable() {
    return _enable;
}

function sendNotify(title, content) {
    let text = `${title}</b>\n<pre><code>${content}</code></pre>\n`;
    bot.sendMessage(channel, text, {
        parse_mode: 'HTML',
    });
}

module.exports = {
    isEnable,
    sendNotify
}