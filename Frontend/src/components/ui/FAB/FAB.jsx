import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import styles from './FAB.module.css';

const FAB = ({ onClick, icon }) => {
  const { accentColor } = useTheme();

  return (
    <button 
      className={styles.fab} 
      style={{ backgroundColor: accentColor }}
      onClick={onClick}
    >
      {icon}
    </button>
  );
};

export default FAB;