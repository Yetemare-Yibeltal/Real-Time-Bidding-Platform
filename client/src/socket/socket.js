import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

export const subscribeToAuction = (itemId) => {
  socket.emit('subscribe_auction', itemId);
};

export const placeBidViaSocket = (itemId, userId, amount) => {
  socket.emit('place_bid_socket', { itemId, userId, amount });
};