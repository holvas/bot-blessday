const mongoose = require('mongoose');
require('dotenv').config(); // Завантажуємо змінні середовища

async function connectDB() {
    const uri = process.env.URI;
    
    try {
        await mongoose.connect(uri);
        console.log('Ви підключилися до бази даних :)');
    } catch (error) {
        console.error('Помилка підключення до бази даних :(', error);
        process.exit(1); // Завершити процес у разі помилки
    }
}

module.exports = connectDB;
