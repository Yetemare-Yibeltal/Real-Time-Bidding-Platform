import React from 'react';
import { useUserData } from '../context/UserDataContext';
import { formatUSD } from '../utils/helpers';

const MyBids = () => {
  const { myBids } = useUserData();

  if (myBids.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <i className="fas fa-gavel" style={{ fontSize: '48px', color: '#9ca3af' }}></i>
        <p style={{ marginTop: '1rem', color: '#6b7280' }}>You haven't placed any bids yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>My Bids</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {myBids.map(bid => (
          <div key={bid.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 'bold' }}>{bid.itemName}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Placed on {new Date(bid.timestamp).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#15803d' }}>{formatUSD(bid.amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBids;