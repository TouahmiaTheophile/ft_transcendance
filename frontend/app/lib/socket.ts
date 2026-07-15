import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL
    socket = socketUrl
      ? io(socketUrl, {
          autoConnect: false,
          withCredentials: true,
          path: "/socket.io",
        })
      : io({
          autoConnect: false,
          withCredentials: true,
          path: "/socket.io",
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