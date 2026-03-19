import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const SOCKET_URL = API_URL;
export const BASE_URL = `${API_URL}/api`;

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ["websocket", "polling"],
    withCredentials: true
});