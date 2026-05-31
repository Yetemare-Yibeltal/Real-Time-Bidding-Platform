import React, { useState } from 'react';
import useChatAssistant from '../hooks/useChatAssistant';
import { useAuth } from '../context/AuthContext';

export default function AIChat() {
  const { messages, loading, error, sendMessage, reset, loadHistory } = useChatAssistant();
  const { user } = useAuth();
  const [input, setInput] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!user) {
      alert('Please sign in to use the assistant');
      return;
    }
    try {
      await sendMessage(input.trim());
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', padding: 12, borderRadius: 8, maxWidth: 600, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 8 }}>
        {messages.length === 0 && <div style={{ color: '#666' }}>Say hello to the auction assistant.</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '6px 0' }}>
            <strong style={{ textTransform: 'capitalize' }}>{m.role}:</strong>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder={user ? "Ask about auctions, bids, or recommendations" : "Sign in to use the assistant"} style={{ flex: 1, padding: 8 }} disabled={!user} />
        <button type="submit" disabled={loading || !user} style={{ padding: '8px 12px' }}>{loading ? 'Thinking...' : 'Send'}</button>
        <button type="button" onClick={reset} style={{ padding: '8px 12px' }}>Reset</button>
      </form>
    </div>
  );
}
