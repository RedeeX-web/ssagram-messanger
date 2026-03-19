import React from 'react';
import Skeleton from '../../components/ui/Skeleton/Skeleton';

const ChatListSkeleton = () => {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Заглушка аватара */}
          <Skeleton variant="circle" width="50px" height="50px" />
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Заглушка имени */}
            <Skeleton width="40%" height="16px" />
            {/* Заглушка последнего сообщения */}
            <Skeleton width="80%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatListSkeleton;