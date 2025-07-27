import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import '../styles/DarkModeToggle.css';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button 
      className="dark-mode-toggle" 
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
    >
      <div className="toggle-container">
        <div className={`toggle-slider ${isDarkMode ? 'dark' : 'light'}`}>
          {isDarkMode ? (
            <Moon className="toggle-icon" size={16} />
          ) : (
            <Sun className="toggle-icon" size={16} />
          )}
        </div>
      </div>
    </button>
  );
};

export default DarkModeToggle;
