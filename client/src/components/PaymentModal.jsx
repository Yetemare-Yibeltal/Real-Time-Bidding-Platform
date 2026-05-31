import React from 'react';

const PaymentModal = ({ modal, close, startCheckout }) => {
  if (!modal?.open) return null;
  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <h3>Payment Required to Bid</h3>
        <p>To place bids you must pay a one-time access fee of ${modal.fee?.toFixed(2)}.</p>
        {modal.error && <div className="payment-error" style={{ color: 'crimson', marginBottom: '8px' }}>Error: {String(modal.error)}</div>}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button onClick={close} disabled={modal.pending}>Cancel</button>
          <button onClick={async () => {
            try {
              await startCheckout();
            } catch (e) {
              // error is surfaced to the modal via PaymentContext
            }
          }} disabled={modal.pending}>{modal.pending ? 'Starting...' : `Pay ${modal.fee?.toFixed(2)}`}</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
