import { useState, useCallback } from "react";
import api from "../api/axios";

export default function useAiAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendation = useCallback(async (item) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/ai/recommend-bid", { item });
      return res.data;
    } catch (err) {
      const message =
        err?.response?.data?.error || "AI assistance currently unavailable";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { getRecommendation, loading, error };
}
