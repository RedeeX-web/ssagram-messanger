import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import styles from './Button.module.css';

/**
 * @param {boolean} loading - показывать ли спиннер
 * @param {boolean} disabled - заблокирована ли кнопка
 * @param {string} variant - 'filled' (по умолчанию) или 'outline'
 * @param {ReactNode} icon - иконка внутри кнопки
 */
const Button = ({ 
  children, 
  onClick, 
  loading = false, 
  disabled = false, 
  variant = 'filled', 
  icon,
  className = '',
  style = {} 
}) => {
  const { accentColor } = useTheme();

  const isBtnDisabled = disabled || loading;

  return (
    <button
      onClick={!isBtnDisabled ? onClick : undefined}
      className={`
        ${styles.button} 
        ${variant === 'outline' ? styles.outline : ''} 
        ${isBtnDisabled ? styles.disabled : ''} 
        ${className}
      `}
      style={{ 
        backgroundColor: variant === 'filled' ? accentColor : 'transparent',
        color: variant === 'outline' ? accentColor : '#fff',
        ...style 
      }}
    >
      {loading ? (
        <div className={styles.loader} />
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;