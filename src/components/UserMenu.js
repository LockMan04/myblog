import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/'); // Chuyển về trang chủ sau khi đăng xuất
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="user-menu">
      <button className="user-avatar" onClick={toggleMenu}>
        {currentUser?.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt={currentUser.displayName || 'User'} 
            className="avatar-img"
          />
        ) : (
          <div className="avatar-placeholder">
            {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-name">
              {currentUser?.displayName || 'Người dùng'}
            </div>
            <div className="user-email">
              {currentUser?.email}
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-menu">
            <button className="dropdown-item">
              <span>👤</span>
              Hồ sơ của tôi
            </button>
            <button className="dropdown-item">
              <span>⚙️</span>
              Cài đặt
            </button>
            <button className="dropdown-item">
              <span>📝</span>
              Bài viết của tôi
            </button>
            
            <div className="dropdown-divider"></div>
            
            <button className="dropdown-item logout" onClick={handleLogout}>
              <span>🚪</span>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
