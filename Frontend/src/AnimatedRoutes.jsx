import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';


// Страницы
import AuthPage from './pages/AuthPage/AuthPage';
import ChatListPage from './pages/ChatListPage/ChatListPage';
import SearchPage from './pages/SearchPage/SearchPage';
import ChatRoomPage from './pages/ChatRoomPage/ChatRoomPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import CreateGroupPage from './pages/CreateGroupPage/CreateGroupPage';

// Компоненты анимации
import StackTransition from './components/ui/StackTransition/StackTransition';
import TabTransition from './components/ui/TabTransition/TabTransition';

// Порядок вкладок для определения направления
const TAB_ORDER = {
    '/chats': 0,
    '/settings': 1,
    '/profile': 2
};

const AnimatedRoutes = ({ user, setUser }) => {
    const location = useLocation();
    const [direction, setDirection] = useState(0);
    const [prevPath, setPrevPath] = useState(location.pathname);

    useEffect(() => {
        const currentIndex = TAB_ORDER[location.pathname];
        const prevIndex = TAB_ORDER[prevPath];
        console.log(location.pathname)
        console.log(prevPath)
        if (currentIndex !== undefined && prevIndex !== undefined && currentIndex !== prevIndex) {
            console.log("currant: " + currentIndex)
            console.log("prev: " + prevIndex)

            const newDir = currentIndex > prevIndex ? 1 : -1;
            setDirection(newDir);

        }
        setPrevPath(location.pathname);
    }, [location.pathname]);

    const isTabRoute = TAB_ORDER[location.pathname] !== undefined;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <AnimatePresence initial={false} custom={direction} mode={isTabRoute ? "popLayout" : "sync"}>
                <Routes location={location} key={location.pathname}>
                    {!user ? (
                        <Route path="*" element={<AuthPage setUser={setUser} />} />
                    ) : (
                        <>
                            {/* Вкладки (Листаются вправо/влево) */}
                            <Route path="/chats" element={<TabTransition direction={direction}><ChatListPage /></TabTransition>} />
                            <Route path="/settings" element={<TabTransition direction={direction}><SettingsPage /></TabTransition>} />
                            <Route path="/profile" element={<TabTransition direction={direction}><ProfilePage setUser={setUser} /></TabTransition>} />

                            {/* Чаты (Наслаиваются сверху) */}
                            <Route path="/chat/:id" element={<StackTransition><ChatRoomPage /></StackTransition>} />
                            <Route path="/search" element={<StackTransition><SearchPage /></StackTransition>} />
                            <Route path="/create-group" element={<StackTransition><CreateGroupPage /></StackTransition>} />

                            <Route path="*" element={<Navigate to="/chats" replace />} />
                        </>
                    )}
                </Routes>
            </AnimatePresence>
        </div>
    );
};

export default AnimatedRoutes;