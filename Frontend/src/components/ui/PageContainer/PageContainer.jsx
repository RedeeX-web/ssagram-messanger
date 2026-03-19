import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import styles from './PageContainer.module.css';

/**
 * @param {boolean} isCentered - если true, контент будет выровнен по центру (для Auth)
 */
const PageContainer = ({ children, isCentered = false, className = '', style = {} }) => {
  const { theme, accentColor } = useTheme();

  // Вычисляем фон: чуть светлее или темнее в зависимости от темы
  const dynamicBackground = theme === 'dark'
    ? `color-mix(in srgb, ${accentColor}, black 92%)`
    : `color-mix(in srgb, ${accentColor}, white 94%)`;

  const textColor = theme === 'dark' ? '#ffffff' : '#1a1a1a';

  return (
    <div 
      className={styles.container}
      style={{ 
        backgroundColor: dynamicBackground, 
        color: textColor,
        ...style 
      }}
    >
      <div className={`
        ${styles.content} 
        ${isCentered ? styles.centered : ''} 
        ${className}
      `}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;