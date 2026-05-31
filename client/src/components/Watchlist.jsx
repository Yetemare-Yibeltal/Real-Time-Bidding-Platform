import React from 'react';
import { useUserData } from '../context/UserDataContext';
import { useAuctionSimulator } from '../hooks/useAuctionSimulator';
import api from '../api/axios';
import { usePayment } from '../context/PaymentContext';
import { formatUSD } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

// Reuse the AuctionBox component (must be exported from App.js or moved to its own file)
// For now, I'll define a local version that mirrors the main AuctionBox styling.
// Alternatively, we can extract AuctionBox to a separate component file.

const WatchlistAuctionCard = ({ item, onBid, formatUSD, onRemove }) => {
  const [timeLeft, setTimeLeft] = React.useState('');
  const minNextBid = Number(item.currentBid || 0) + Number(item.minIncrement || 0);
  const [bidAmount, setBidAmount] = React.useState(minNextBid);
  const isExpired = new Date(item.endTime) <= new Date();

  React.useEffect(() => {
    const timer = setInterval(() => {
      const remaining = new Date(item.endTime) - new Date();
      if (remaining <= 0) {
        setTimeLeft('Expired');
        clearInterval(timer);
      } else {
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [item.endTime]);

  React.useEffect(() => {
    setBidAmount(Number(item.currentBid || 0) + Number(item.minIncrement || 0));
  }, [item.currentBid, item.minIncrement]);
  const urgent = !isExpired && timeLeft !== 'Expired' && timeLeft.split(' ')[0] === '0h';
  const isBiddable = Number.isInteger(Number(item.id));
  const { openPayment } = usePayment();
  const DEMO_BID_FEE = 5.0;

  // Star rating helper
  const renderStars = (rating = 4.5) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<span key={i} className="star star--full">★</span>);
      else if (i === fullStars + 1 && hasHalfStar) stars.push(<span key={i} className="star star--half">½</span>);
      else stars.push(<span key={i} className="star star--empty">☆</span>);
    }
    return stars;
  };

  return (
    <div className="auction-card">
      <div className="card-image">
        <img
          src={item.imagePath ? `http://localhost:5000${item.imagePath}` : 'https://picsum.photos/id/1/300/200'}
          alt={item.name}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://picsum.photos/id/1/300/200'; }}
        />
        <button
          onClick={() => onRemove(item.id)}
          className="watchlist-btn active"
          style={{ backgroundColor: '#ef4444' }}
          title="Remove from watchlist"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
      <div className="card-content">
        <h4 className="card-title">{item.name}</h4>
        <p className="card-desc">{item.description}</p>
        <div className="star-rating">
          {renderStars(item.rating || 4.5)}
          <span className="rating-number">{(item.rating || 4.5).toFixed(1)}</span>
        </div>
        <div className="bid-info">
          <div className="bid-info-row"><span className="bid-label">Current</span><span className="bid-value">{formatUSD(item.currentBid)}</span></div>
          <div className="bid-info-row"><span className="bid-label">Min next</span><span className="min-bid-value">{formatUSD(minNextBid)}</span></div>
        </div>
        <div className="card-timer">
          <i className="far fa-clock"></i>
          <span className={urgent ? 'urgent' : ''}>{timeLeft || '--:--:--'}</span>
        </div>
        {!isExpired && (
          isBiddable ? (
            <div className="bid-section">
              <label className="bid-label-small">Your bid ($)</label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                step={item.minIncrement}
                min={minNextBid}
                className="bid-input-small"
              />
              <button onClick={() => { if (typeof onBid === 'function') onBid(bidAmount); else console.warn('onBid not provided for WatchlistAuctionCard', bidAmount); }} className="bid-button-small">
                <i className="fas fa-gavel"></i> Bid
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div className="demo-badge" title="This is a demo/mock item and cannot receive bids. Use admin to create real auctions or click Pay to enable bidding for your account.">Demo item — not biddable</div>
              <button className="bid-button-small secondary" onClick={() => {
                const toPay = minNextBid || (item.currentBid + item.minIncrement);
                if (window.confirm(`Pay $${toPay.toFixed(2)} to enable bidding for this account?`)) {
                  openPayment(toPay, item.id, 'bid_access');
                }
              }}>Pay to enable bidding (${DEMO_BID_FEE})</button>
            </div>
          )
        )}
        {isExpired && <div className="expired-message"><i className="fas fa-hourglass-end"></i> Ended</div>}
      </div>
    </div>
  );
};

const Watchlist = () => {
  const { user } = useAuth();
  const { watchlist, removeFromWatchlist, addBid } = useUserData();
  const { placeBid, updateItem } = useAuctionSimulator();
  const { openPayment } = usePayment();

  const handleBid = async (item, amount) => {
    if (!user) return;
    if (!Number.isInteger(Number(item.id))) { alert('Cannot place bid on demo item'); return; }
    try {
      const result = await placeBid(item.id, amount);
      if (result && result.success) {
        // record bid in user's local bid history
        try { addBid({ itemId: item.id, itemName: item.name, amount }); } catch (e) { console.warn('addBid failed', e); }
        alert(`✅ You bid ${formatUSD(amount)} on ${item.name}!`);
        setTimeout(() => {
          if (item.active && (item.endTime - Date.now()) > 0) {
            const rivalBid = item.currentBid + item.minIncrement;
            updateItem(item.id, { currentBid: rivalBid });
          }
        }, 7000);
        } else if (result && result.needPayment) {
        try {
          openPayment(amount, item.id, 'bid_access');
        } catch (e) {
          const payload = { amount: amount, currency: 'usd', description: 'Bid access fee', purpose: 'bid_access' };
          const res = await api.post('/billing/create-session', payload);
          if (res.data?.url) window.location.href = res.data.url;
          else alert('Failed to start Checkout session');
        }
      } else {
        alert(result?.error || 'Bid failed');
      }
    } catch (err) {
      console.error('Bid error', err);
      alert('Error placing bid');
    }
  };

  if (watchlist.length === 0) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '3rem' }}>
        <i className="fas fa-eye" style={{ fontSize: '48px', color: 'var(--text-muted)' }}></i>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Your watchlist is empty. Add items from the auction page.</p>
      </div>
    );
  }

  return (
    <main className="main-content">
      <h2 className="page-title">
        <i className="fas fa-eye" style={{ marginRight: '0.5rem' }}></i> Watchlist
      </h2>
      <div className="grid-container">
        {watchlist.map(item => (
          <WatchlistAuctionCard
            key={item.id}
            item={item}
            onBid={(amount) => handleBid(item, amount)}
            formatUSD={formatUSD}
            onRemove={removeFromWatchlist}
          />
        ))}
      </div>
    </main>
  );
};

export default Watchlist;