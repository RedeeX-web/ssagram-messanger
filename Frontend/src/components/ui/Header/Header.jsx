import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import styles from './Header.module.css';

/**
 * @param {string} title - Текст заголовка
 * @param {boolean} showBack - Показать кнопку назад
 * @param {function} onBack - Кастомное действие на назад (если нужно)
 * @param {ReactNode} rightElement - Компонент для правой части (иконка, кнопка)
 * @param {boolean} centerTitle - Центрировать ли заголовок (как в ChatRoom)
 */
const Header = ({ 
  title, 
  showBack = true, 
  onBack, 
  rightElement, 
  centerTitle = false 
}) => {
  const navigate = useNavigate();
  const { accentColor } = useTheme();

  const handleBack = () => {
    console.log(onBack)
    if (onBack) {
      onBack();
    } else {
      navigate('/chats');
    }
  };

  return (
    <header 
      className={styles.header} 
      style={{ backgroundColor: accentColor }}
    >
      {showBack && (
        <div className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={24} strokeWidth={2.5} />
        </div>
      )}

      <div className={`
        ${styles.title} 
        ${centerTitle ? styles.titleCenter : ''}
      `}>
        {title}
      </div>

      {rightElement && (
        <div className={styles.rightAction}>
          {rightElement}
        </div>
      )}
    </header>
  );
};

export default Header;