import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ManageAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    currentBid: '',
    minIncrement: '',
    endTime: '',
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const res = await api.get('/admin/auctions');
      setAuctions(res.data);
    } catch (err) {
      console.error('Failed to fetch auctions', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.currentBid || !form.minIncrement || !form.endTime) {
      alert('Please fill in all required fields');
      return;
    }
    const selectedDate = new Date(form.endTime);
    if (isNaN(selectedDate.getTime())) {
      alert('Please select a valid date and time');
      return;
    }
    setLoading(true);
    const data = new FormData();
    data.append('name', form.name);
    data.append('description', form.description || '');
    data.append('currentBid', form.currentBid);
    data.append('minIncrement', form.minIncrement);
    data.append('endTime', selectedDate.toISOString());
    if (form.image) data.append('image', form.image);

    try {
      if (editingId) {
        await api.put(`/admin/auctions/${editingId}`, data);
      } else {
        await api.post('/admin/auctions', data);
      }
      resetForm();
      fetchAuctions();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving auction');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndPay = async (e) => {
    e.preventDefault();
    if (!form.name || !form.currentBid || !form.minIncrement || !form.endTime) {
      alert('Please fill in all required fields before paying');
      return;
    }
    const selectedDate = new Date(form.endTime);
    if (isNaN(selectedDate.getTime())) {
      alert('Please select a valid date and time');
      return;
    }
    const listingFee = 5.00; // fixed listing fee for now
    try {
      const auctionData = {
        name: form.name,
        description: form.description || '',
        currentBid: Number(form.currentBid),
        minIncrement: Number(form.minIncrement),
        endTime: selectedDate.toISOString(),
        imagePath: '/uploads/placeholder.jpg'
      };
      const res = await api.post('/billing/create-session', { amount: listingFee, description: `Listing fee for ${form.name}`, createAuction: true, auctionData });
      if (res.data?.url) window.location.href = res.data.url;
      else alert('Failed to create checkout session');
    } catch (err) {
      console.error('Create & Pay error', err.response || err.message);
      alert('Failed to start payment');
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', currentBid: '', minIncrement: '', endTime: '', image: null });
    setEditingId(null);
  };

  const deleteAuction = async (id) => {
    if (!window.confirm('Delete this auction?')) return;
    try {
      await api.delete(`/admin/auctions/${id}`);
      fetchAuctions();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const editAuction = (auction) => {
    setEditingId(auction.id);
    setForm({
      name: auction.name,
      description: auction.description || '',
      currentBid: auction.currentBid,
      minIncrement: auction.minIncrement,
      endTime: new Date(auction.endTime).toISOString().slice(0, 16),
      image: null
    });
  };

  return (
    <main className="main-content">
      <div className="global-accent-bar"></div>
      <h2 className="page-title">Manage Auctions</h2>

      {/* Form Card */}
      <div className="settings-card">
        <h3>{editingId ? 'Edit Auction' : 'Create New Auction'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <input type="text" placeholder="Item Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input type="number" placeholder="Current Bid ($) *" value={form.currentBid} onChange={e => setForm({...form, currentBid: e.target.value})} required />
            <input type="number" placeholder="Min Increment ($) *" value={form.minIncrement} onChange={e => setForm({...form, minIncrement: e.target.value})} required />
            <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
            <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" />
            <div>
              <label>Auction Image (optional)</label>
              <input type="file" accept="image/*" onChange={e => setForm({...form, image: e.target.files[0]})} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editingId ? 'Update Auction' : 'Create Auction')}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCreateAndPay} style={{ marginLeft: 8 }}>Create & Pay ($5)</button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* List of Auctions */}
      <h3 className="section-title">Existing Auctions</h3>
      <div className="auctions-list">
        {auctions.map(auction => (
          <div key={auction.id} className="auction-list-item">
            <img src={auction.imagePath ? `http://localhost:5000${auction.imagePath}` : '/placeholder.jpg'} alt={auction.name} />
            <div className="auction-info">
              <h4>{auction.name}</h4>
              <p>{auction.description?.slice(0, 80)}...</p>
              <p>Current bid: <strong>${auction.currentBid}</strong> | Ends: {new Date(auction.endTime).toLocaleString()}</p>
            </div>
            <div className="auction-actions">
              <button onClick={() => editAuction(auction)} className="btn-warning">Edit</button>
              <button onClick={() => deleteAuction(auction.id)} className="btn-danger">Delete</button>
            </div>
          </div>
        ))}
        {auctions.length === 0 && <p className="empty-message">No auctions yet. Create your first auction above.</p>}
      </div>
    </main>
  );
}