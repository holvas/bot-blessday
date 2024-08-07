require('dotenv').config();
const TelegramApi = require('node-telegram-bot-api'); //імпортуємо модуль telegram-bot
const cron = require('node-cron'); //імпортує модуль node-cron
const https = require('https'); // Додаємо імпорт модуля https
const { verseOptions, againOptions } = require('./options');
const token = process.env.TELEGRAM_BOT_TOKEN; //токен взаїмодії з ботом

console.log('Telegram Token:', token);

//текстові повідомлення
const bot = new TelegramApi(token, { polling: true });
const chats = {};

const startChoose = async (chatId) => {
    await bot.sendMessage(chatId, 'Обери число від 0 до 10');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Напиши обране число', verseOptions);
};

const deleteWebhook = async () => {
    return new Promise((resolve, reject) => {
        const url = `https://api.telegram.org/bot${token}/deleteWebhook`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
};

const start = async () => {
    try {
        const result = await deleteWebhook();
        console.log('Delete webhook result:', result);

        // Встановлення команд бота по API
        bot.setMyCommands([
            { command: '/start', description: 'Привітання' },
            { command: '/info', description: 'Інфо про користувача' },
            { command: '/game', description: 'Оримати вірш' },
        ]);

        // Вішаємо слухача на обробку отриманих повідомлень
        bot.on('message', async (msg) => {
            const text = msg.text;
            const chatId = msg.chat.id;

            console.log('Received message:', text, 'from chat ID:', chatId);

            if (text === '/start') {
                await bot.sendMessage(chatId, `https://tlgrm.eu/_/stickers/0cc/ba1/0ccba11f-e506-3c8c-8862-a4d914dcf683/2.jpg`);
                return bot.sendMessage(chatId, `Привіт, ${msg.from.first_name}! Тебе вітає BlessDay бот. Тут ти отримуватимеш щоденне благословіння з Божого Слова`);
            }
            if (text === '/info') {
                return bot.sendMessage(chatId, `Тебе звуть ${msg.from.first_name} ${msg.from.last_name}! Твій нік ${msg.from.username}`);
            }
            if (text === '/game') {
                return startChoose(chatId);
            }
            return bot.sendMessage(chatId, 'Я не зрозумів. Будь ласка, обери дію в МЕНЮ');
        });

        bot.on('callback_query', async (msg) => {
            const data = msg.data;
            const chatId = msg.message.chat.id;

            console.log('Callback query data:', data, 'from chat ID:', chatId);

            if (data === '/again') {
                return startChoose(chatId);
            }
            if (data === chats[chatId]) {
                return await bot.sendMessage(chatId, `Вітаю! Ви вгадали число ${chats[chatId]}!`, againOptions);
            } else {
                return await bot.sendMessage(chatId, `На жаль, ви не вгадали. Я загадував число ${chats[chatId]}.`, againOptions);
            }
        });

        // // Cron job для регулярних повідомлень
        // cron.schedule('0 8-21 * * *', async () => {
        //     const chatId = 'YOUR_CHAT_ID'; // Використовуйте ваш чат ID
        //     const verse = 'Here is your hourly Bible verse!';
        //     await bot.sendMessage(chatId, verse);
        // });
    } catch (error) {
        console.error('Error starting bot:', error);
    }
};

start();
