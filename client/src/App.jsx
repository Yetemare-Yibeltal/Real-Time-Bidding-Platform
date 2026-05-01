import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useUserData } from './context/UserDataContext';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import MyBids from './components/MyBids';
import Watchlist from './components/Watchlist';
import Messages from './components/Messages';
import Profile from './components/Profile';
import Settings from './components/Settings';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageUsers from './components/admin/ManageUsers';
import ManageAuctions from './components/admin/ManageAuctions';
import Billing from './components/admin/Billing';
import Payments from './components/admin/Payments';
import OtherAuctionsManager from './components/admin/OtherAuctionsManager';
import Topbar from './components/Topbar';
import LiveActivity from './components/LiveActivity';
import { useAuctionSimulator } from './hooks/useAuctionSimulator';
import { PaymentProvider, usePayment } from './context/PaymentContext';
import { formatUSD } from './utils/helpers';
import api from './api/axios';

// Toast Component
const Toast = ({ message, visible }) => {
  if (!visible) return null;
  return <div className="toast">{message}</div>;
};

// Sidebar Component (unchanged except added link)
const Sidebar = ({ showToast, user, logout }) => {
  const location = useLocation();
  const menuItems = [
    { name: 'All Auctions', icon: 'store', path: '/' },
    { name: 'My Bids', icon: 'gavel', path: '/my-bids' },
    { name: 'Watchlist', icon: 'eye', path: '/watchlist' },
    { name: 'Messages', icon: 'envelope', path: '/messages' },
    { name: 'Profile', icon: 'user-circle', path: '/profile' },
    { name: 'Settings', icon: 'cog', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;
  const isAdminActive = () => location.pathname.startsWith('/admin');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1><i className="fas fa-gavel"></i> BidMaster</h1>
        <p>Online Auction Platform</p>
        {user && <p className="welcome-text">Welcome, {user.name}!</p>}
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.name}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <i className={`fas fa-${item.icon}`}></i>
            <span>{item.name}</span>
          </Link>
        ))}
        {user?.role === 'admin' && (
          <>
            <hr />
            <Link to="/admin" className={`sidebar-link ${isAdminActive() ? 'active' : ''}`}>
              <i className="fas fa-shield-alt"></i> Admin Dashboard
            </Link>
            {/* 👇 NEW SIDEBAR LINK for Other Auction Items */}
            <Link to="/admin/other-auctions" className="sidebar-link">
              <i className="fas fa-list-ul"></i> Other Auction Items
            </Link>
            <Link to="/admin/billing" className="sidebar-link">
              <i className="fas fa-credit-card"></i> Billing
            </Link>
            <Link to="/admin/payments" className="sidebar-link">
              <i className="fas fa-receipt"></i> Payments
            </Link>
          </>
        )}
        <hr />
        <a href="#" className="sidebar-link logout" onClick={(e) => { e.preventDefault(); logout(); showToast('🚪 Logged out'); }}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </a>
      </nav>
    </aside>
  );
};

// AuctionBox Component – with Edit (pencil) and Camera buttons for admin
const AuctionBox = ({ item, onBid, formatUSD, isInWatchlist, onToggleWatchlist, user, onEdit, onImageUpdate, onUpdate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [bidAmount, setBidAmount] = useState(item.currentBid + item.minIncrement);
  const isExpired = new Date(item.endTime) <= new Date();
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = new Date(item.endTime) - new Date();
      if (remaining <= 0) { setTimeLeft('Expired'); clearInterval(timer); }
      else { const h = Math.floor(remaining/3600000), m = Math.floor((remaining%3600000)/60000), s = Math.floor((remaining%60000)/1000); setTimeLeft(`${h}h ${m}m ${s}s`); }
    }, 1000);
    return () => clearInterval(timer);
  }, [item.endTime]);

  useEffect(() => { setBidAmount(item.currentBid + item.minIncrement); }, [item.currentBid, item.minIncrement]);

  const minNextBid = item.currentBid + item.minIncrement;
  const urgent = !isExpired && timeLeft !== 'Expired' && timeLeft.split(' ')[0] === '0h';
  const isBiddable = Number.isInteger(Number(item.id));
  const { openPayment, startCheckout } = usePayment();
  const DEMO_BID_FEE = 5.0;

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.put(`/admin/auctions/${item.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (onImageUpdate) onImageUpdate(item.id, response.data.imagePath);
      // showToast('Image updated');
    } catch (err) {
      console.error('Image update failed', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMinEdit = async () => {
    if (!user || user.role !== 'admin') return;
    const input = window.prompt('Enter new minimum increment ($)', String(item.minIncrement || '0'));
    if (input === null) return;
    const val = parseFloat(input);
    if (isNaN(val) || val < 0) { alert('Invalid minimum increment'); return; }
    const formData = new FormData();
    formData.append('name', item.name || '');
    formData.append('description', item.description || '');
    formData.append('currentBid', String(item.currentBid || 0));
    formData.append('minIncrement', String(val));
    formData.append('endTime', new Date(item.endTime).toISOString());
    formData.append('active', item.active ? 'true' : 'false');
    try {
      const res = await api.put(`/admin/auctions/${item.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (onUpdate) onUpdate(item.id, {
        minIncrement: res.data.minIncrement,
        currentBid: res.data.currentBid,
        imagePath: res.data.imagePath,
        endTime: new Date(res.data.endTime).getTime(),
        name: res.data.name,
        description: res.data.description
      });
    } catch (err) {
      console.error('Min increment update failed', err.response?.data || err.message);
      alert('Update failed');
    }
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
          onClick={() => onToggleWatchlist(item)}
          className={`watchlist-btn ${isInWatchlist ? 'active' : ''}`}
        >
          <i className={`fas fa-${isInWatchlist ? 'heart' : 'heart-broken'}`}></i>
        </button>
            {user?.role === 'admin' && (
          <>
            <button
              className="edit-card-btn"
              onClick={() => onEdit(item)}
              title="Edit all details"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
            <button
              className="camera-btn"
              onClick={() => document.getElementById(`file-input-${item.id}`).click()}
              title="Change image only"
              disabled={uploadingImage}
            >
              <i className="fas fa-camera"></i>
            </button>
                <button
                  className="min-edit-btn"
                  onClick={handleMinEdit}
                  title="Edit minimum increment"
                >
                  Min
                </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </>
        )}
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
              <input type="number" value={bidAmount} onChange={(e) => setBidAmount(parseFloat(e.target.value))} step={item.minIncrement} min={minNextBid} className="bid-input-small" />
              <button onClick={() => onBid(bidAmount)} className="bid-button-small">
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

// LiveTimer Component
const LiveTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = new Date(endTime) - new Date();
      if (remaining <= 0) { setTimeLeft('Expired'); clearInterval(timer); }
      else { const h = Math.floor(remaining/3600000), m = Math.floor((remaining%3600000)/60000), s = Math.floor((remaining%60000)/1000); setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`); }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);
  return <div className="timer-display">{timeLeft}</div>;
};

// AuctionPage Component
const AuctionPage = ({ showToast }) => {
  const { user } = useAuth();
  const { addBid, isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserData();
  const { liveItem, otherItems, loading, placeBid, updateItem, refreshAuctions } = useAuctionSimulator();
  const { openPayment } = usePayment();

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    currentBid: '',
    minIncrement: '',
    endTime: '',
    image: null,
    imagePreview: ''
  });
  const [updating, setUpdating] = useState(false);
  const [uploadingLiveImage, setUploadingLiveImage] = useState(false);
  // NOTE: payment modal moved to PaymentContext; use `usePayment()` inside components

  useEffect(() => {
    if (editingItem) {
      setEditForm({
        name: editingItem.name || '',
        description: editingItem.description || '',
        currentBid: editingItem.currentBid || '',
        minIncrement: editingItem.minIncrement || '',
        endTime: new Date(editingItem.endTime).toISOString().slice(0, 16),
        image: null,
        imagePreview: editingItem.imagePath ? `http://localhost:5000${editingItem.imagePath}` : ''
      });
    }
  }, [editingItem]);

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setUpdating(true);
    const numericId = Number(editingItem.id);
    console.log('Editing auction id:', editingItem.id, 'numeric:', numericId);
    if (isNaN(numericId)) {
      showToast('❌ Invalid auction ID');
      setUpdating(false);
      return;
    }
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('description', editForm.description || '');
    formData.append('currentBid', parseFloat(editForm.currentBid).toString());
    formData.append('minIncrement', parseFloat(editForm.minIncrement).toString());
    formData.append('endTime', new Date(editForm.endTime).toISOString());
    formData.append('active', 'true');
    if (editForm.image) formData.append('image', editForm.image);
    try {
      const response = await api.put(`/admin/auctions/${numericId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updated = response.data;
      updateItem(editingItem.id, {
        name: updated.name,
        description: updated.description,
        currentBid: updated.currentBid,
        minIncrement: updated.minIncrement,
        endTime: new Date(updated.endTime).getTime(),
        imagePath: updated.imagePath
      });
      showToast('✅ Auction updated');
      setEditModalOpen(false);
      setEditingItem(null);
      refreshAuctions();
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      showToast(`❌ ${err.response?.data?.error || 'Update failed'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleLiveImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLiveImage(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.put(`/admin/auctions/${liveItem.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateItem(liveItem.id, { imagePath: response.data.imagePath });
      showToast('✅ Live image updated');
    } catch (err) {
      showToast('❌ Image update failed');
    } finally {
      setUploadingLiveImage(false);
    }
  };

  const handleCardImageUpdate = (itemId, newImagePath) => {
    updateItem(itemId, { imagePath: newImagePath });
    showToast('✅ Image updated');
  };

  const BID_FEE_USD = 5.0;
  const PAY_PER_BID = true; // when true, every bid click triggers a payment for that bid amount
  const handlePlaceBid = async (itemId, amount, isLive = true, bypassPayment = false) => {
    if (!user) { showToast('Please login to bid'); return; }
    const item = isLive ? liveItem : otherItems.find(i => i.id === itemId);
    if (!item) return;
    // If pay-per-bid is enabled, require a payment per bid unless bypassPayment is true
    if (PAY_PER_BID && !bypassPayment) {
      showToast('Payment required to place this bid');
      try {
        await startCheckout({ fee: amount, purpose: 'bid_payment', itemId });
      } catch (e) {
        openPayment(amount, itemId, 'bid_payment');
      }
      return;
    }
    // Prevent bidding on demo/non-numeric items
    if (!Number.isInteger(Number(itemId))) { showToast('Cannot place bid on demo item'); return; }
    try {
      const result = await placeBid(itemId, amount);
      if (result && result.success) {
        addBid({ itemId, itemName: item.name, amount });
        showToast(`✅ You bid ${formatUSD(amount)} on ${item.name}!`);
        setTimeout(() => {
          if (item.active && (item.endTime - Date.now()) > 0) {
            const rivalBid = item.currentBid + item.minIncrement;
            updateItem(itemId, { currentBid: rivalBid });
            showToast(`⚡ New bid on ${item.name}: ${formatUSD(rivalBid)}`);
          }
        }, 7000);
      } else if (result && result.needPayment) {
        openPayment(amount, itemId, 'bid_access');
      } else {
        showToast(`❌ Bid failed: ${result?.error || 'unknown'}`);
      }
    } catch (e) {
      console.error('Place bid error', e);
      showToast('❌ Error placing bid');
    }
  };

  // On return from checkout, if there's a pending bid saved, attempt to place it
  useEffect(() => {
    const tryPending = async () => {
      if (!user || !user.hasBidAccess) return;
      const raw = localStorage.getItem('pendingBid');
      if (!raw) return;
      try {
        const obj = JSON.parse(raw);
        if (!obj || !obj.itemId || !obj.amount) { localStorage.removeItem('pendingBid'); return; }
        // directly call placeBid API (bypass payment) because payment just completed
        const result = await placeBid(obj.itemId, obj.amount);
        if (result && result.success) {
          addBid({ itemId: obj.itemId, itemName: (otherItems.find(i=>i.id==obj.itemId)||liveItem||{}).name, amount: obj.amount });
          showToast(`✅ Your paid bid ${formatUSD(obj.amount)} was placed.`);
          // update local UI optimistically
          const rival = (otherItems.find(i=>i.id==obj.itemId)||liveItem||{}).currentBid || 0;
          updateItem(obj.itemId, { currentBid: Math.max(rival, obj.amount) });
        } else {
          showToast('❌ Paid bid failed to place');
        }
      } catch (e) {
        console.error('Failed to place pending bid', e);
      } finally {
        localStorage.removeItem('pendingBid');
      }
    };
    tryPending();
  }, [user, liveItem, otherItems]);

  const handleToggleWatchlist = (item) => {
    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
      showToast(`Removed ${item.name} from watchlist`);
    } else {
      addToWatchlist({ ...item, currentBid: item.currentBid });
      showToast(`Added ${item.name} to watchlist`);
    }
  };

  if (loading) return <div className="loading">Loading auction...</div>;
  if (!liveItem) return <div className="loading">No active auctions available.</div>;

  return (
    <main className="main-content">
      {/* Universal Edit Modal */}
      {editModalOpen && editingItem && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Auction: {editingItem.name}</h3>
            <form onSubmit={handleEditSubmit}>
              <label>Name *</label>
              <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              <label>Description</label>
              <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows="3" />
              <label>Current Bid ($) *</label>
              <input type="number" step="0.01" value={editForm.currentBid} onChange={e => setEditForm({...editForm, currentBid: e.target.value})} required />
              <label>Min Increment ($) *</label>
              <input type="number" step="0.01" value={editForm.minIncrement} onChange={e => setEditForm({...editForm, minIncrement: e.target.value})} required />
              <label>End Time *</label>
              <input type="datetime-local" value={editForm.endTime} onChange={e => setEditForm({...editForm, endTime: e.target.value})} required />
              <label>Image</label>
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files[0];
                if (file) setEditForm({...editForm, image: file, imagePreview: URL.createObjectURL(file)});
              }} />
              {editForm.imagePreview && <img src={editForm.imagePreview} alt="Preview" style={{ width: '100px', marginTop: '8px', borderRadius: '8px' }} />}
              <div className="modal-buttons">
                <button type="submit" disabled={updating}>{updating ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => setEditModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment modal is provided globally by PaymentProvider */}

      {/* Live Auction Header */}
      <Topbar user={user} />

      <div className="live-badge">
        <h2>Live Auction</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="update-indicator"><i className="fas fa-circle"></i> Live Updates</div>
          {user?.role === 'admin' && (
            <button className="edit-live-btn" onClick={() => openEditModal(liveItem)}>
              <i className="fas fa-pencil-alt"></i> Edit
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          {/* Live Card */}
          <div className="live-card">
        <div className="live-header">
          <span className="live-badge-red"><i className="fas fa-broadcast-tower"></i> LIVE NOW</span>
        </div>
        <div className="live-body">
          <div className="live-flex">
            <div className="live-image-container">
              <img
                src={liveItem.imagePath ? `http://localhost:5000${liveItem.imagePath}` : 'https://picsum.photos/id/1/300/200'}
                alt={liveItem.name}
                className="live-image"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://picsum.photos/id/1/300/200'; }}
              />
              {user?.role === 'admin' && (
                <>
                  <button
                    className="camera-btn live-camera-btn"
                    onClick={() => document.getElementById('live-image-input').click()}
                    disabled={uploadingLiveImage}
                    title="Change image"
                  >
                    <i className="fas fa-camera"></i>
                  </button>
                  <input
                    type="file"
                    id="live-image-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLiveImageChange}
                  />
                </>
              )}
            </div>
            <div className="live-info">
              <h3>{liveItem.name}</h3>
              <p>{liveItem.description}</p>
              <div className="bid-panel">
                <div className="bid-row">
                  <span>Current Highest Bid</span>
                  <span className="current-bid">{formatUSD(liveItem.currentBid)}</span>
                </div>
                <div className="bid-row">
                  <span>Minimum Next Bid</span>
                  <span className="min-bid">{formatUSD(liveItem.currentBid + liveItem.minIncrement)}</span>
                </div>
              </div>
              <div className="bid-form">
                <label>Your Bid ($)</label>
                <div className="bid-input-group">
                  <input type="number" id="liveBidInput" defaultValue={liveItem.currentBid + liveItem.minIncrement} step={liveItem.minIncrement} min={liveItem.currentBid + liveItem.minIncrement} />
                  <button className="bid-button" onClick={() => { const inp = document.getElementById('liveBidInput'); const amt = parseFloat(inp.value); if (!isNaN(amt)) handlePlaceBid(liveItem.id, amt, true); }}>
                    <i className="fas fa-gavel"></i> Place Bid
                  </button>
                </div>
              </div>
              <div className="live-timer-info">
                <p>Premium auction ends in</p>
                <LiveTimer endTime={liveItem.endTime} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Auction Items section */}
      <div className="other-header">
        <h3><i className="fas fa-list-ul"></i> Other Auction Items</h3>
        <span className="realtime-tag">Real-time active</span>
      </div>
      <div className="grid-container">
        {otherItems.map(item => (
          <AuctionBox
            key={item.id}
            item={item}
            onBid={(amount) => handlePlaceBid(item.id, amount, false)}
            formatUSD={formatUSD}
            isInWatchlist={isInWatchlist(item.id)}
            onToggleWatchlist={() => handleToggleWatchlist(item)}
            user={user}
            onEdit={openEditModal}
            onImageUpdate={handleCardImageUpdate}
            onUpdate={updateItem}
          />
        ))}
      </div>

        </div>
        <div className="dashboard-right">
          <LiveActivity />
        </div>
      </div>
    </main>
  );
};

// Main App Component
function App() {
  const { user, logout, loading } = useAuth();
  const [toast, setToast] = useState({ message: '', visible: false });
  const showToast = useCallback((msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2800);
  }, []);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;
    if (checkout === 'success') {
      showToast('✅ Payment successful — updating account');
      // mark local quick-flag so subsequent clicks skip payment immediately
      try { localStorage.setItem('hasBidAccess', 'true'); } catch (e) { }
      // remove query params and force reload so AuthContext refreshes user
      window.history.replaceState({}, document.title, location.pathname);
      setTimeout(() => window.location.reload(), 900);
    } else if (checkout === 'cancel') {
      showToast('❌ Payment canceled');
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, location.pathname, showToast]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app-container">
      <div className="global-accent-bar"></div>
      <PaymentProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><AdminDashboard /></></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><ManageUsers /></></AdminRoute>} />
        <Route path="/admin/auctions" element={<AdminRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><ManageAuctions /></></AdminRoute>} />
        <Route path="/admin/other-auctions" element={<AdminRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><OtherAuctionsManager /></></AdminRoute>} />
        <Route path="/admin/billing" element={<AdminRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><Billing /></></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><Payments /></></AdminRoute>} />
        <Route path="/" element={<PrivateRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><AuctionPage showToast={showToast} /></></PrivateRoute>} />
        <Route path="/my-bids" element={<PrivateRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><MyBids /></></PrivateRoute>} />
        <Route path="/watchlist" element={<PrivateRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><Watchlist /></></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><Messages /></></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><Profile /></></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><><Sidebar showToast={showToast} user={user} logout={logout} /><Settings /></></PrivateRoute>} />
      </Routes>
      </PaymentProvider>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

export default App;