import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const fetchAuctions = () => API.get('/auctions');
export const placeBid = (itemId, amount) => API.post(`/auctions/${encodeURIComponent(itemId)}/bid`, { amount });
export const getHighestBid = (itemId) => API.get(`/auctions/item/${itemId}/highest`);
export const searchUsers = (q) => API.get(`/users?search=${encodeURIComponent(q)}`);