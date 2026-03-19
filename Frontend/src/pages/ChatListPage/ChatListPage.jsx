import { useNavigate } from 'react-router-dom';
import { Search, Pencil, MessageSquareOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../api/Config';
import React, { useEffect } from 'react';
import { socket } from '../../api/Config';
import { useQueryClient } from '@tanstack/react-query';

// Наши новые компоненты
import PageContainer from '../../components/ui/PageContainer/PageContainer';
import Header from '../../components/ui/Header/Header';
import styles from './ChatListPage.module.css';
import FAB from '../../components/ui/FAB/FAB';
import ChatListSkeleton from './ChatListSkeleton';

const ChatListPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats', user?._id],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/chats`, {
        params: { userId: user?._id }
      });
      return res.data;
    },
    enabled: !!user?._id,
  });

  const sortedChats = [...chats].sort((a, b) => {
    // Сравниваем updatedAt, если его нет — createdAt
    const dateA = new Date(b.updatedAt || b.createdAt);
    const dateB = new Date(a.updatedAt || a.createdAt);
    return dateA - dateB;
  });

  useEffect(() => {
    // Слушаем событие обновления
    socket.on('update_chat_list', (data) => {
      console.log('Список чатов требует обновления:', data);

      // Если используешь React Query, это самый простой способ:
      queryClient.invalidateQueries(['chats']);

      // Если используешь обычный useState и useEffect для загрузки:
      // fetchChats(); // Твоя функция загрузки данных
    });

    return () => {
      socket.off('update_chat_list');
    };
  }, [queryClient]);

  // Элементы для правой части шапки
  const headerActions = (
    <Search size={22} onClick={() => navigate('/search')} />
  );

  if (isLoading) {
    return (
      <PageContainer>
        <Header title="Чаты" />
        <ChatListSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="ССАграм"
        showBack={false}
        rightElement={headerActions}
      />


      <div className={styles.listContainer}>
        {isLoading ? (
          <div className={styles.emptyState}>Загрузка чатов...</div>
        ) : chats.length > 0 ? (
          sortedChats.map((chat) => {
            // console.log(chat)
            const isGroup = chat.type === 'group' ? true : false;
            // console.log(isGroup)
            const otherUser = !isGroup ? chat.participants.find(p => p._id !== user._id) : null;
            const displayName = isGroup ? chat.groupInfo.name : otherUser?.username;
            return (
              <div
                key={chat._id}
                className={styles.chatItem}
                onClick={() => navigate(`/chat/${chat._id}`)}
              >
                <div className={styles.avatar}>
                  {isGroup ? '👥' : '👤'}
                </div>
                <div className={styles.chatInfo}>
                  <div className={styles.topRow}>
                    <span className={styles.chatName}>{displayName}</span>
                  </div>
                  <span className={styles.lastMsg}>
                    {chat.lastMessage?.text || 'Нет сообщений'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <MessageSquareOff size={48} strokeWidth={1.5} />
            <p>У вас пока нет чатов</p>
          </div>
        )}
      </div>

      <FAB
        icon={<Pencil size={28} />}
        onClick={() => navigate('/search')}
      />

    </PageContainer>
  );
};

export default ChatListPage;