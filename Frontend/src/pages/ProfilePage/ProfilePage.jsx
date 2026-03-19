import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// UI Компоненты
import PageContainer from '../../components/ui/PageContainer/PageContainer';
import Header from '../../components/ui/Header/Header';
import Button from '../../components/ui/Button/Button';

import styles from './ProfilePage.module.css';

const ProfilePage = ({ setUser }) => {
  const { accentColor } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Получаем данные пользователя из localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.clear();
    queryClient.clear(); // Полная очистка кэша React Query
    setUser(null);
    navigate('/login'); // Перенаправление на вход
  };

  // Форматируем дату создания (с проверкой на наличие даты)
  const createdAt = user.createdAt 
    ? new Date(user.createdAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Дата неизвестна';

  return (
    <PageContainer>
      <Header showBack={false} title="Профиль" />

      <div 
        className={styles.container} 
        style={{ '--accent-color-transparent': `${accentColor}33` }}
      >
        {/* Аватар */}
        <div className={styles.avatarWrapper}>
          <User size={60} color={accentColor} />
        </div>

        {/* Имя пользователя */}
        <h2 className={styles.username}>{user.username}</h2>

        {/* Информация об аккаунте */}
        <div className={styles.dateInfo}>
          <span className={styles.dateLabel}>Аккаунт создан</span>
          <span className={styles.dateValue}>{createdAt}</span>
        </div>

        {/* Кнопка выхода внизу страницы */}
        <div className={styles.footer}>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            style={{ width: 'auto', padding: '12px 30px', marginBottom: '80px'}}
          >
            <LogOut size={18} style={{ marginRight: '8px' }} />
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;