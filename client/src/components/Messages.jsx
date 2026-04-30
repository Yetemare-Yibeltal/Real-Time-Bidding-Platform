import React from 'react';

const Messages = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <i className="fas fa-envelope" style={{ fontSize: '64px', color: '#9ca3af' }}></i>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '16px' }}>Messages</h2>
      <p style={{ color: '#6b7280', marginTop: '8px' }}>You have no new messages. This feature will be available soon.</p>
    </div>
  );
};

export default Messages;