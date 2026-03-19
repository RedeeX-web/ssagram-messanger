import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../api/Config';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ setUser }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

 const handleAuth = async () => {
    try {
      // Проверяем, что поля не пустые
      if (!username || !password) {
        return alert("Заполни все поля!");
      }
      localStorage.clear();
      const response = await axios.post(`${BASE_URL}/auth`, { 
        username, 
        password, 
        isRegistering 
      });

      if (response.data.token) {
        // Сохраняем данные для авто-входа
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Обновляем состояние в App.jsx
        setUser(response.data.user); 
        
        // Переходим к чатам
        navigate('/chats'); 
      }
    } catch (err) {
      // Если сервер вернул ошибку (400, 401, 404), выводим её сообщение
      const errorMsg = err.response?.data?.message || "Ошибка соединения с сервером";
      alert(errorMsg);
      console.error("Auth error:", err);
    }
};

  return (
    <div style={styles.container}>
      {/* Логотип по центру */}
      <div style={styles.logoCircle}>
        <span style={{ fontSize: '40px' }}>📱</span>
      </div>
      
      <h1 style={styles.title}>ССАграм</h1>

      <div style={styles.form}>
        <input 
          placeholder="Логин" 
          style={styles.input} 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          style={styles.input} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button style={styles.button} onClick={handleAuth}>
          {isRegistering ? 'Зарегистрироваться' : 'Войти'}
        </button>

        <p style={styles.toggleText} onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Уже есть аккаунт? Войти.' : 'Нет аккаунта? Зарегистрируйся.'}
        </p>
      </div>
    </div>
  );
};

// Базовые стили (потом можно вынести в CSS)
const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fff' },
  logoCircle: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', color: '#333' },
  form: { width: '80%', display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' },
  button: { padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: '#007AFF', color: '#fff', fontSize: '16px', fontWeight: 'bold' },
  toggleText: { marginTop: '15px', textAlign: 'center', color: '#007AFF', cursor: 'pointer', fontSize: '14px' }
};

export default AuthPage;