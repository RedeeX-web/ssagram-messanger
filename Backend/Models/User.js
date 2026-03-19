const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // <--- НЕ ЗАБУДЬ ИМПОРТ

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    default: 'https://png.klev.club/uploads/posts/2024-05/png-klev-club-mxbp-p-ikonka-akkaunt-png-3.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  theme: {
    type: String,
    default: 'light'
  },
  accentColor: {
    type: String,
    default: '#007AFF'
  }
}, { timestamps: true });

// --- ДОБАВЬ ЭТОТ БЛОК ---

// Хешируем пароль перед сохранением в базу
userSchema.pre('save', async function() {
  // 1. Убираем next из аргументов, так как функция async
  // 2. Хешируем только если пароль был изменен или это новый юзер
  if (!this.isModified('password')) return; 

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // 3. Убираем вызов next() — Mongoose сам всё поймет после завершения await
  } catch (err) {
    // Если произошла ошибка, прокидываем её дальше
    throw err; 
  }
});

// Метод для проверки пароля при входе (логине)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ------------------------

module.exports = mongoose.model('User', userSchema);