import React, { useEffect, useRef, useState } from 'react';
import './Messages.css';
import api from '../api/axios';
import socket, { onNewMessage } from '../socket/socket';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null); // { partnerId, auctionId }
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages');
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (q) => {
    try {
      setSearchingUsers(true);
      if (!q) { setUserResults([]); return; }
      const res = await api.get(`/users?search=${encodeURIComponent(q)}`);
      setUserResults(res.data || []);
    } catch (err) {
      console.error('User search failed', err);
    } finally {
      setSearchingUsers(false);
    }
  };



  useEffect(() => { fetchMessages(); }, []);

  // Real-time incoming messages
  useEffect(() => {
    const handler = (msg) => {
      // prepend if new
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [msg, ...prev];
      });

      // if the conversation is open and matches, mark as read
      if (selectedThread) {
        const partner = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        const matchPartner = String(partner) === String(selectedThread.partnerId);
        const matchAuction = (selectedThread.auctionId ? String(msg.auctionId) === String(selectedThread.auctionId) : !msg.auctionId);
        if (matchPartner && matchAuction && msg.receiverId === user.id) {
          markRead(msg);
        }
      }
    };
    onNewMessage(handler);
    return () => { socket.off('new_message', handler); };
  }, [selectedThread, user]);

  const otherParty = (m) => (m.senderId === user.id ? m.receiver : m.sender);

  // Build threads keyed by partnerId + auctionId
  const threads = messages.reduce((acc, m) => {
    const partner = m.senderId === user.id ? m.receiverId : m.senderId;
    const key = `${partner}::${m.auctionId || 'none'}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const threadKeys = Object.keys(threads).sort((a, b) => {
    const aa = threads[a][0]?.createdAt || 0;
    const bb = threads[b][0]?.createdAt || 0;
    return new Date(bb) - new Date(aa);
  });

  const filteredThreadKeys = threadKeys.filter(key => {
    if (!search) return true;
    const thread = threads[key];
    const latest = thread[0];
    const partner = otherParty(latest);
    const term = search.toLowerCase();
    const name = (partner?.name || partner?.email || '').toLowerCase();
    const content = (latest?.content || '').toLowerCase();
    return name.includes(term) || content.includes(term);
  });

  const openThread = (key) => {
    const [partnerId, auctionId] = key.split('::');
    setSelectedThread({ partnerId: Number(partnerId), auctionId: auctionId === 'none' ? null : auctionId });
  };

  const threadKeyForSelected = selectedThread ? `${selectedThread.partnerId}::${selectedThread.auctionId || 'none'}` : null;
  const currentThreadMessages = selectedThread ? messages.filter(m => {
    const partner = m.senderId === user.id ? m.receiverId : m.senderId;
    const matchPartner = String(partner) === String(selectedThread.partnerId);
    const matchAuction = (selectedThread.auctionId ? String(m.auctionId) === String(selectedThread.auctionId) : !m.auctionId);
    return matchPartner && matchAuction;
  }).sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt)) : [];
  const partnerInfo = threadKeyForSelected && threads[threadKeyForSelected] && threads[threadKeyForSelected][0] ? otherParty(threads[threadKeyForSelected][0]) : null;

  const messagesContainerRef = useRef(null);
  const composerInputRef = useRef(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [currentThreadMessages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedThread || !body.trim()) return;
    try {
      const payload = { receiverId: selectedThread.partnerId, content: body };
      if (selectedThread.auctionId) payload.auctionId = selectedThread.auctionId;
      const res = await api.post('/messages', payload);
      setBody('');
      // prepend new message
      setMessages(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Send failed', err);
      alert(err.response?.data?.error || 'Send failed');
    }
  };

  const markRead = async (msg) => {
    if (!msg || msg.receiverId !== user.id || msg.isRead) return;
    try {
      await api.put(`/messages/${msg.id}/read`);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error('Mark read failed', err);
    }
  };

  const handleAdminDelete = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  return (
    <div className="messages-wrapper">
      <aside className="sidebar">
            <div className="search" style={{ padding: '8px 12px' }}>
              <input value={search} onChange={e => { const v = e.target.value; setSearch(v); if (v) searchUsers(v); else setUserResults([]); }} placeholder="Search conversations or find user by name" style={{ width: '100%', padding: '8px', borderRadius: 12, border: '1px solid #eef2ff' }} />
              {searchingUsers && <div style={{ fontSize: 12, color: '#6b7280' }}>Searching...</div>}
              {userResults.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 6, margin: 0 }}>
                  {userResults.map(u => (
                    <li key={u.id} style={{ padding: 6, cursor: 'pointer' }} onClick={() => { setSelectedThread({ partnerId: u.id, auctionId: null }); setSearch(''); setUserResults([]); setTimeout(()=>composerInputRef.current?.focus(), 100); }}>
                      <strong>{u.name}</strong> <div style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
        
        {loading && <p>Loading...</p>}
        {!loading && threadKeys.length === 0 && <p>No messages yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredThreadKeys.map(key => {
            const thread = threads[key];
            const latest = thread[0];
            const partner = otherParty(latest);
            const unread = thread.some(m => m.receiverId === user.id && !m.isRead);
            const online = partner?.isOnline;
            return (
              <li key={key} className="conversation-item" onClick={() => openThread(key)}>
                <div style={{ position: 'relative' }}>
                  <img className="avatar" src={partner?.avatar || partner?.imagePath || `https://i.pravatar.cc/48?u=${partner?.id || partner?.email}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || partner?.email || 'User')}&size=48&background=E5E7EB&color=000`; }}
                    alt={partner?.name || 'User'} />
                  {online && <span style={{ position: 'absolute', right: 2, bottom: 2, width: 12, height: 12, borderRadius: '50%', background: '#34d399', border: '2px solid #fff' }} />}
                </div>
                <div className="meta">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{partner?.name || partner?.email || `User ${partner?.id || '—'}`}</strong>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 6 }}>
                    <div className="preview">{latest.content?.slice(0, 80)}</div>
                    {unread && <div className="unread-badge">{thread.filter(m => m.receiverId === user.id && !m.isRead).length}</div>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="chat">
        {!selectedThread && <div style={{ padding: '24px' }}>Select a conversation to view messages.</div>}
        {selectedThread && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="chat-header">
              {partnerInfo ? (
                <>
                  <img src={partnerInfo?.avatar || partnerInfo?.imagePath || `https://i.pravatar.cc/48?u=${partnerInfo?.id || partnerInfo?.email}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerInfo?.name || partnerInfo?.email || 'User')}&size=48&background=E5E7EB&color=000`; }}
                    alt={partnerInfo?.name || 'User'} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #eef2ff' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '15px' }}>{partnerInfo?.name || partnerInfo?.email || `User ${selectedThread.partnerId}`}</strong>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{partnerInfo?.email || ''}</span>
                  </div>
                </>
              ) : (
                <strong>Conversation with {selectedThread.partnerId}</strong>
              )}
            </div>
            <div ref={messagesContainerRef} className="messages-pane">
              {currentThreadMessages.map((msg, idx) => {
                const prev = currentThreadMessages[idx - 1];
                const showAvatar = msg.senderId !== user.id && (!prev || prev.senderId !== msg.senderId);
                return (
                  <div key={msg.id} className={`msg-row ${msg.senderId===user.id ? 'right' : 'left'}`}>
                    {msg.senderId !== user.id ? (
                      showAvatar ? (
                        <img className="avatar" src={msg.sender?.avatar || msg.sender?.imagePath || `https://i.pravatar.cc/48?u=${msg.sender?.id || msg.sender?.email}`}
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || msg.sender?.email || 'User')}&size=48&background=E5E7EB&color=000`; }}
                          alt={msg.sender?.name || 'User'} style={{ width: 36, height: 36 }} />
                      ) : (
                        <div style={{ width: 36 }} />
                      )
                    ) : <div style={{ width: 36 }} />}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.senderId===user.id ? 'flex-end' : 'flex-start' }}>
                      <div className={`bubble ${msg.senderId===user.id ? 'right' : 'left'}`}>
                        <div style={{ fontSize: 15, lineHeight: 1.3 }}>{msg.content}</div>
                      </div>
                      <div className="msg-meta">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{msg.senderId===user.id ? (msg.isRead ? ' • Read' : ' • Sent') : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="composer">
              <button type="button" title="Attach" className="icon-btn">📎</button>
              <button type="button" title="Emoji" className="icon-btn">😊</button>
              <input ref={composerInputRef} className="input" value={body} onChange={e => setBody(e.target.value)} placeholder="Message" />
              <button type="submit" style={{ padding: '10px 16px', background: '#0088cc', color: 'white', border: 'none', borderRadius: '20px' }}>Send</button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};

export default Messages;