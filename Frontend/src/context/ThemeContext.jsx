import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../api/Config';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [theme, setTheme] = useState(user?.theme || 'light');
    const [accentColor, setAccentColor] = useState(user?.accentColor || '#007AFF');

    const updateSettings = async (newTheme, newColor) => {
        // Берем самый свежий ID из localStorage прямо перед запросом
        const freshUser = JSON.parse(localStorage.getItem('user'));
        if (!freshUser?._id) return;

        setTheme(newTheme);
        setAccentColor(newColor);

        try {
            const res = await axios.post(`${BASE_URL}/users/settings`, {
                userId: freshUser._id, // Используем актуальный ID
                theme: newTheme,
                accentColor: newColor
            });
            
            // Сохраняем обновленного юзера
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data); // Обновляем локальное состояние контекста
        } catch (e) { 
            console.error("Ошибка обновления настроек:", e); 
        }
    };

    const getBackgroundColor = () => {
        if (theme === 'dark') {
            // Тёмная тема: очень тёмный оттенок акцентного цвета (почти черный, но с твоим тоном)
            // Мы берем очень низкую прозрачность акцента на черном фоне
            // return '#121212'; // Можно оставить чистый темный, либо чуть подкрасить:
            // return `${accentColor}15`;
            return `color-mix(in srgb, ${accentColor}, black 90%)`;
        }
        // Светлая тема: 10-12% насыщенности акцентного цвета
        return `${accentColor}15`;
    };

    const getTextColor = () => (theme === 'dark' ? '#ffffff' : '#1a1a1a');

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
            setUser(currentUser);
            setTheme(currentUser.theme || 'light');
            setAccentColor(currentUser.accentColor || '#007AFF');
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, accentColor, getBackgroundColor, getTextColor, updateSettings }}>
            <div style={{
                backgroundColor: getBackgroundColor(),
                color: getTextColor(),
                transition: 'all 0.5s ease',
                minHeight: '100vh',
            }}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);