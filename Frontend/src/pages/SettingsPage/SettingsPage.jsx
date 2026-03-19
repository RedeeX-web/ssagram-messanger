import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette, Moon, Sun } from 'lucide-react';

// UI Компоненты
import PageContainer from '../../components/ui/PageContainer/PageContainer';
import Header from '../../components/ui/Header/Header';

import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  const { theme, accentColor, updateSettings } = useTheme();

  const colors = [
    '#466789ff', // Синий
    '#894646ff', // Красный
    '#478946ff', // Зеленый
    '#6f4689ff', // Фиолетовый
    '#896c46ff', // Оранжевый
    '#468289ff'  // Голубой
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateSettings(newTheme, accentColor);
  };

  const changeColor = (color) => {
    updateSettings(theme, color);
  };

  return (
    <PageContainer>
      <Header showBack={false} title="Настройки" />

      <div className={styles.container} style={{ '--accent-color': accentColor }}>
        
        {/* Секция темы */}
        <div className={styles.section}>
          <div className={styles.row}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              <span className={styles.label}>Тёмная тема</span>
            </div>
            
            <div
              className={`${styles.switch} ${theme === 'dark' ? styles.switchActive : ''}`}
              onClick={toggleTheme}
            >
              <div className={`${styles.switchCircle} ${theme === 'dark' ? styles.circleActive : ''}`} />
            </div>
          </div>
        </div>

        {/* Секция акцентного цвета */}
        <div className={styles.section}>
          <div className={styles.colorSection}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Palette size={20} />
              <span className={styles.label}>Оформление</span>
            </div>
            
            <p className={styles.subLabel}>Акцентный цвет</p>
            
            <div className={styles.colorGrid}>
              {colors.map(color => (
                <div
                  key={color}
                  onClick={() => changeColor(color)}
                  className={`${styles.colorOption} ${accentColor === color ? styles.selectedColor : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>


      </div>
    </PageContainer>
  );
};

export default SettingsPage;