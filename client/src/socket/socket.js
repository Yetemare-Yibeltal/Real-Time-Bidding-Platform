import { io } from "socket.io-client";

const SERVER_URL = (
  import.meta.env?.VITE_SERVER_URL || "http://localhost:5003"
).replace(/\/api\/?$/, "");

// Create socket instance with auto-connect false until ready
const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnectionAttempts: 5,
  auth: {
    token: localStorage.getItem("token"),
  },
});

socket.on("connect", () => {
  console.log("🔗 Socket connection established:", socket.id);
});

// Utility to re-authenticate if a user logs in mid-session
export const updateSocketAuth = (token) => {
  socket.auth = { token };
  socket.disconnect();
  socket.connect();
};

export const subscribeToAuction = (itemId) =>
  socket.emit("subscribe_auction", itemId);
export const placeBidViaSocket = (payload) =>
  socket.emit("place_bid_socket", payload);
export const onNewMessage = (cb) => socket.on("new_message", cb);

export default socket;
