const cron = require('node-cron');
const TelegramApi = require('node-telegram-bot-api'); //імпортуємо пакет
require('dotenv').config();
const  {verseOptions, againOptions} = require('./options');
const connectDB = require('./db'); // Імпорт функції підключення до БД
const User = require('./models'); // Імпортуємо модель User
const token = process.env.TELEGRAM_BOT_TOKEN; //токен взаїмодії з ботом

//текстові повідомлення
const bot = new TelegramApi(token, {polling: true}); 
const chats = {};

const startChoose = async (chatId) => {
    await bot.sendMessage(chatId, 'Обери число від 0 до 10');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Напиши оберане число', verseOptions);
}

const start = async () => {
    try { 
        await connectDB(); //Підключення до бази даних
    } catch (err) {
        console.log('Підключення до БД не відбулось :(', err);
        return;
    }


    //встановлення команд бота по api
    bot.setMyCommands([
        {command: '/start', description: 'Привітання'},
        {command: '/info', description: 'Інфо про користувача'},
        {command: '/game', description: 'Оримати вірш'},

    ]) 
    //вішаємо слухача на обробку отриманних повідомлень
    bot.on('message', async msg => {
        const text = msg.text; //отримання повідомлень
        const chatId = msg.chat.id;  
        
        try {
            if (text === '/start') {
                await User.create({chatId});
                await bot.sendMessage(chatId, `https://tlgrm.eu/_/stickers/0cc/ba1/0ccba11f-e506-3c8c-8862-a4d914dcf683/2.jpg`); //відправка повідомлень
                return bot.sendMessage(chatId, `Привіт, ${msg.from.first_name}! Тебе вітає BlessDay бот. Тут ти отримуватимеш щоденне благословіння з Божого Слова`);
            }
            if (text === '/info') {
                const user = await User.findOne({chatId});
                return bot.sendMessage(chatId, `Тебе звуть ${msg.from.first_name} ${msg.from.last_name}/ У тебе в грі правильних відповідей ${User.right}, неправильних відповідей ${User.wrong}`);
            }
            if (text === '/game') {
                return startChoose(chatId);
            }
            return bot.sendMessage(chatId, 'Я не зрозумів. Будь ласка, обери дію в МЕНЮ');
        } catch (err) {
            return bot.sendMessage(chatId, 'Виникла помилочка ooops!')
        }
    }); 

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startChoose(chatId);
        }
        if (data === chats[chatId]) {
            return await bot.sendMessage(chatId, `Вітаю! Ви вгадали число ${chats[chatId]}!`, againOptions);
        } else {
            return await bot.sendMessage(chatId, `На жаль, ви не вгадали. Я загадував число ${chats[chatId]}.`, againOptions);
        }
    })


    cron.schedule('*/25 * * * *', async () => {
        // const verse = 'Here is your Bible verse!';
        // bot.sendMessage(chatId, verse);
        return await bot.sendMessage(chatId, `Тссс ${msg.from.first_name}! Почитаємо Біблію?`, againOptions);
    });
    }

start();