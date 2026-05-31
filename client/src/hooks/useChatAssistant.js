import { useState } from 'react';
import api from '../api/axios';

// Helper to load conversation history
async function loadConversationMessages(conversationId) {
  const res = await api.get(`/ai/conversations/${conversationId}/messages`);
  return res.data?.messages || [];
}

export default function useChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (text) => {
    const newUserMsg = { role: 'user', content: text };
    const nextMessages = [...messages, newUserMsg];
    setMessages(nextMessages);
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/chat', { messages: nextMessages, includeContext: true, conversationId: currentConversationId });
      const reply = res.data?.reply || '';
      const convId = res.data?.conversationId;
      if (convId && !currentConversationId) setCurrentConversationId(convId);
      const aiMsg = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, aiMsg]);
      // Emit a global event so top-level UI (Topbar) can show a notification
      try { window.dispatchEvent(new CustomEvent('assistant-reply', { detail: { text: reply } })); } catch (e) { /* ignore */ }
      setLoading(false);
      return reply;
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Chat request failed');
      setLoading(false);
      throw err;
    }
  };

  const reset = () => setMessages([]);

  const loadHistory = async (conversationId) => {
    try {
      const msgs = await loadConversationMessages(conversationId);
      setMessages(msgs.map(m => ({ role: m.role, content: m.content })));
      setCurrentConversationId(conversationId);
    } catch (e) { console.error('loadHistory error', e); }
  };

  const [currentConversationId, setCurrentConversationId] = useState(null);

  return { messages, loading, error, sendMessage, reset, loadHistory, currentConversationId };
}
