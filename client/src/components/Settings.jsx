import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Apply theme class to <body>
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [notifications, setNotifications] = useState(
    localStorage.getItem('notifications') !== 'false'
  );

  const handleNotificationsChange = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    localStorage.setItem('notifications', newVal);
  };

  return (
    <div className="settings-panel">
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Settings</h2>
      <div className="settings-card">
        <div className="setting-group">
          <h3>Theme</h3>
          <div className="theme-buttons">
            <button
              onClick={() => setTheme('light')}
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            >
              Dark
            </button>
          </div>
        </div>
        <div className="setting-group">
          <h3>Notifications</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={notifications}
              onChange={handleNotificationsChange}
            />
            Receive email notifications about my bids
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;