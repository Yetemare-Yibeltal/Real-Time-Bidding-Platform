import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchUsers } from '../api/api';

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults = () => {
  const q = useQuery().get('q') || useQuery().get('search') || '';
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError(null);
    searchUsers(q).then(res => {
      setResults(res.data || []);
    }).catch(err => {
      console.error('searchUsers error', err?.response?.data || err.message);
      setError('Search failed');
    }).finally(() => setLoading(false));
  }, [q]);

  if (!q) return <div className="main-content"><h3>Search</h3><p>Type a query in the search box and press Enter.</p></div>;

  return (
    <div className="main-content">
      <h3>Search results for "{q}"</h3>
      {loading && <p>Loading…</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {!loading && results.length === 0 && <p>No users found.</p>}
      <ul className="search-results-list">
        {results.map(u => (
          <li key={u.id} className="search-result-item">
            <img src={u.avatar || `https://i.pravatar.cc/48?u=${u.id}`} alt={u.name} style={{width:48,height:48,borderRadius:8,objectFit:'cover',marginRight:12}} />
            <div>
              <div style={{fontWeight:700}}>{u.name}</div>
              <div style={{color:'#6b7280'}}>{u.email}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
