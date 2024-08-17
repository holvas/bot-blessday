const mongoose = require('mongoose'); // Імпорт mongoose

// Створюємо схему для користувача
const userSchema = new mongoose.Schema({
  chatId: { type: String, unique: true, required: true },
  right: { type: Number, default: 0 },
  wrong: { type: Number, default: 0 }
});

// Створюємо модель на основі схеми
const User = mongoose.model('User', userSchema);

module.exports = User;
