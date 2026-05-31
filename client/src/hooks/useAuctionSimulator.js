import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axios";
import socket from "../socket/socket";

export const useAuctionSimulator = () => {
  const [liveItem, setLiveItem] = useState(null);
  const [otherItems, setOtherItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoized activity scoring for consistent 3D UI scaling
  const computeScore = useCallback((item) => {
    const bids = item?.bidCount ?? item?.bids?.length ?? 0;
    const views = item?.views ?? 0;
    return Math.round(bids * 3 + Math.floor(views / 10));
  }, []);

  const fetchAuctions = useCallback(async () => {
    try {
      const res = await api.get("/auctions");
      const now = Date.now();
      const processed = (Array.isArray(res.data) ? res.data : []).map((a) => ({
        ...a,
        endTime: new Date(a.endTime).getTime(),
        active: new Date(a.endTime).getTime() > now,
        currentBid: Number(a.currentBid) || 0,
        minIncrement: Number(a.minIncrement) || 0,
      }));

      const active = processed.filter((a) => a.active);

      // Fallback to mocks if empty
      if (active.length === 0) {
        setLiveItem({ ...getMockLive(), activityScore: 10 });
        setOtherItems(getMockOthers().map((o) => ({ ...o, activityScore: 5 })));
      } else {
        const live = active[0];
        const others = [
          ...active.slice(1),
          ...processed.filter((a) => !a.active),
        ];
        setLiveItem({ ...live, activityScore: computeScore(live) });
        setOtherItems(
          others.map((o) => ({ ...o, activityScore: computeScore(o) })),
        );
      }
    } catch (err) {
      console.error("Auction sync error:", err);
    } finally {
      setLoading(false);
    }
  }, [computeScore]);

  // Unified update logic
  const updateItem = useCallback(
    (id, updates) => {
      const apply = (item) => {
        const merged = {
          ...item,
          ...updates,
          currentBid: Number(updates.currentBid || item.currentBid),
        };
        return { ...merged, activityScore: computeScore(merged) };
      };

      setLiveItem((prev) => (prev?.id === id ? apply(prev) : prev));
      setOtherItems((prev) => prev.map((i) => (i.id === id ? apply(i) : i)));
    },
    [computeScore],
  );

  // Socket/Admin Refresh Listener
  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(fetchAuctions, 30000);
    window.addEventListener("auctions-updated", fetchAuctions);
    return () => {
      clearInterval(interval);
      window.removeEventListener("auctions-updated", fetchAuctions);
    };
  }, [fetchAuctions]);

  // Simulated Competitor Bidding (optimized interval)
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      const active = [liveItem, ...otherItems].filter((i) => i?.active);
      if (active.length === 0) return;
      const target = active[Math.floor(Math.random() * active.length)];
      updateItem(target.id, {
        currentBid: target.currentBid + target.minIncrement,
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [loading, liveItem, otherItems, updateItem]);

  return { liveItem, otherItems, loading, updateItem, refresh: fetchAuctions };
};

// Mock Data remains unchanged but clean
function getMockLive() {
  /* ... */
}
function getMockOthers() {
  /* ... */
}
