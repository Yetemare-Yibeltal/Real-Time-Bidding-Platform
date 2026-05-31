import axios from "axios";

// 1. Create instance with improved configuration
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // 10s timeout for real-world reliability
});

// 2. Add Request Interceptor for Auth (Required for production apps)
API.interceptors.request.use((req) => {
  if (localStorage.getItem("profile")) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("profile")).token}`;
  }
  return req;
});

// 3. API Methods
export const fetchAuctions = () => API.get("/auctions");
export const placeBid = (itemId, amount) =>
  API.post(`/auctions/${encodeURIComponent(itemId)}/bid`, { amount });
export const getHighestBid = (itemId) =>
  API.get(`/auctions/item/${itemId}/highest`);
export const searchUsers = (q) =>
  API.get(`/users?search=${encodeURIComponent(q)}`);

// 4. Added Error Interceptor for production debugging
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  },
);
