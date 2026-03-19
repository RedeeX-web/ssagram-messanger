import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../api/Config';
import { useTheme } from '../context/ThemeContext';


const UserInfoPage = () => {
  const { theme, accentColor, updateSettings, getTextColor } = useTheme();
  const styles = getStyles(accentColor, theme, getTextColor()); // Вызываем функцию
  const { id } = useParams(); // В данном случае это ID чата
  const navigate = useNavigate();
  const [targetUser, setTargetUser] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`${BASE_URL}/chats/${currentUser._id}`);
      const chat = res.data.find(c => c._id === id);
      const otherUser = chat.participants.find(p => p._id !== currentUser._id);
      setTargetUser(otherUser);
    };
    fetchUser();
  }, [id, currentUser._id]);

  if (!targetUser) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <span style={styles.headerTitle}>Данные пользователя</span>
      </div>
      <div style={styles.content}>
        <div style={styles.avatar}>👤</div>
        <h2 style={styles.username}>{targetUser.username}</h2>
        <p style={styles.date}>Создан: {new Date(targetUser.createdAt || Date.now()).toLocaleDateString()}</p>
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
  header: { height: '60px', backgroundColor: '#007AFF', display: 'flex', alignItems: 'center', padding: '0 15px', color: '#fff' },
  content: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' },
  avatar: { width: '120px', height: '120px', borderRadius: '60px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px' },
  username: { marginTop: '20px', fontSize: '24px' },
  date: { color: '#888', marginTop: '10px' },
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
  content: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px' },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '60px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px'
  }
})

export default UserInfoPage;