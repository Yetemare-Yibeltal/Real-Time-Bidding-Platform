import React from 'react';
// No external CSS import needed – the classes are in index.css

const Sidebar = ({ showToast }) => {
  const menuItems = [
    { name: 'All Auctions', icon: 'store', view: 'all-auctions' },
    { name: 'My Bids', icon: 'gavel', view: 'my-bids' },
    { name: 'Watchlist', icon: 'eye', view: 'watchlist' },
    { name: 'Messages', icon: 'envelope', view: 'messages' },
    { name: 'Profile', icon: 'user-circle', view: 'profile' },
    { name: 'Settings', icon: 'cog', view: 'settings' },
  ];

  const handleClick = (e, name) => {
    e.preventDefault();
    showToast(`📱 Dashboard: ${name} (demo view)`);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1><i className="fas fa-gavel"></i> BidMaster</h1>
        <p>Online Auction Platform</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <a key={item.name} href="#" onClick={(e) => handleClick(e, item.name)}>
            <i className={`fas fa-${item.icon}`}></i>
            <span>{item.name}</span>
          </a>
        ))}
        <hr />
        <a href="#" className="logout" onClick={(e) => { e.preventDefault(); showToast('🚪 Logged out (demo)'); }}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;