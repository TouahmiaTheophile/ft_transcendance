"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getSocket, connectSocket } from "@/app/lib/socket"
import { apiFetch } from "@/app/lib/api"
import { COLORS, Dir, State, Status } from "./types"
import GameCanvas from "./components/GameCanvas"
import CountdownOverlay from "./components/CountdownOverlay"
import GameOverOverlay from "./components/GameOverOverlay"
import GameStatusBar from "./components/GameStatusBar"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

const KEYS: Record<string, Dir> = {
  ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
  w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT", z: "UP", q: "LEFT",
}

export default function GamePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [state, setState] = useState<State | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [winner, setWinner] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const myId = useRef<string>("")
  const statusRef = useRef<Status>("idle")
  const goTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const colorMap = useRef<Map<string, string>>(new Map())
  const names = useRef<Map<number, string>>(new Map())

  statusRef.current = status

  const colorOf = useCallback((id: string): string => {
    const m = colorMap.current
    if (!m.has(id)) {
      if (id === myId.current) m.set(id, COLORS[0])
      else {
        const used = new Set(m.values())
        m.set(id, COLORS.slice(1).find((c) => !used.has(c)) ?? "#999")
      }
    }
    return m.get(id)!
  }, [])

  function winnerLabel(id: string): string {
    if (Number(id) < 0) return t("game.ai")
    return names.current.get(Number(id)) ?? t("game.player", { id })
  }

  useEffect(() => {
    const socket = getSocket()
    connectSocket()

    apiFetch("/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => { if (me?.id != null) myId.current = String(me.id) })
      .catch(() => {})

    const onLobbyState = (l: { players: { id: number; username: string }[] }) => {
      for (const p of l.players) names.current.set(p.id, p.username)
    }
    const lobbyId = sessionStorage.getItem("lastLobbyId")
    if (lobbyId) socket?.emit("lobby:subscribe", { lobbyId })

    const onState = (s: State) => {
      const alive = s.players.filter((p) => p.alive)

      if (statusRef.current !== "playing" && alive.length > 1) {
        colorMap.current.clear()
        setWinner(null)
        setStatus("playing")
      }

      setState(s)

      if (statusRef.current === "playing" && alive.length <= 1) {
        setStatus("over")
        setWinner(alive[0]?.id ?? null)
        setCountdown(null)
      }
    }

    const onCountdown = ({ value }: { value: number }) => {
      setCountdown(value)
      if (goTimer.current) clearTimeout(goTimer.current)
      if (value === 0) goTimer.current = setTimeout(() => setCountdown(null), 800)
    }

    socket?.on("lobby.state", onLobbyState)
    socket?.on("game:state", onState)
    socket?.on("game:countdown", onCountdown)
    return () => {
      socket?.off("lobby.state", onLobbyState)
      socket?.off("game:state", onState)
      socket?.off("game:countdown", onCountdown)
      if (goTimer.current) clearTimeout(goTimer.current)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = KEYS[e.key]
      if (!d || statusRef.current !== "playing") return
      e.preventDefault()
      getSocket()?.emit("player_input", { direction: d })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  function backToLobby() {
    const id = sessionStorage.getItem("lastLobbyId")
    router.push(id ? `/dashboard/online/lobby/${id}` : "/dashboard/online")
  }

  const me = state?.players.find((p) => p.id === myId.current)
  const myColor = myId.current ? colorOf(myId.current) : "#333"

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3.5 p-5 font-mono text-[#ddd]">
      <GameCanvas state={state} colorOf={colorOf} borderColor={myColor}>
        {countdown !== null && <CountdownOverlay value={countdown} />}
        {status === "over" && (
          <GameOverOverlay
            label={winner == null ? t("game.draw") : winnerLabel(winner)}
            color={winner ? colorOf(winner) : "#fff"}
            subtitle={
              winner == null
                ? t("game.nobodySurvived")
                : winner === myId.current
                  ? t("game.youWin")
                  : t("game.winsTheGame")
            }
            onBack={backToLobby}
          />
        )}
      </GameCanvas>

      <GameStatusBar
        status={status}
        myColor={myColor}
        eliminated={!!me && !me.alive}
        alive={state?.players.filter((p) => p.alive).length ?? 0}
        total={state?.players.length ?? 0}
      />
    </div>
  )
}
