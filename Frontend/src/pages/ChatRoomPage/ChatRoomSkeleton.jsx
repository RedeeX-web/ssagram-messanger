import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './ChatRoomPage.module.css';

const ChatRoomSkeleton = () => {
  const { accentColor } = useTheme();

  const SkeletonBubble = ({ isMine, width }) => (
    <div className={`${styles.messageRow} ${isMine ? styles.myRow : styles.theirRow}`}>
      <div 
        // Добавляем класс анимации ТУТ, чтобы он не влиял на обычные сообщения
        className={`
          ${styles.bubble} 
          ${isMine ? styles.myBubble : styles.theirBubble} 
          ${styles.skeletonAnimation}
        `}
        style={{ 
          width: width, 
          height: '55px',
          // Устанавливаем четкий цвет без прозрачности, 
          // так как за прозрачность теперь отвечает анимация skeletonPulse
          backgroundColor: isMine ? accentColor : 'rgba(128, 128, 128, 0.15)',
        }}
      />
    </div>
  );

  return (
    <div className={styles.messagesList} style={{ overflow: 'hidden' }}>
      <SkeletonBubble isMine={false} width="60%" />
      <SkeletonBubble isMine={true} width="40%" />
      <SkeletonBubble isMine={false} width="75%" />
      <SkeletonBubble isMine={true} width="50%" />
      <SkeletonBubble isMine={false} width="30%" />
      <SkeletonBubble isMine={true} width="25%" />
    </div>
  );
};

export default ChatRoomSkeleton;