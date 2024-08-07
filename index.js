const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
// const sequelize = require('./db');
// const UserModel = require('./models');

const token = '7354137351:AAHNnMPsKk7oqbavuZ8R2TJe2xdjBo4sIHY';

const bot = new TelegramApi(token, {polling: true})

const chats = {}


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`);
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
}

const start = async () => {

    // try {
    //     await sequelize.authenticate()
    //     await sequelize.sync()
    // } catch (e) {
    //     console.log('Подключение к бд сломалось', e)
    // }

    bot.setMyCommands([
        {command: '/start', description: 'Привітання'},
        {command: '/info', description: 'Інформація про користувача'},
        {command: '/game', description: 'Гра: вгадай цифру'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                // await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp')
                return bot.sendMessage(chatId, `${msg.from.first_name}, Вітаю тебе в телеграм боті!`);
            }
            if (text === '/info') {
                // const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Ім'я: ${msg.from.first_name} ${msg.from.last_name}, в грі у тебе правильних відповідей ... , а неправильних ... `); //${user.right}, ${user.wrong} 
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, 'Я тебе не розумію, спробуй ще раз!');
        } catch (e) {
            return bot.sendMessage(chatId, 'Виникла якась ошибочпомилка!');
        }

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }
        // const user = await UserModel.findOne({chatId})
        if (data == chats[chatId]) {
            // user.right += 1;
            await bot.sendMessage(chatId, `Вітаю, ти відгадав(-ла) цифру ${chats[chatId]}`, againOptions);
        } else {
            // user.wrong += 1;
            await bot.sendMessage(chatId, `Нажаль ти не відгадав(-ла), я загадав цифру ${chats[chatId]}`, againOptions);
        }
        // await user.save();
    })
}

start()


        // // Cron job для регулярних повідомлень
        // cron.schedule('0 8-21 * * *', async () => {
        //     const chatId = 'YOUR_CHAT_ID'; // Використовуйте ваш чат ID
        //     const verse = 'Here is your hourly Bible verse!';
        //     await bot.sendMessage(chatId, verse);
        // });