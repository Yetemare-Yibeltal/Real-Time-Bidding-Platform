import { useState } from 'react';
import api from '../api/axios';

export default function useAiAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendation = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/recommend-bid', { item });
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'AI request failed');
      setLoading(false);
      throw err;
    }
  };

  return { getRecommendation, loading, error };
}
