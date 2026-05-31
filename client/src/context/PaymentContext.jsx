import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';
import PaymentModal from '../components/PaymentModal';

const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
  const [modal, setModal] = useState({ open: false, fee: 0, itemId: null, purpose: 'bid_access' });

  const openPayment = (fee, itemId = null, purpose = 'bid_access') => {
    setModal({ open: true, fee, itemId, purpose, pending: false, error: null });
  };
  const closePayment = () => setModal({ open: false, fee: 0, itemId: null, purpose: 'bid_access' });

  const startCheckout = async (opts = {}) => {
    // opts can override modal values: { fee, purpose, itemId }
    const fee = Number(opts.fee ?? modal.fee);
    const purpose = opts.purpose ?? modal.purpose;

    // Ensure user is authenticated before creating a Checkout session
    const token = localStorage.getItem('token');
    if (!token) {
      // close modal and send user to login
      setModal({ open: false, fee: 0, itemId: null, purpose: 'bid_access' });
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    try {
      // mark pending to give user feedback in modal
      setModal(prev => ({ ...prev, pending: true }));
      const payload = { amount: fee, currency: 'usd', description: 'Bid access fee', purpose, itemId: modal.itemId ?? opts.itemId ?? null };
      console.debug('PaymentContext.startCheckout payload:', payload);
      const res = await api.post('/billing/create-session', payload);
      console.debug('PaymentContext.startCheckout response:', res?.data);
      if (res.data?.url) {
        // persist pending bid so we can auto-place after success
        try {
          const pending = { itemId: modal.itemId ?? opts.itemId ?? null, amount: fee };
          if (pending.itemId) localStorage.setItem('pendingBid', JSON.stringify(pending));
        } catch (e) { /* ignore storage errors */ }
        // if we opened a modal, close it before redirecting
        setModal({ open: false, fee: 0, itemId: null, purpose: 'bid_access' });
        window.location.href = res.data.url;
        return res.data;
      } else {
        const msg = JSON.stringify(res.data || 'no data');
        console.error('No checkout url in response', res.data);
        setModal(prev => ({ ...prev, pending: false, error: msg }));
        throw new Error('No checkout url');
      }
    } catch (err) {
      const msg = err?.response?.data?.details || err?.response?.data?.error || err?.message || String(err);
      console.error('Checkout start failed', msg);
      // keep modal open and show error so user can retry
      setModal(prev => ({ ...prev, pending: false, error: msg, open: true }));
      throw err;
    }
  };

  return (
    <PaymentContext.Provider value={{ openPayment, closePayment, startCheckout }}>
      {children}
      <PaymentModal modal={modal} close={closePayment} startCheckout={startCheckout} />
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayment must be used within PaymentProvider');
  return ctx;
};

export default PaymentContext;
