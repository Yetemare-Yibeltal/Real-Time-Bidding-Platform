import React, { useState } from 'react';
import api from '../../api/axios';

export default function Billing() {
  const [amount, setAmount] = useState('5.00');
  const [description, setDescription] = useState('Listing fee');
  const [seedMock, setSeedMock] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return alert('Enter a valid amount');
    setLoading(true);
    try {
      const res = await api.post('/billing/create-session', { amount: num, description, seedMock });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else if (res.data?.id && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert('Unexpected response from server');
      }
    } catch (err) {
      console.error('Create session error', err.response || err.message);
      alert('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <div className="global-accent-bar"></div>
      <h2 className="page-title">Billing / Create Payment</h2>
      <div className="settings-card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleCreate}>
          <label>Amount (USD)</label>
          <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
          <label>Description</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={seedMock} onChange={e => setSeedMock(e.target.checked)} />
              <span>Seed mock auctions after successful payment</span>
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Checkout Session'}</button>
          </div>
        </form>
        <p style={{ marginTop: 12, color: '#555' }}>This will redirect to Stripe Checkout to complete a one-time payment. Ensure the server has STRIPE keys configured.</p>
      </div>
    </main>
  );
}
