import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, Users } from 'lucide-react';
import { BASE_URL } from '../../api/Config';
import { useTheme } from '../../context/ThemeContext';

// Наши UI элементы
import PageContainer from '../../components/ui/PageContainer/PageContainer';
import Header from '../../components/ui/Header/Header';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';

import styles from './CreateGroupPage.module.css';

const CreateGroupPage = () => {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));

  const isValid = groupName.trim().length > 0;

  const handleCreate = async () => {
    if (!isValid) return;
    
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/chats/group`, {
        name: groupName,
        ownerId: user._id
      });
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      alert("Ошибка создания группы");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Header 
        title="Новая группа" 
        rightElement={
          <Check 
            size={24} 
            onClick={handleCreate}
            style={{ 
              opacity: isValid ? 1 : 0.3, 
              cursor: isValid ? 'pointer' : 'default' 
            }} 
          />
        }
      />

      <div className={styles.container}>
        <Input 
          placeholder="Название группы" 
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          iconLeft={<Users size={20} color="#888" />}
          autoFocus
        />
        
        <p className={styles.hint} style={{ '--accent-color': accentColor }}>
          Будет создан юзернейм: <span>@{groupName || '...'}</span>
        </p>
      </div>
    </PageContainer>
  );
};

export default CreateGroupPage;