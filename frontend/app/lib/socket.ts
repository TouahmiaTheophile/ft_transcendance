import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000", {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s) return;
  if (!s.connected) s.connect();
}

export function disconnectSocket() {
  const s = getSocket();
  if (!s) return;
  if (s.connected) s.disconnect();
}