import React, { useState, useRef, useEffect } from 'react';
import socket from '../socket/socket';

const Topbar = ({ user, onToggleAssist }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Your bid was outbid', time: '2m' },
    { id: 2, text: 'Payment succeeded', time: '1h' },
  ]);
  const wrapperRef = useRef();

  useEffect(() => {
    const onDoc = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', onDoc);

    // Socket notifications: new messages and live bids
    const onNewMessage = (msg) => {
      const from = msg.sender?.name || msg.sender?.email || 'Someone';
      setNotifications(prev => [{ id: Date.now(), text: `${from} sent you a message`, time: 'now' }, ...prev].slice(0, 20));
    };
    const onLiveActivity = (payload) => {
      const name = payload.user?.name || payload.user?.id || 'Bidder';
      const amount = payload.newBid ?? payload.amount ?? 0;
      setNotifications(prev => [{ id: Date.now(), text: `${name} placed a bid ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount)}`, time: 'now' }, ...prev].slice(0, 20));
    };
    const onPaymentUpdate = (payload) => {
      const amt = payload?.amount ?? 0;
      const text = payload?.purpose ? `Payment succeeded (${payload.purpose}) - ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amt)}` : `Payment succeeded - ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amt)}`;
      setNotifications(prev => [{ id: Date.now(), text, time: 'now' }, ...prev].slice(0, 20));
    };
    socket.on('new_message', onNewMessage);
    socket.on('live_activity', onLiveActivity);
    socket.on('payment_update', onPaymentUpdate);
    const onAssistantReply = (e) => {
      const text = e?.detail?.text || 'Assistant replied';
      setNotifications(prev => [{ id: Date.now(), text: `Assistant: ${String(text).slice(0,80)}`, time: 'now' }, ...prev].slice(0, 20));
    };
    window.addEventListener('assistant-reply', onAssistantReply);

    return () => {
      document.removeEventListener('click', onDoc);
      socket.off('new_message', onNewMessage);
      socket.off('live_activity', onLiveActivity);
      socket.off('payment_update', onPaymentUpdate);
      window.removeEventListener('assistant-reply', onAssistantReply);
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      const q = search.trim();
      if (!q) return;
      window.dispatchEvent(new CustomEvent('topbar-search', { detail: { query: q } }));
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <input
          className="topbar-search"
          placeholder="Search auctions, items, users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="icon-btn assist-left" title="Assistant" onClick={() => window.dispatchEvent(new CustomEvent('toggle-assist'))} style={{ marginLeft: 10 }}>
          <i className="fas fa-robot"></i>
        </button>
      </div>
      <div className="topbar-right" ref={wrapperRef}>
        <div className="profile-info">
          <div className="profile-circle">
            <img src={user?.avatar || 'https://i.pravatar.cc/40'} alt={user?.name || 'User'} />
          </div>
          <div className="topbar-username">{user?.name || 'Guest'}</div>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" title="Notifications" onClick={() => setOpen(o => !o)}>
            <i className="fas fa-bell"></i>
            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </button>
          {open && (
            <div className="notif-dropdown">
              <div className="notif-header">Notifications</div>
              <ul>
                {notifications.map(n => (
                  <li key={n.id} className="notif-item">
                    <div className="notif-text">{n.text}</div>
                    <div className="notif-time">{n.time}</div>
                  </li>
                ))}
              </ul>
              <div className="notif-footer"><button className="view-all-btn">View all</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
