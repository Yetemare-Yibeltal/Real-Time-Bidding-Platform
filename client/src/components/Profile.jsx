import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const handleSave = () => {
    // In a real app, send to backend. Here we just simulate.
    localStorage.setItem(`userName_${user.id}`, name);
    setEditing(false);
    alert('Profile updated (demo)');
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Profile</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {editing ? (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleSave} style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Save</button>
              <button onClick={() => setEditing(false)} style={{ backgroundColor: '#9ca3af', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Name:</strong> {user?.name} <button onClick={() => setEditing(true)} style={{ marginLeft: '12px', fontSize: '12px', backgroundColor: '#e5e7eb', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Edit</button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Email:</strong> {user?.email}
            </div>
            <hr style={{ margin: '16px 0' }} />
            <button onClick={logout} style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;