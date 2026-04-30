import { io } from 'socket.io-client';

// Vite exposes env vars via import.meta.env (VITE_ prefix). Fall back to localhost:5001
let SERVER_URL = 'http://localhost:5001';
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) {
    SERVER_URL = import.meta.env.VITE_SERVER_URL.replace(/\/api\/?$/, '');
  }
} catch (e) {
  // ignore
}

// Attach token for auth on connect
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  auth: { token },
  reconnectionAttempts: 5,
});

socket.on('connect', () => {
  console.log('Socket connected', socket.id);
});

socket.on('connect_error', (err) => {
  console.warn('Socket connect error', err.message);
});

export const subscribeToAuction = (itemId) => socket.emit('subscribe_auction', itemId);
export const placeBidViaSocket = (itemId, userId, amount) => socket.emit('place_bid_socket', { itemId, userId, amount });

export const onNewMessage = (cb) => socket.on('new_message', cb);

export default socket;