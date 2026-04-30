import React, { useState, useEffect } from 'react';

const AuctionBox = ({ item, onBid, isLive, formatUSD }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [bidAmount, setBidAmount] = useState(item.currentBid + item.minIncrement);
  const isExpired = new Date(item.endTime) <= new Date();
  const minNextBid = item.currentBid + item.minIncrement;

  const renderStars = (rating = 4.5) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star star--full">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star star--half">½</span>);
      } else {
        stars.push(<span key={i} className="star star--empty">☆</span>);
      }
    }
    return stars;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = new Date(item.endTime) - new Date();
      if (remaining <= 0) {
        setTimeLeft('Expired');
        clearInterval(timer);
      } else {
        const hours = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [item.endTime]);

  const urgent = !isExpired && timeLeft !== 'Expired' && timeLeft.split(' ')[0] === '0h';

  return (
    <div className={`auction-card ${isLive ? 'live-card' : ''}`}>
      {isLive && (
        <div className="live-header">
          <span className="live-badge-red">
            <i className="fas fa-broadcast-tower mr-1"></i> LIVE NOW
          </span>
        </div>
      )}
      <div className="card-content">
        <div className="card-title">{item.name}</div>
        <div className="card-desc">{item.description}</div>

        {/* Star ratings */}
        <div className="star-rating">
          {renderStars(item.rating || 4.5)}
          <span className="rating-number">{(item.rating || 4.5).toFixed(1)}</span>
        </div>

        <div className="bid-info">
          <div className="bid-info-row">
            <span className="bid-label">Current bid</span>
            <span className="bid-value">{formatUSD(item.currentBid)}</span>
          </div>
          <div className="bid-info-row">
            <span className="bid-label">Minimum next bid</span>
            <span className="min-bid-value">{formatUSD(minNextBid)}</span>
          </div>
        </div>

        <div className="card-timer">
          <i className="far fa-clock"></i>
          <span className={urgent ? 'urgent' : ''}>{timeLeft || '--:--:--'}</span>
        </div>

        {!isExpired && (
          <div className="bid-section">
            <label className="bid-label-small">Your bid ($)</label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(parseFloat(e.target.value))}
              className="bid-input-small"
              step={item.minIncrement}
              min={minNextBid}
            />
            <button
              onClick={() => onBid(bidAmount)}
              className="bid-button-small"
            >
              <i className="fas fa-gavel"></i> Bid
            </button>
          </div>
        )}
        {isExpired && (
          <div className="expired-message">
            <i className="fas fa-hourglass-end"></i> Auction ended
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionBox;