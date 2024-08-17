const mongoose = require('mongoose');
require('dotenv').config(); // Завантажуємо змінні середовища

async function connectDB() {
    const uri = `mongodb+srv://CRAFT:${process.env.PASS}@cluster0.ptncs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    
    try {
        await mongoose.connect(uri);
        console.log('Ви підключилися до бази даних :)');
    } catch (error) {
        console.error('Помилка підключення до бази даних :(', error);
        process.exit(1); // Завершити процес у разі помилки
    }
}

module.exports = connectDB;
