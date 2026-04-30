import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const OtherAuctionsManager = () => {
  const [otherItems, setOtherItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', description: '', currentBid: '', minIncrement: '', endTime: '', image: null, imagePreview: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOtherItems();
  }, []);

  const fetchOtherItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auctions');
      console.log('🔍 Raw API response:', res.data);
      
      let auctions = res.data;
      if (!Array.isArray(auctions)) auctions = [];
      
      const now = Date.now();
      const processed = auctions.map(a => {
        // Ensure endTime is a timestamp
        let endTimeMs = a.endTime;
        if (typeof a.endTime === 'string') {
          endTimeMs = new Date(a.endTime).getTime();
        }
        return {
          ...a,
          endTime: endTimeMs,
          active: endTimeMs > now,
        };
      });
      
      console.log('📊 Processed auctions:', processed);
      
      const activeAuctions = processed.filter(a => a.active);
      console.log('✅ Active auctions:', activeAuctions);
      
      // Sort by endTime (earliest first)
      activeAuctions.sort((a, b) => a.endTime - b.endTime);
      
      // The first active is the "live" item; the rest are "other"
      const others = activeAuctions.slice(1);
      console.log('🟢 Other auctions (non-live):', others);
      
      setOtherItems(others);
    } catch (err) {
      console.error('❌ Failed to fetch other auctions', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name || '',
      description: item.description || '',
      currentBid: item.currentBid || '',
      minIncrement: item.minIncrement || '',
      endTime: new Date(item.endTime).toISOString().slice(0, 16),
      image: null,
      imagePreview: item.imagePath ? `http://localhost:5000${item.imagePath}` : ''
    });
  };

  const handleChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setEditForm({ ...editForm, image: file, imagePreview: URL.createObjectURL(file) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setUpdating(true);
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('description', editForm.description);
    formData.append('currentBid', parseFloat(editForm.currentBid));
    formData.append('minIncrement', parseFloat(editForm.minIncrement));
    formData.append('endTime', new Date(editForm.endTime).toISOString());
    formData.append('active', 'true');
    if (editForm.image) formData.append('image', editForm.image);
    try {
      await api.put(`/admin/auctions/${editingItem.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      window.dispatchEvent(new CustomEvent('auctions-updated'));
      alert('✅ Other auction item updated');
      setEditingItem(null);
      fetchOtherItems();
    } catch (err) {
      alert('❌ Update failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this auction? This action is permanent.')) return;
    try {
      await api.delete(`/admin/auctions/${id}`);
      alert('Deleted');
      fetchOtherItems();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleForceEnd = async (id) => {
    if (!window.confirm('Force end this auction now?')) return;
    try {
      await api.post(`/admin/auctions/${id}/force-end`);
      alert('Auction forced to end');
      fetchOtherItems();
    } catch (err) {
      alert('Force end failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div>Loading other auction items...</div>;

  return (
    <div className="other-auctions-manager" style={{ padding: '20px' }}>
      <h2>🛠️ Manage "Other Auction Items" (non‑live auctions)</h2>
      <p>These are the auctions shown below the live card. Click "Edit" to change any field.</p>
      
      {otherItems.length === 0 ? (
        <p style={{ color: 'orange' }}>⚠️ No other active auctions found. Only the live auction exists.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Image</th><th>Name</th><th>Current Bid</th><th>Min Inc</th><th>End Time</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {otherItems.map(item => (
              <tr key={item.id}>
                <td><img src={item.imagePath ? `http://localhost:5000${item.imagePath}` : '/placeholder.jpg'} width="50" style={{ borderRadius: '4px' }} alt="" /></td>
                <td>{item.name}</td>
                <td>${item.currentBid}</td>
                <td>${item.minIncrement}</td>
                <td>{new Date(item.endTime).toLocaleString()}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(item)}>✏️ Edit</button>
                  <button onClick={() => handleForceEnd(item.id)} style={{ background: '#f59e0b', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}>⏱️ Force End</button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setEditingItem(null)}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '500px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <h3>Edit Other Auction Item: {editingItem.name}</h3>
            <form onSubmit={handleSubmit}>
              <label>Name</label>
              <input name="name" value={editForm.name} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
              <label>Description</label>
              <textarea name="description" value={editForm.description} onChange={handleChange} rows="3" style={{ width: '100%', marginBottom: '10px' }} />
              <label>Current Bid ($)</label>
              <input type="number" step="0.01" name="currentBid" value={editForm.currentBid} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
              <label>Min Increment ($)</label>
              <input type="number" step="0.01" name="minIncrement" value={editForm.minIncrement} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
              <label>End Time</label>
              <input type="datetime-local" name="endTime" value={editForm.endTime} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
              <label>Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: '10px' }} />
              {editForm.imagePreview && <img src={editForm.imagePreview} width="100" style={{ marginBottom: '10px', borderRadius: '8px' }} alt="Preview" />}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={updating}>{updating ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherAuctionsManager;