import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SocketProvider from "../components/SocketProvider";

export default async function DashboardLayout({children} : { children: React.ReactNode }) {
  
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}