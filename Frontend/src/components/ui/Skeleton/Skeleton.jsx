import React from 'react';
import styles from './Skeleton.module.css';

const Skeleton = ({ width, height, variant = 'rect', className = '' }) => {
  const isCircle = variant === 'circle';
  
  return (
    <div 
      className={`${styles.skeleton} ${isCircle ? styles.circle : ''} ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '20px' 
      }}
    />
  );
};

export default Skeleton;