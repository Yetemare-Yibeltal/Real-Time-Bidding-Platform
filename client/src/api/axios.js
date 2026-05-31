import axios from 'axios';

const BASE = (import.meta.env && import.meta.env.VITE_SERVER_URL) ? import.meta.env.VITE_SERVER_URL : 'http://localhost:5003/api';

const api = axios.create({
  baseURL: BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;