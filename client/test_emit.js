import { io } from 'socket.io-client';

const SERVER = process.env.SERVER_URL || 'http://localhost:5001';

console.log('Connecting to', SERVER);
const socket = io(SERVER, { transports: ['websocket', 'polling'] });

socket.on('connect', () => {
  console.log('Connected as', socket.id);
  // emit a test bid activity
  socket.emit('place_bid_socket', { itemId: 1, userId: 1, amount: 1234 });
  setTimeout(() => { socket.close(); }, 500);
});

socket.on('connect_error', (err) => { console.error('connect_error', err.message); process.exit(1); });
