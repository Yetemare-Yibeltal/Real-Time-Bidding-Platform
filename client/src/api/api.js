import axios from "axios";

const BASE = import.meta.env.VITE_SERVER_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

// Unified Interceptor
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    JSON.parse(localStorage.getItem("profile"))?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("profile");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ADDED: Export the functions here so you can import them elsewhere
export const fetchAuctions = () => api.get("/auctions");
export const placeBid = (itemId, amount) =>
  api.post(`/auctions/${itemId}/bid`, { amount });
export const searchUsers = (q) =>
  api.get(`/users?search=${encodeURIComponent(q)}`);

// Default export remains the axios instance
export default api;
