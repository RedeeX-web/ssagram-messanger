import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Smile, Paperclip, MoreVertical, Trash2, Copy, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { socket, BASE_URL } from '../../api/Config';
import Header from '../../components/ui/Header/Header';
import MessageActions from '../../components/ui/MessageActions/MessageActions'; // Импортируем созданный компонент
import styles from './ChatRoomPage.module.css';
import { useTheme } from '../../context/ThemeContext';

const ChatRoomPage = () => {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const { accentColor } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [menu, setMenu] = useState({ open: false, x: 0, y: 0, msgId: null });

  const scrollRef = useRef(null);
  const isMobile = window.innerWidth <= 768;

  // 1. Слушатели сокетов и вход в комнату
  useEffect(() => {
    if (!id) return;

    // 1. Сначала описываем функцию (теперь она точно defined!)
const handleReceiveMessage = (data) => {
      console.log("Пришло сообщение через сокет:", data);
      
      setMessages((prev) => {
        // 1. Проверяем по реальному ID (если вдруг пришло дважды)
        if (prev.find(m => m._id === data._id)) return prev;

        // 2. Умная проверка: если это сообщение от НАС и у нас в списке 
        // есть временное сообщение с таким же текстом — заменяем его на нормальное
        const tempIndex = prev.findIndex(m => 
          m.senderId === data.senderId && 
          m.text === data.text && 
          (m.isTemp || m._id.length < 20) // Временные ID короткие
        );

        if (tempIndex !== -1) {
          const newMessages = [...prev];
          newMessages[tempIndex] = data; // Заменяем временное на серверное
          return newMessages;
        }

        // 3. Если это сообщение от другого человека, просто добавляем
        return [...prev, data];
      });
    };
    
    const handleMessageDeleted = (deletedMessageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== deletedMessageId));
    };

    // 2. Только ПОСЛЕ описания функций подписываемся на события
    socket.emit("join_chat", id);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_deleted", handleMessageDeleted);

    // 3. Очистка при закрытии компонента
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, [id]); // Эффект сработает заново при переходе в другой чат

  // 2. Загрузка истории (отдельный эффект)
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const [msgRes, chatRes] = await Promise.all([
          axios.get(`${BASE_URL}/messages/${id}`),
          axios.get(`${BASE_URL}/chats/${id}`, { params: { userId: user._id } })
        ]);
        setMessages(msgRes.data);
        setChatInfo(chatRes.data);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      }
    };
    fetchChatData();
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    const tempId = Date.now().toString(); // Временный ID для твоего экрана

    // Оптимистичное обновление: добавляем СРАЗУ, чтобы юзер не ждал
    const tempMsg = {
      _id: tempId,
      senderId: user._id,
      text: textToSend,
      createdAt: new Date().toISOString(),
      isTemp: true // Пометка, что это временное сообщение
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage('');

    try {
      await axios.post(`${BASE_URL}/messages`, {
        chatId: id,
        senderId: user._id,
        text: textToSend
      });
    } catch (err) {
      console.error(err);
      // Если сервер вернул ошибку, удаляем временный пузырь
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const handleOpenMenu = (e, msgId, senderId) => {
    if (senderId !== user._id) return; // Удаляем только свои
    e.preventDefault();

    // Координаты для контекстного меню на ПК
    const x = e.pageX || (e.touches ? e.touches[0].pageX : 0);
    const y = e.pageY || (e.touches ? e.touches[0].pageY : 0);

    if (window.navigator.vibrate) window.navigator.vibrate(40);
    setMenu({ open: true, x, y, msgId });
  };

  const handleDelete = async (msgId) => {
    try {
      // Закрываем меню сразу для плавности UX
      setMenu({ ...menu, open: false });

      await axios.delete(`${BASE_URL}/messages/${msgId}`, {
        data: { userId: user._id } // Передаем кто удаляет для проверки
      });

      // Опционально: можно удалить и здесь локально через setMessages, 
      // чтобы не ждать ответа сокета (Оптимистичное удаление)
      setMessages(prev => prev.filter(m => m._id !== msgId));

    } catch (err) {
      console.error("Ошибка при удалении:", err);
      alert("Не удалось удалить сообщение");
    }
  };

  const handleCopy = (msgId) => {
    const msg = messages.find(m => m._id === msgId);
    if (msg) navigator.clipboard.writeText(msg.text);
    setMenu({ ...menu, open: false });
  };

  const getDisplayName = () => {
    if (!chatInfo) return "Загрузка...";
    if (chatInfo.type === 'group') return chatInfo.groupInfo?.name;
    const otherUser = chatInfo.participants?.find(p => p._id !== user._id);
    return otherUser?.username || "Чат";
  };

  return (
    <div className={styles.pageWrapper}>
      <Header
        title={getDisplayName()}
        rightElement={<MoreVertical size={20} />}
      />

      <div className={styles.messagesContainer} ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`${styles.messageRow} ${msg.senderId === user._id ? styles.myRow : styles.otherRow}`}
            onContextMenu={(e) => handleOpenMenu(e, msg._id, msg.senderId)}
          >
            <div className={styles.bubble} style={
              msg.senderId === user._id
                ? { backgroundColor: `color-mix(in srgb, ${accentColor}, transparent 10%)`, borderColor: 'rgba(255, 255, 255, 0.2)' }
                : {}
            }>
              <p>{msg.text}</p>
              <span className={styles.time}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.inputArea}>
        <input
          className={styles.input}
          placeholder="Сообщение..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />

        <button
          className={styles.sendButton}
          onClick={handleSendMessage}
          style={{ backgroundColor: accentColor }}
        >
          <Send size={20} color="#fff" />
        </button>
      </div>

      {/* Универсальное меню действий */}
      <MessageActions
        isOpen={menu.open}
        isMobile={isMobile}
        anchor={{ x: menu.x, y: menu.y }}
        onClose={() => setMenu({ ...menu, open: false })}
        onDelete={() => handleDelete(menu.msgId)}
        onCopy={() => handleCopy(menu.msgId)}
      />
    </div>
  );
};

export default ChatRoomPage;