import React, { useEffect, useState } from 'react';
import socket from '../socket/socket';

const LiveActivity = ({ activities = [] }) => {
  // activities: [{id, userName, amount, timeAgo}]
  const sample = activities.length ? activities : [
    { id: 1, userName: 'John Doe', amount: 1250, timeAgo: '2s' },
    { id: 2, userName: 'Sarah K.', amount: 1200, timeAgo: '30s' },
    { id: 3, userName: 'Alex M.', amount: 1150, timeAgo: '1m' },
    { id: 4, userName: 'Priya W.', amount: 1100, timeAgo: '2m' },
  ];

  const [activitiesState, setActivities] = useState(sample);

  useEffect(() => {
    const handler = (payload) => {
      const userName = payload.user?.name || 'Anonymous';
      const auctionName = payload.auction?.name || `#${payload.itemId}`;
      const amount = payload.newBid ?? payload.amount ?? 0;
      const timeAgo = 'now';
      const entry = { id: Date.now(), userName, amount, timeAgo, auctionName };
      setActivities(prev => [entry, ...prev].slice(0, 50));
    };
    socket.on('live_activity', handler);
    return () => { socket.off('live_activity', handler); };
  }, []);

  return (
    <aside className="activity-column">
      <div className="activity-header">
        <h4>Live Bidding Activity</h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="activity-count">{sample.length}</span>
          <div className="live-dot" title="Live updates">
            <i className="fas fa-circle"></i>
          </div>
        </div>
      </div>
      <ul className="activity-list">
        {activitiesState.map(a => (
          <li key={a.id} className="activity-item">
            <div className="activity-avatar">{(a.userName || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
            <div className="activity-body">
              <div className="activity-user">{a.userName}</div>
              <div className="activity-meta">bid on {a.auctionName} • {a.timeAgo}</div>
            </div>
            <div className="activity-amount">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(a.amount)}</div>
          </li>
        ))}
      </ul>
      <div className="activity-footer">
        <button className="view-all-btn">View All Activity</button>
      </div>
    </aside>
  );
};

export default LiveActivity;
