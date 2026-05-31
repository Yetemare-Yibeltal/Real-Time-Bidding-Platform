import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import socket from '../socket/socket';

export const useAuctionSimulator = () => {
  const [liveItem, setLiveItem] = useState(null);
  const [otherItems, setOtherItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/auctions');
      let auctions = response.data;
      if (!Array.isArray(auctions)) auctions = [];

      console.log('📦 Raw auctions from backend:', auctions);

      const now = Date.now();
      const processed = auctions.map(a => ({
        ...a,
        endTime: new Date(a.endTime).getTime(),
        active: new Date(a.endTime).getTime() > now,
        currentBid: Number(a.currentBid) || 0,
        minIncrement: Number(a.minIncrement) || 0,
      }));

      // Helper: compute activity score from bids/views
      const computeActivityScore = (item) => {
        const bids = item?.bidCount ?? item?.bids?.length ?? 0;
        const views = item?.views ?? 0;
        return Math.round(bids * 3 + Math.floor(views / 10));
      };

      const activeAuctions = processed.filter(a => a.active);
      const inactiveAuctions = processed.filter(a => !a.active);

      console.log(`✅ Active: ${activeAuctions.length}, Inactive: ${inactiveAuctions.length}`);

      // Case 1: No auctions from backend at all -> use full mock
      if (activeAuctions.length === 0 && inactiveAuctions.length === 0) {
        setLiveItem(getMockLive());
        setOtherItems(getMockOthers());
      }
      // Case 2: There is at least one active auction
      else if (activeAuctions.length > 0) {
        const live = activeAuctions[0];
        let others = [...activeAuctions.slice(1), ...inactiveAuctions];

        // If still no other items, add mock ones so the grid is never empty
        if (others.length === 0) {
          console.warn('⚠️ No other real auctions – adding mock ones for display');
          others = getMockOthers();
        }
        // attach activityScore to live and other items
        setLiveItem({ ...live, activityScore: computeActivityScore(live) });
        setOtherItems(others.map(o => ({ ...o, activityScore: computeActivityScore(o) })));
        console.log(`👉 Live: ${live.name}, Others: ${others.length}`);
      }
      // Case 3: No active auctions, but some inactive ones
      else {
        // Use first inactive as live? Or just show mock as live and list inactive as others
        const mockLive = getMockLive();
        const mockOthers = getMockOthers();
        setLiveItem({ ...mockLive, activityScore: computeActivityScore(mockLive) });
        setOtherItems([...inactiveAuctions.map(a => ({ ...a, activityScore: computeActivityScore(a) })), ...mockOthers.map(o => ({ ...o, activityScore: computeActivityScore(o) }))]);
      }
    } catch (err) {
      console.error('❌ Backend error, using full mock data', err);
      setLiveItem(getMockLive());
      setOtherItems(getMockOthers());
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + periodic refresh every 30 seconds
  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(fetchAuctions, 30000);
    return () => clearInterval(interval);
  }, [fetchAuctions]);

  // 👇 NEW: Listen for admin edits to refresh instantly
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Admin edit detected – refreshing auctions');
      fetchAuctions();
    };
    window.addEventListener('auctions-updated', handleRefresh);
    return () => window.removeEventListener('auctions-updated', handleRefresh);
  }, [fetchAuctions]);
  // Update item helper: merge updates and recompute activityScore
  

  // Update item helper: merge updates and recompute activityScore
  const updateItem = useCallback((id, updates) => {
    const computeActivityScore = (item) => {
      const bids = item?.bidCount ?? item?.bids?.length ?? 0;
      const views = item?.views ?? 0;
      return Math.round(bids * 3 + Math.floor(views / 10));
    };

    // Ensure numeric normalization for bid-related fields
    const normalize = (obj) => ({
      ...obj,
      currentBid: Number(obj.currentBid) || 0,
      minIncrement: Number(obj.minIncrement) || 0,
    });
    if (id === liveItem?.id) {
      setLiveItem(prev => {
        const merged = normalize({ ...prev, ...updates });
        return { ...merged, activityScore: computeActivityScore(merged) };
      });
    } else {
      setOtherItems(prev => prev.map(item => {
        if (item.id !== id) return item;
        const merged = normalize({ ...item, ...updates });
        return { ...merged, activityScore: computeActivityScore(merged) };
      }));
    }
  }, [liveItem?.id]);

  // Simulate competitor bids only on active items
  useEffect(() => {
    if (loading) return;
    const competitorInterval = setInterval(() => {
      const allActiveItems = [liveItem, ...otherItems].filter(i => i && i.active && i.endTime > Date.now());
      if (allActiveItems.length === 0) return;
      const randomItem = allActiveItems[Math.floor(Math.random() * allActiveItems.length)];
      if (randomItem) {
        const cb = Number(randomItem.currentBid) || 0;
        const mi = Number(randomItem.minIncrement) || 0;
        const newBid = cb + mi;
        updateItem(randomItem.id, { currentBid: newBid });
      }
    }, 15000);
    return () => clearInterval(competitorInterval);
  }, [liveItem, otherItems, loading, updateItem]);

  // When a new live item appears, increment its views once (local state)
  const _prevLive = useRef(null);
  useEffect(() => {
    if (!liveItem) return;
    if (_prevLive.current !== liveItem.id) {
      // bump views locally and recompute score via updateItem
      updateItem(liveItem.id, { views: (liveItem.views ?? 0) + 1 });
      _prevLive.current = liveItem.id;
    }
  }, [liveItem, updateItem]);
  

  const placeBid = useCallback((itemId, amount, userId) => {
    return (async () => {
      const item = itemId === liveItem?.id ? liveItem : otherItems.find(i => i.id === itemId);
      if (!item || !item.active || item.endTime <= Date.now()) {
        return { success: false, error: 'Auction not active or expired' };
      }
      const cb = Number(item.currentBid) || 0;
      const mi = Number(item.minIncrement) || 0;
      const minNext = cb + mi;
      if (Number(amount) < minNext) {
        return { success: false, error: `Bid must be at least $${minNext.toFixed(2)}` };
      }

      try {
        const res = await api.post(`/auctions/${itemId}/bid`, { amount });
        if (res.data && res.data.success) {
          updateItem(itemId, { currentBid: Number(amount) });
          try { socket.emit('place_bid_socket', { itemId, amount }); } catch (e) { console.warn('Socket emit failed', e); }
          return { success: true, itemName: item.name };
        } else {
          const errMsg = res.data?.error || 'Bid failed on server';
          const requiredMin = res.data?.requiredMin;
          return { success: false, error: requiredMin ? `Bid must be at least $${Number(requiredMin).toFixed(2)}` : errMsg };
        }
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data || {};
        const requiredMin = data.requiredMin;
        const message = data?.error || err.message || 'Network error';
        if (status === 402) {
          return { success: false, error: requiredMin ? `Payment required before bidding. Minimum: $${Number(requiredMin).toFixed(2)}` : message, needPayment: true };
        }
        if (requiredMin) return { success: false, error: `Bid must be at least $${Number(requiredMin).toFixed(2)}` };
        return { success: false, error: message };
      }
    })();
  }, [liveItem, otherItems, updateItem]);

  return { liveItem, otherItems, loading, placeBid, updateItem, refreshAuctions: fetchAuctions };
};

// ========== Mock data (professional fallback) ==========
function getMockLive() {
  return {
    id: 'macbook',
    name: 'Apple MacBook Pro 14"',
    description: 'Apple M2 Pro chip with 10-core CPU, 16GB RAM, 512GB SSD',
    imagePath: '/images/macbook-pro.jpg',
    currentBid: 1250,
    minIncrement: 50,
    endTime: Date.now() + 105 * 60 * 1000,
    active: true,
  };
}
function getMockOthers() {
  return [
    {
      id: 'canon',
      name: 'Canon EOS R6 Camera',
      description: 'Full-frame mirrorless, 20MP, 4K video',
      imagePath: '/images/canon-eos-r6.jpg',
      currentBid: 850,
      minIncrement: 25,
      endTime: Date.now() + 80 * 60 * 1000,
      active: true,
    },
    {
      id: 'iphone15',
      name: 'iPhone 15 Pro 256GB',
      description: 'A17 Pro chip, titanium design',
      imagePath: '/images/iphone-15-pro.jpg',
      currentBid: 920,
      minIncrement: 30,
      endTime: Date.now() + 190 * 60 * 1000,
      active: true,
    },
    {
      id: 'rolex',
      name: 'Rolex Submariner Watch',
      description: 'Luxury automatic, ceramic bezel',
      imagePath: '/images/rolex-submariner.jpg',
      currentBid: 8500,
      minIncrement: 100,
      endTime: Date.now() + 330 * 60 * 1000,
      active: true,
    },
    {
      id: 'airpods',
      name: 'AirPods Pro (2nd Gen)',
      description: 'Active noise cancellation, spatial audio',
      imagePath: '/images/airpods-pro.jpg',
      currentBid: 180,
      minIncrement: 10,
      endTime: Date.now() + 15 * 60 * 1000,
      active: true,
    },
  ];
}