import { io } from "socket.io-client";

// Changed "5003" to "5000" to match your server.js port
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
