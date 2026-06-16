"use client"

import React, { useEffect, useState } from "react"
import { apiFetch } from "../lib/api"
import SocketProvider from "../components/SocketProvider"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    // apiFetch auto-refreshes an expired access token; if the refresh
    // also fails it redirects to /login on its own.
    apiFetch("/users/me").then(res => {
      if (res.ok) setAuthed(true)
      else window.location.href = "/login"
    })
  }, [])

  if (!authed) return null

  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  )
}
