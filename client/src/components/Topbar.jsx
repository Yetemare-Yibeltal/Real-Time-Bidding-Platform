import React from 'react';

const Topbar = ({ user }) => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <input className="topbar-search" placeholder="Search auctions, items, users..." />
      </div>
      <div className="topbar-right">
        <button className="icon-btn" title="Notifications"><i className="fas fa-bell"></i></button>
        <div className="profile-circle">
          <img src={user?.avatar || 'https://i.pravatar.cc/40'} alt={user?.name || 'User'} />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
