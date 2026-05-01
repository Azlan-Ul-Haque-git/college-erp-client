import { io } from "socket.io-client";

const socket = io("https://college-erp-server-kvc4.onrender.com", {
    withCredentials: true,
    transports: ["websocket"], // ❌ polling बंद
});

export default socket;