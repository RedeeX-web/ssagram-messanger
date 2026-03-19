import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Settings, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accentColor, theme } = useTheme();

  // Список вкладок: id, иконка и путь
  const tabs = [
    { id: 'chats', icon: <MessageSquare size={24} />, path: '/chats' },
    { id: 'settings', icon: <Settings size={24} />, path: '/settings' },
    { id: 'profile', icon: <User size={24} />, path: '/profile' },
  ];

  return (
    <div style={{
      ...styles.tabBar,
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
      borderTop: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`,
    }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        
        return (
          <div 
            key={tab.id} 
            onClick={() => navigate(tab.path)}
            style={{
              ...styles.tabItem,
              color: isActive ? accentColor : '#888',
              // Небольшое свечение для активной иконки в темной теме
              textShadow: isActive && theme === 'dark' ? `0 0 10px ${accentColor}55` : 'none'
            }}
          >
            <div style={{
              transition: 'transform 0.2s ease',
              transform: isActive ? 'scale(1.1)' : 'scale(1)'
            }}>
              {tab.icon}
            </div>
            {/* Можно добавить подписи под иконками, если захочешь */}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    paddingBottom: 'env(safe-area-inset-bottom)', // Для мобильных устройств (челки снизу)
  },
  tabItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    cursor: 'pointer',
    transition: 'color 0.3s ease',
  }
};

export default TabBar;