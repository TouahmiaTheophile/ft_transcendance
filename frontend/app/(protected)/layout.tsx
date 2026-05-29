import React from 'react'
import SocketProvider from "../components/SocketProvider";

export default function DashboardLayout({children} : { children: React.ReactNode }) {

  //add protected route logic here
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}