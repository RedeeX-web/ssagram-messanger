const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');

// Подгружаем модели (убедись, что пути верные)
const User = require('./Models/User');
const Chat = require('./Models/Chat');
const Message = require('./Models/Message');

dotenv.config();

// Создаем интерфейс для ввода в консоли
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Функция для генерации рандомного кода
const generateCode = (length = 5) => {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

const resetDatabase = async () => {
    const confirmationCode = generateCode();
    
    console.log('\n============== ОПАСНАЯ ЗОНА ==============');
    console.log(`ВНИМАНИЕ: Это действие безвозвратно удалит всех пользователей, чаты и сообщения.`);
    
    rl.question(`Для подтверждения введите код [ ${confirmationCode} ]: `, async (input) => {
        if (input.trim().toUpperCase() !== confirmationCode) {
            console.log('❌ Код не совпал. Операция отменена.');
            rl.close();
            process.exit();
        }

        try {
            console.log('\n⏳ Подключение к БД...');
            await mongoose.connect(process.env.MONGO_URI);
            
            console.log('🧹 Очистка коллекций...');
            
            const results = await Promise.all([
                User.deleteMany({}),
                Chat.deleteMany({}),
                Message.deleteMany({})
            ]);

            console.log(`✅ Готово!`);
            console.log(`- Пользователей: ${results[0].deletedCount}`);
            console.log(`- Чатов/Групп:   ${results[1].deletedCount}`);
            console.log(`- Сообщений:    ${results[2].deletedCount}`);
            
            console.log('\n✨ База данных очищена');
        } catch (err) {
            console.error('❌ Ошибка:', err);
        } finally {
            await mongoose.connection.close();
            rl.close();
            process.exit();
        }
    });
};

resetDatabase();