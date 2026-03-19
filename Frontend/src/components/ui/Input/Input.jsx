import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import styles from './Input.module.css';

/**
 * @param {string} value - Значение инпута
 * @param {function} onChange - Обработчик изменения
 * @param {string} placeholder - Текст-заполнитель
 * @param {string} type - Тип (text, password, etc)
 * @param {ReactNode} iconLeft - Иконка слева
 * @param {ReactNode} iconRight - Иконка справа (например, кнопка очистки)
 */
const Input = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  iconLeft, 
  iconRight,
  className = "",
  ...props 
}) => {
  const { accentColor } = useTheme();

  return (
    <div className={`${styles.container} ${className}`}>
      <div 
        className={styles.inputWrapper}
        style={{ 
          // При фокусе красим бордер в акцентный цвет
          '--focus-color': accentColor 
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = accentColor}
        onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
      >
        {iconLeft && <div className={styles.iconLeft}>{iconLeft}</div>}
        
        <input
          className={styles.inputField}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />

        {iconRight && <div className={styles.iconRight}>{iconRight}</div>}
      </div>
    </div>
  );
};

export default Input;