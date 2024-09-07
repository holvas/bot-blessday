const cron = require('node-cron');
const TelegramApi = require('node-telegram-bot-api'); //імпортуємо пакет
require('dotenv').config();
const  { numberOptions, againOptions, startGame } = require('./options');
const connectDB = require('./db'); // Імпорт функції підключення до БД
const User = require('./models'); // Імпортуємо модель User
const token = process.env.TELEGRAM_BOT_TOKEN; //токен взаїмодії з ботом

//текстові повідомлення
const bot = new TelegramApi(token, {polling: true}); 
const chats = {};

const startChoose = async (chatId) => {
    //await bot.sendMessage(chatId, 'Обери число від 0 до 10');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Вкажи обране число', numberOptions);
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
            {command: '/info', description: 'Інфо користувача'},
            {command: '/game', description: 'Грати в гру'},
        ])

        //вішаємо слухача на обробку отриманних повідомлень
        bot.on('message', async msg => {
            const text = msg.text; //отримання повідомлень
            const chatId = msg.chat.id;  
            
            try {
                if (text === '/start') {

                    const existingUser = await User.findOne({ chatId });
                    if (!existingUser) {
                        await User.create({ chatId });
                    }
                    await bot.sendMessage(chatId, 'https://tlgrm.eu/_/stickers/a20/d3e/a20d3e8e-c30a-40fa-8646-9d82f922ad02/5.webp'); 
                    return bot.sendMessage(chatId, `Привіт, ${msg.from.first_name}! Пропоную тобі зіграти зі мною в гру!`, startGame); //відправка повідомлень
                }
                if (text === '/info') {
                    const user = await User.findOne({chatId});
                    return bot.sendMessage(chatId, `${msg.from.first_name}, у тебе в грі правильних відповідей ${user.right}, неправильних відповідей ${user.wrong}`);
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

            try {
                // Перевіряємо, чи користувач хоче зіграти знову
                if (data === '/again') {
                    return startChoose(chatId);
                }
                
                // Знаходимо користувача в базі даних
                const user = await User.findOne({chatId});
    
                // Перевіряємо, чи відповідає вибір користувача  & загадане число
                /* if (data === chats[chatId])*/ if (parseInt(data) === chats[chatId]) {
                    user.right += 1;
                    await bot.sendMessage(chatId, `Вітаю! Ви вгадали число ${chats[chatId]}!`, againOptions);
                } else {
                    user.wrong += 1;
                    await bot.sendMessage(chatId, `На жаль, ви не вгадали. Я загадував число ${chats[chatId]}.`, againOptions);
                }
                await user.save();
            } catch (err) { 
                console.error('Помилка обробки callback_query:', error);
                await bot.sendMessage(chatId, 'Виникла помилка під час обробки вашої відповіді.');
            }

        });
    }

start();