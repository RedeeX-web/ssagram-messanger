import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../api/Config';
import { useTheme } from '../context/ThemeContext';


const GroupInfoPage = () => {
  const { theme, accentColor, updateSettings, getTextColor } = useTheme();
  const styles = getStyles(accentColor, theme, getTextColor()); // Вызываем функцию
  const { id } = useParams(); // ID чата
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        // Запрашиваем список чатов и находим нужную группу
        const res = await axios.get(`${BASE_URL}/chats/${user._id}`);
        const currentGroup = res.data.find(c => c._id === id);
        setGroup(currentGroup);
      } catch (err) {
        console.error("Ошибка при получении данных группы", err);
      }
    };
    fetchGroup();
  }, [id, user._id]);

  if (!group) return <div style={{ padding: 20 }}>Загрузка данных...</div>;

  return (
    <div style={styles.container}>
      {/* Шапка с акцентным цветом */}
      <div style={styles.header}>
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <span style={styles.headerTitle}>Данные группы</span>
      </div>

      <div style={styles.content}>
        <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
          {/* Аватар группы */}
          <div style={styles.avatar}>
            <Users size={60} color="#888" />
          </div>

          {/* Название и Юзернейм */}
          <h2 style={styles.name}>{group.groupInfo.name}</h2>
          <span style={styles.username}>{group.groupInfo.username}</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
          {/* Статистика */}
          <div style={styles.infoSection}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Участников:</span>
              <span style={styles.value}>{group.participants.length}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Создана:</span>
              <span style={styles.value}>
                {new Date(group.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <p style={styles.footerNote}>
            Это открытая группа. Любой может найти её через глобальный поиск по юзернейму.
          </p>
        </div>


      </div>
    </div>
  );
};

const getStyles = (accentColor, theme, textColor) => ({
  container: {
    height: '100vh', backgroundColor: theme === 'dark'
      ? `color-mix(in srgb, ${accentColor}, black 85%)`
      : `color-mix(in srgb, ${accentColor}, white 85%)`
  },
  header: {
    height: '60px',
    backgroundColor: accentColor,
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    color: '#fff',
    gap: '20px'
  },
  headerTitle: { fontSize: '18px', fontWeight: 'bold' },
  content: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px', height: '70vh', justifyContent: 'space-between' },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '60px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px'
  },
  name: { fontSize: '24px', margin: '5px 0', color: '#333' },
  username: { fontSize: '16px', color: '#007AFF', fontWeight: '500' },
  divider: { width: '100%', height: '1px', backgroundColor: '#eee', margin: '30px 0' },
  infoSection: { width: 'fit-content', display: 'flex', flexDirection: 'column', gap: '15px' },
  infoItem: { display: 'flex', justifyContent: 'center', fontSize: '16px', gap: '0px' },
  label: { color: '#888' },
  value: { fontWeight: 'bold', color: '#333', textAlign: 'center' },
  footerNote: { marginTop: '40px', textAlign: 'center', color: '#aaa', fontSize: '13px', fontStyle: 'italic' }
})

export default GroupInfoPage;