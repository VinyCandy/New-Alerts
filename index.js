const TelegramBot = require('node-telegram-bot-api');
const { messageTypes } = require('node-telegram-bot-api/src/telegram');
const token = '5231154575:AAG4v6JkWf2BjKv5bAKTCzHF0aXBkFa7a9s';
const bot = new TelegramBot(token, {polling: true});


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(chatId)
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, '<b>bold</b>');
});