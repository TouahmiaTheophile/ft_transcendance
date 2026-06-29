"use client"

import { apiFetch } from "@/app/lib/api"
import { getSocket } from "@/app/lib/socket"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Lobby = {
  id: string
  maxPlayers: number
  players: number[]
  status: "open" | "locked" | "in-game"
}

const LobbyPage = () => {
  const params = useParams<{ id: string }>()
  const lobbyId = params.id
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [myId, setMyId] = useState<number | null>(null)
  const [lobby, setLobby] = useState<Lobby | null>(null)


  useEffect(() => {
    apiFetch("/users/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setMyId(data.id) })

    const socket = getSocket()
        if (!socket)
          return
      
    socket.emit("lobby:subscribe", { lobbyId })   // needs a backend handler (doesn't exist yet)
    socket.on("lobby.state", (state) => setLobby(state))
  }, [])

  const leaveLobby = () => {
    apiFetch("/lobby/leave", { method: "POST" })
      .then(async res => {
        if (res.ok) {
          setError(null)
          router.push("/dashboard/online")
        } else {
          const err = await res.json().catch(() => null)
          setError(err?.message ?? "Could not leave lobby")
        }
      })
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 px-4">
      <button
        onClick={leaveLobby}
        aria-label="Leave lobby"
        className="self-start flex items-center gap-2 text-sm text-white/60 hover:text-white w-fit cursor-pointer"
      >
        <span className="text-lg leading-none">←</span>
        Leave lobby
      </button>

      <h1 className="text-2xl font-bold text-white mb-2">Lobby</h1>
      <p className="text-sm text-white/40 mb-6">{lobbyId}</p>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {lobby ? (
        <div className="text-white/60">
          {/* <p>Host: {lobby.hostId}</p> */}
          <p>Max Players: {lobby.maxPlayers}</p>
          <p>Current Players: {lobby.players.length}</p>
        </div>
      ) : (
        <p className="text-white/60">Connecting…</p>
      )}
    </div>
  )
}

export default LobbyPage
