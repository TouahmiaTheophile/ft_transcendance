"use client";
import { useEffect } from "react";
import { getSocket, connectSocket, disconnectSocket } from "../lib/socket";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    connectSocket();
    return () => {
      s.removeAllListeners();
      disconnectSocket();
    };
  }, []);

  return <>{children}</>;
}