const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const os = require('os');
require('dotenv').config();

const User = require('./Models/User');
const Chat = require('./Models/Chat');
const Message = require('./Models/Message');
const { encrypt, decrypt } = require('./Utils/encryption');

const { Server } = require("socket.io");
const http = require("http");


const app = express();
const server = http.createServer(app);

const JWT_SECRET = process.env.JWT_SECRET;



// --- MIDDLEWARES ---

app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));
// Логгер запросов (лаконичный)
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://ssagram-messanger.vercel.app"], // Позволяет сокетам подключаться через туннель
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'] // Важно для стабильности через прокси
});

io.on("connection", (socket) => {
    console.log("Пользователь подключился:", socket.id);

    socket.on("join_chat", (chatId) => {
        socket.join(chatId);
        console.log(`Пользователь ${socket.id} зашел в чат: ${chatId}`);
    });

    // Когда кто-то отправляет сообщение
    socket.on("send_message", (data) => {
        // Рассылаем это сообщение всем, кто находится в этой же комнате (chatId)
        io.to(data.chatId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("Пользователь отключился");
    });
});

// --- UTILS ---
// Обертка для исключения бесконечных try/catch
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Универсальный дешифратор для объектов
const withDecryption = (item, textField = 'text') => {
    const obj = item.toObject ? item.toObject() : item;
    if (obj[textField]) {
        try { obj[textField] = decrypt(obj[textField]); }
        catch (e) { /* оставляем как есть */ }
    }
    return obj;
};

// --- AUTH ROUTES ---
app.post('/api/auth', asyncHandler(async (req, res) => {
    const { username, password, isRegistering } = req.body;
    let user = await User.findOne({ username });

    if (isRegistering) {
        if (user) return res.status(400).json({ message: 'Логин занят' });
        user = await new User({ username, password }).save();
    } else {
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Неверные данные' });
        }
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
}));

// --- USER ROUTES ---
app.get('/api/users/search-all', asyncHandler(async (req, res) => {
    const { query } = req.query;

    console.log('--- ПОИСК С ТИПОМ ГРУПП ---');
    console.log('Запрос:', query);

    if (!query) return res.json({ users: [], groups: [] });

    const searchRegex = { $regex: query, $options: 'i' };

    try {
        // Параллельный поиск
        const [users, groups] = await Promise.all([
            // Ищем пользователей по username
            User.find({ username: searchRegex })
                .limit(10)
                .select('username avatarUrl'),

            // Ищем чаты, где type равен 'group' и имя совпадает с запросом
            Chat.find({ type: 'group', 'groupInfo.name': searchRegex })
                .limit(10)
                .select('groupInfo.name type')
        ]);

        console.log(`Результаты: Юзеров [${users.length}], Групп [${groups.length}]`);

        // Лог для проверки структуры первой найденной группы (если есть)
        if (groups.length > 0) {
            console.log('Данные первой группы:', groups[0]);
        }

        res.json({ users, groups });
    } catch (error) {
        console.error('ОШИБКА ПОИСКА:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

app.post('/api/users/settings', asyncHandler(async (req, res) => {
    const { userId, theme, accentColor } = req.body;
    const user = await User.findByIdAndUpdate(userId, { theme, accentColor }, { new: true }).select('-password');
    res.json(user);
}));

// --- CHAT ROUTES ---
app.get('/api/chats', asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'userId required' });
    }

    // 1. Находим чаты, где пользователь является участником
    const chats = await Chat.find({ participants: userId })
        .populate('participants', 'username avatarUrl') // Загружаем данные участников
        .populate({
            path: 'lastMessage',
            select: 'text senderId createdAt' // Загружаем детали последнего сообщения
        })
        .sort({ updatedAt: -1 }) // Сортируем: самые свежие сверху
        .lean(); // lean() ускоряет запрос, возвращая простые JS-объекты вместо документов Mongoose

    // 2. Обрабатываем каждый чат (расшифровка и формат)
    const processedChats = chats.map(chat => {
        // Если последнее сообщение существует и в нем есть текст
        if (chat.lastMessage && chat.lastMessage.text) {
            try {
                // Расшифровываем текст перед отправкой на фронтенд
                chat.lastMessage.text = decrypt(chat.lastMessage.text);
            } catch (err) {
                console.error(`Ошибка расшифровки в чате ${chat._id}:`, err);
                chat.lastMessage.text = "Ошибка расшифровки";
            }
        }
        return chat;
    });

    res.json(processedChats);
}));

app.get('/api/chats/:id', asyncHandler(async (req, res) => {
    const chat = await Chat.findById(req.params.id).populate('participants', 'username avatarUrl');
    chat ? res.json(chat) : res.status(404).send('Чat not found');
}));

app.post('/api/chats/get-or-create', asyncHandler(async (req, res) => {
    const { currentUserId, targetUserId } = req.body;
    let chat = await Chat.findOne({ type: 'private', participants: { $all: [currentUserId, targetUserId] } });

    if (!chat) chat = await new Chat({ type: 'private', participants: [currentUserId, targetUserId] }).save();
    res.json(chat);
}));

app.post('/api/chats/group', asyncHandler(async (req, res) => {
    const { name, ownerId } = req.body;
    const group = await new Chat({
        type: 'group',
        participants: [ownerId],
        groupInfo: { name, username: `@${name}` }
    }).save();
    res.status(201).json(group);
}));

// --- MESSAGE ROUTES ---
app.delete('/api/messages/:messageId', asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Не найдено" });

    // Проверка: только автор может удалить
    if (message.senderId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Нет прав" });
    }

    const chatId = message.chatId.toString();
    await message.deleteOne();

    // ОПОВЕЩАЕМ ВСЕХ В КОМНАТЕ ЧАТА
    // Это заставит фронтенд у всех участников сработать мгновенно
    io.to(chatId).emit('message_deleted', messageId);

    // Обновляем последнее сообщение в чате для списка (ChatListPage)
    const lastMsg = await Message.findOne({ chatId }).sort({ createdAt: -1 });
    const chat = await Chat.findById(chatId);
    chat.lastMessage = lastMsg ? { text: lastMsg.text, at: lastMsg.createdAt } : null;
    await chat.save();

    // Оповещаем список чатов (чтобы превью тоже обновилось)
    io.emit('update_chat_list', { chatId });

    res.json({ success: true, messageId });
}));

app.post('/api/messages', asyncHandler(async (req, res) => {
    const { chatId, senderId, text } = req.body;

    // 1. Находим чат
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Чат не найден" });
    }

    // 2. Шифруем текст для базы данных
    const encryptedText = encrypt(text);

    // 3. Создаем и сохраняем сообщение
    const message = await new Message({
        chatId,
        senderId,
        text: encryptedText
    }).save();

    chat.lastMessage = {
        text: encryptedText,
        at: Date.now()
    };
    chat.updatedAt = Date.now(); // <--- ВОТ ЭТА СТРОЧКА поднимает чат в базе
    await chat.save();

    // 4. Проверка участника (если это группа и отправителя там нет — добавляем)
    const isParticipant = chat.participants.some(p => p.toString() === senderId.toString());
    if (chat.type === 'group' && !isParticipant) {
        chat.participants.push(senderId);
    }

    // 5. Обновляем данные чата (последнее сообщение и время обновления)
    chat.lastMessage = {
        text: encryptedText, // В базе храним зашифрованный
        at: Date.now()
    };
    chat.updatedAt = Date.now(); // КРИТИЧНО для сортировки списка чатов

    await chat.save();

    // 7. Socket.io: Оповещаем всех об обновлении списка (для ChatListPage)
    io.emit('update_chat_list', {
        chatId: chatId,
        lastMessage: {
            text: text, // Исходный текст для превью
            createdAt: message.createdAt // ИСПОЛЬЗУЕМ 'message', а не 'newMessage'
        }
    });

    res.status(201).json(message);
}));

app.get('/api/messages/:chatId', asyncHandler(async (req, res) => {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
    res.json(messages.map(m => withDecryption(m)));
}));

// --- DATABASE & SERVER ---

// Централизованная ошибка
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Подключаемся к БД и запускаем ЕДИНЫЙ сервер
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        // Слушаем порт 5000 на всех интерфейсах (0.0.0.0 для доступа с телефона)
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server & Socket.io: http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('❌ DB Error:', err));
