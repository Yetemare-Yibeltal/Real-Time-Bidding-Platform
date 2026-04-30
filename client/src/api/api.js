import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const fetchAuctions = () => API.get('/auctions');
export const placeBid = (itemId, userId, amount) => API.post('/auctions/bid', { itemId, userId, amount });
export const getHighestBid = (itemId) => API.get(`/auctions/item/${itemId}/highest`);