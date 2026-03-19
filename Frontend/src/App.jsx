import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Добавь это
import { ThemeProvider } from './context/ThemeContext'; // Добавь это
import TabBar from './components/TabBar';
import AnimatedRoutes from './AnimatedRoutes';

const queryClient = new QueryClient();

const AppContent = ({ user, setUser }) => {
  const location = useLocation();
  
  // Список путей, где TabBar виден (только основные табы)
  const showTabBar = ['/profile', '/settings', '/chats' ].includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', overflow: 'hidden' }}>
      <main style={{ flex: 1, position: 'relative' }}>
        <AnimatedRoutes user={user} setUser={setUser} />
      </main>
      
      {/* TabBar появляется только на главных страницах */}
      {user && showTabBar && <TabBar />}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AppContent user={user} setUser={setUser} />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;