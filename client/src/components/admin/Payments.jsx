import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/billing/payments');
      setPayments(res.data || []);
    } catch (err) {
      console.error('Fetch payments error', err.response || err.message);
      setError(err.response?.data?.error || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <div className="global-accent-bar"></div>
      <h2 className="page-title">Payments</h2>
      <div className="settings-card">
        {loading && <div>Loading payments...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>User</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Currency</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Provider ID</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '8px' }}>{p.id}</td>
                  <td style={{ padding: '8px' }}>{p.user ? `${p.user.name} (${p.user.email})` : '—'}</td>
                  <td style={{ padding: '8px' }}>${p.amount.toFixed(2)}</td>
                  <td style={{ padding: '8px' }}>{p.currency}</td>
                  <td style={{ padding: '8px' }}>{p.providerId}</td>
                  <td style={{ padding: '8px' }}>{p.status}</td>
                  <td style={{ padding: '8px' }}>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan="7" style={{ padding: '8px' }}>No payments recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
