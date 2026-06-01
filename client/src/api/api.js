import axios from "axios";

// Standardize on one port (e.g., 5003, or use your environment variable)
const BASE = import.meta.env.VITE_SERVER_URL || "http://localhost:5003/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

// Unified Interceptor
api.interceptors.request.use((config) => {
  // Check both storage keys if you've been using two different ones
  const token =
    localStorage.getItem("token") ||
    JSON.parse(localStorage.getItem("profile"))?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unified Response Interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("profile");
      window.location.href = "/login";
    }
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  },
);

export default api;
