import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ColorSettings from './ColorSettings';
import { useAuctionSimulator } from '../../hooks/useAuctionSimulator';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, auctions: 0, bids: 0 });
  const { liveItem, refreshAuctions } = useAuctionSimulator();

  // State for "Add Live Product" modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    currentBid: '',
    minIncrement: '',
    endTime: '',
    image: null
  });
  const [adding, setAdding] = useState(false);

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    const formData = new FormData();
    formData.append('name', addForm.name);
    formData.append('description', addForm.description || '');
    formData.append('currentBid', parseFloat(addForm.currentBid).toString());
    formData.append('minIncrement', parseFloat(addForm.minIncrement).toString());
    formData.append('endTime', new Date(addForm.endTime).toISOString());
    if (addForm.image) formData.append('image', addForm.image);

    try {
      await api.post('/admin/auctions', formData);
      alert('✅ Auction created successfully!');
      setShowAddModal(false);
      setAddForm({ name: '', description: '', currentBid: '', minIncrement: '', endTime: '', image: null });
      refreshAuctions(); // refresh the live auction display
      fetchStats(); // update stats
    } catch (err) {
      alert('❌ Failed to create auction');
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteLive = async () => {
    if (!liveItem) return;
    try {
      await api.delete(`/admin/auctions/${liveItem.id}`);
      alert(`🗑️ "${liveItem.name}" deleted`);
      refreshAuctions(); // refresh – the next active auction becomes live
      fetchStats();
      setShowDeleteConfirm(false);
    } catch (err) {
      alert('❌ Delete failed');
      console.error(err);
    }
  };

  // NEW: Seed mock auctions into database with confirmation and optional count
  const seedMockAuctions = async () => {
    const confirmMsg = 'Seed mock auctions will add test items to your database. This operation is intended for development only. Continue?';
    if (!window.confirm(confirmMsg)) return;

    let count = 4; // default number of items
    const userInput = window.prompt('How many mock auctions would you like to add? (1-20)', '4');
    if (userInput !== null) {
      const n = parseInt(userInput, 10);
      if (!isNaN(n) && n > 0 && n <= 100) count = n;
    }

    try {
      await api.post('/admin/seed-mock-auctions', { count });
      alert('✅ Mock auctions added to your database!');
      refreshAuctions();   // refresh live/other items on main page
      fetchStats();        // update stats
      window.dispatchEvent(new CustomEvent('auctions-updated')); // refresh other manager if open
    } catch (err) {
      alert('❌ Failed to seed mock auctions: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <main className="main-content">
      <h2 className="page-title">Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="admin-stats-card">
          <h3>Total Users</h3>
          <p className="stats-number">{stats.users}</p>
        </div>
        <div className="admin-stats-card">
          <h3>Active Auctions</h3>
          <p className="stats-number">{stats.auctions}</p>
        </div>
        <div className="admin-stats-card">
          <h3>Total Bids</h3>
          <p className="stats-number">{stats.bids}</p>
        </div>
      </div>

      <div className="admin-actions">
        <Link to="/admin/users" className="admin-action-btn">Manage Users</Link>
        <Link to="/admin/auctions" className="admin-action-btn">Manage Auctions</Link>
        <Link to="/admin/other-auctions" className="admin-action-btn">Other Auction Items</Link>
        {/* NEW: Seed Mock Auctions button */}
        <button className="admin-action-btn" onClick={seedMockAuctions}>
          🌱 Seed Mock Auctions
        </button>
        <button className="admin-action-btn" onClick={() => setShowAddModal(true)}>
          + Add Live Product
        </button>
        {liveItem && (
          <button className="admin-action-btn danger-btn" onClick={() => setShowDeleteConfirm(true)}>
            🗑️ Delete Current Live
          </button>
        )}
      </div>

      {/* Color settings */}
      <ColorSettings />

      {/* Modal: Add Live Product */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Live Auction</h3>
            <form onSubmit={handleAddSubmit}>
              <label>Product Name *</label>
              <input
                type="text"
                required
                value={addForm.name}
                onChange={e => setAddForm({...addForm, name: e.target.value})}
              />

              <label>Description</label>
              <textarea
                rows="3"
                value={addForm.description}
                onChange={e => setAddForm({...addForm, description: e.target.value})}
              />

              <label>Starting Bid ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={addForm.currentBid}
                onChange={e => setAddForm({...addForm, currentBid: e.target.value})}
              />

              <label>Minimum Increment ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={addForm.minIncrement}
                onChange={e => setAddForm({...addForm, minIncrement: e.target.value})}
              />

              <label>End Time *</label>
              <input
                type="datetime-local"
                required
                value={addForm.endTime}
                onChange={e => setAddForm({...addForm, endTime: e.target.value})}
              />

              <label>Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setAddForm({...addForm, image: e.target.files[0]})}
              />

              <div className="modal-buttons">
                <button type="submit" disabled={adding}>
                  {adding ? 'Creating...' : 'Create Auction'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {showDeleteConfirm && liveItem && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Live Auction</h3>
            <p>Are you sure you want to delete <strong>"{liveItem.name}"</strong>?</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="danger-btn" onClick={handleDeleteLive}>Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}