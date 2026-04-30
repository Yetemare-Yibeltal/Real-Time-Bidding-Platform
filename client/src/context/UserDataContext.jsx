import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserDataContext = createContext();

export const useUserData = () => useContext(UserDataContext);

export const UserDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [myBids, setMyBids] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  // Load data from localStorage when user changes
  useEffect(() => {
    if (user) {
      const storedBids = localStorage.getItem(`bids_${user.id}`);
      const storedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
      if (storedBids) setMyBids(JSON.parse(storedBids));
      if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
    } else {
      setMyBids([]);
      setWatchlist([]);
    }
  }, [user]);

  // Save bids to localStorage
  const addBid = (bid) => {
    if (!user) return;
    const newBid = { ...bid, id: Date.now(), userId: user.id, timestamp: new Date().toISOString() };
    const updated = [...myBids, newBid];
    setMyBids(updated);
    localStorage.setItem(`bids_${user.id}`, JSON.stringify(updated));
  };

  // Watchlist actions
  const addToWatchlist = (item) => {
    if (!user) return;
    if (!watchlist.some(w => w.id === item.id)) {
      const updated = [...watchlist, item];
      setWatchlist(updated);
      localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(updated));
    }
  };

  const removeFromWatchlist = (itemId) => {
    const updated = watchlist.filter(item => item.id !== itemId);
    setWatchlist(updated);
    localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(updated));
  };

  const isInWatchlist = (itemId) => watchlist.some(item => item.id === itemId);

  return (
    <UserDataContext.Provider value={{ myBids, addBid, watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </UserDataContext.Provider>
  );
};