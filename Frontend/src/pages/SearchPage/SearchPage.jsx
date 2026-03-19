import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search as SearchIcon, Users, User, Hash } from 'lucide-react';
import { BASE_URL } from '../../api/Config';
import { useTheme } from '../../context/ThemeContext';

import PageContainer from '../../components/ui/PageContainer/PageContainer';
import Header from '../../components/ui/Header/Header';
import Input from '../../components/ui/Input/Input';

import styles from './SearchPage.module.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], groups: [] });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length > 2) {
      setLoading(true);
      try {
        const cleanQuery = val.startsWith('@') ? val.slice(1) : val;
        const res = await axios.get(`${BASE_URL}/users/search-all?query=${cleanQuery}`);

        // Фильтруем пользователей, чтобы не найти себя
        const filteredUsers = res.data.users.filter(u => u._id !== currentUser._id);

        setResults({
          users: filteredUsers,
          groups: res.data.groups
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setResults({ users: [], groups: [] });
    }
  };

  const startChat = async (targetUser) => {
    try {
      const res = await axios.post(`${BASE_URL}/chats/get-or-create`, {
        currentUserId: currentUser._id,
        targetUserId: targetUser._id
      });
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      alert("Не удалось создать чат");
    }
  };

  return (
    <PageContainer>
      <Header title="Поиск" />

      <div className={styles.searchWrapper}>
        <Input
          placeholder="Люди или группы..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          iconLeft={<SearchIcon size={20} color="#888" />}
        />
      </div>

      {/* Быстрые действия (показываем, когда поиск пуст) */}
      {query.length <= 2 && (
        <div className={styles.actionList}>
          <div className={styles.actionItem} onClick={() => navigate('/create-group')}>
            <div className={styles.actionIcon} style={{ color: accentColor }}>
              <Users size={22} />
            </div>
            <span className={styles.actionText}>Создать группу</span>
          </div>
        </div>
      )}

      <div className={styles.resultsContainer}>
        {/* Секция Групп */}
        {results.groups.length > 0 && (
          <>
            <div className={styles.sectionTitle}>Группы</div>
            {results.groups.map(group => (
              <div
                key={group._id}
                className={styles.resultItem}
                onClick={() => navigate(`/chat/${group._id}`)}
              >
                <div className={styles.avatar}>
                  {/* Если есть аватарка в groupInfo — ставим её, если нет — иконку */}
                  {group.groupInfo?.avatarUrl ? (
                    <img src={group.groupInfo.avatarUrl} alt="group" className={styles.avatarImg} />
                  ) : (
                    <Users size={20} />
                  )}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{group.groupInfo?.name || "Группа"}</span>
                  {console.log(group)}
                  {console.log(group.groupInfo)}
                  {console.log(group.groupInfo?.name)}
                  <span className={styles.subText}>{group.groupInfo?.username || ""}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Секция Людей */}
        {results.users.length > 0 && (
          <>
            <div className={styles.sectionTitle}>Люди</div>
            {results.users.map(user => (
              <div
                key={user._id}
                className={styles.resultItem}
                onClick={() => startChat(user)}
              >
                <div className={styles.avatar}>
                  <User size={20} />
                </div>
                <span className={styles.name}>{user.username}</span>
              </div>
            ))}
          </>
        )}

        {query.length > 2 && !loading && results.users.length === 0 && results.groups.length === 0 && (
          <div className={styles.emptyState}>Ничего не найдено</div>
        )}
      </div>
    </PageContainer>
  );
};

export default SearchPage;