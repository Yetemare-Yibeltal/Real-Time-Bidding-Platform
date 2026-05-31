import React from 'react';

const Toast = ({ message, visible }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-5 right-5 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl text-sm z-50 transition-all duration-300 animate-pulse">
      {message}
    </div>
  );
};

export default Toast;