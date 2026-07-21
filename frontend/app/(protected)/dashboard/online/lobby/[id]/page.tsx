"use client"

import { apiFetch } from "@/app/lib/api"
import { getSocket } from "@/app/lib/socket"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LeaveButton from "./components/LeaveButton"
import PlayerList from "./components/PlayerList"
import StartButton from "./components/StartButton"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type LobbyPlayer = {
  id: number
  username: string
}

type Lobby = {
  id: string
  hostId: number
  maxPlayers: number
  players: LobbyPlayer[]
  status: "open" | "locked" | "in-game"
}

const LobbyPage = () => {
  const params = useParams<{ id: string }>()
  const lobbyId = params.id
  const router = useRouter()
  const { t } = useTranslation()
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

    const onLobbyState = (state: Lobby) => setLobby(state)
    const onGameState = () => router.push("/game")        // game started → go play
    const onException = () => setError(t("lobby.errors.generic"))

    socket.emit("lobby:subscribe", { lobbyId })
    socket.on("lobby.state", onLobbyState)
    socket.on("game:state", onGameState)
    socket.on("exception", onException)

    return () => {
      socket.off("lobby.state", onLobbyState)
      socket.off("game:state", onGameState)
      socket.off("exception", onException)
    }
  }, [lobbyId, router])

  const leaveLobby = () => {
    apiFetch("/lobby/leave", { method: "POST" })
      .then(async res => {
        if (res.ok) {
          setError(null)
        } else {
          setError(t("lobby.errors.leaveFailed"))
        }
      })
      .finally(() => {
        router.push("/dashboard/online")
      })
  }

  const startGame = () => {
    const socket = getSocket()
    if (!socket)
      return
    setError(null)
    socket.emit("start_game")
  }

  const isHost = myId !== null && lobby?.hostId === myId
  const canStart = (lobby?.players.length ?? 0) >= 2

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 px-4">
      <LeaveButton onLeave={leaveLobby} />

      <h1 className="text-2xl font-bold text-white mb-2">{t("lobby.title")}</h1>
      <p className="text-sm text-white/40 mb-6">{lobbyId}</p>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {lobby ? (
        <div className="w-full max-w-sm flex flex-col gap-3">
          <PlayerList
            players={lobby.players}
            maxPlayers={lobby.maxPlayers}
            hostId={lobby.hostId}
            myId={myId}
          />

          {isHost && <StartButton canStart={canStart} onStart={startGame} />}
        </div>
      ) : (
        <p className="text-white/60">{t("lobby.connecting")}</p>
      )}
    </div>
  )
}

export default LobbyPage
