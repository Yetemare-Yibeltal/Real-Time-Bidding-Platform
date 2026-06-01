import { io } from "socket.io-client";

// Ensure this matches the port your Node/Express backend is running on
const SERVER_URL = (
  import.meta.env?.VITE_SERVER_URL || "http://localhost:5000"
).replace(/\/api\/?$/, "");

// Create socket instance
const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnectionAttempts: 5,
  auth: {
    token: localStorage.getItem("token"),
  },
});

// Event listener for successful connection
socket.on("connect", () => {
  console.log("🔗 Socket connection established:", socket.id);
});

// Utility to re-authenticate if a user logs in mid-session
export const updateSocketAuth = (token) => {
  socket.auth = { token };
  socket.disconnect();
  socket.connect();
};

// Event handlers
export const subscribeToAuction = (itemId) =>
  socket.emit("subscribe_auction", itemId);
export const placeBidViaSocket = (payload) =>
  socket.emit("place_bid_socket", payload);
export const onNewMessage = (cb) => socket.on("new_message", cb);

// This default export is required by Topbar.jsx to function
export default socket;
