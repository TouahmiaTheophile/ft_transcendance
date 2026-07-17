"use client"

import React from 'react'
import LobbyList from './components/LobbyList'
import Link from 'next/link'

const page = () => {
  return (
    <div className="min-h-screen flex flex-col items-center pt-10 px-4">
      <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="self-start flex items-center gap-2 text-sm text-white/60 hover:text-white w-fit"
        >
          <span className="text-lg leading-none">←</span>
          Dashboard
        </Link>
      <h1 className="text-2xl font-bold text-white mb-6">Multiplayer</h1>
      <LobbyList />
    </div>
  )
}

export default page