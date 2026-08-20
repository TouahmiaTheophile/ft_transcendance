"use client"

// Flow: the lobby page redirects everyone here through `game:started`.
// The server emits `game:countdown` (3, 2, 1, 0=GO) then the `game:state`s.
// The engine does not tick during the countdown: nobody can move yet,
// but inputs are accepted -> you can PRE-ORIENT your cycle.
//
// -rbauerMod7- One step was inserted before that countdown: the server no
// longer starts it on arrival, it waits for every human player to press Play
// under the tutorial. This page sends that click ('player_ready') and listens
// to the answer ('game:ready' -> how many players are ready out of how many).
// Nothing else in the flow changed: once the last player has pressed, the
// 3-2-1 and the states arrive exactly as before.

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getSocket, connectSocket } from "@/app/lib/socket"
import { apiFetch } from "@/app/lib/api"
import { COLORS, Dir, State, Status } from "./types"
import GameCanvas from "./components/GameCanvas"
import CountdownOverlay from "./components/CountdownOverlay"
import GameOverOverlay from "./components/GameOverOverlay"
import GameStatusBar from "./components/GameStatusBar"
import GameTutorial from "./components/GameTutorial" // -rbauerMod6-
// -rbauerMod5- The page computes the two end-of-game texts (they depend on who
// won), so it needs t() as well.
import { useTranslation } from "@/app/lib/i18n/useTranslation"

const KEYS: Record<string, Dir> = {
  ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
  w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT", z: "UP", q: "LEFT",
}

export default function GamePage() {
  const router = useRouter()
  const { t } = useTranslation() // -rbauerMod5-
  const [state, setState] = useState<State | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [winner, setWinner] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null) // 3,2,1,0=GO
  // -rbauerMod7- Play pressed on this screen (the click is sent once).
  const [pressedPlay, setPressedPlay] = useState(false)
  // -rbauerMod7- Readiness of the whole game, straight from the server. Null
  // until the first 'game:ready' comes back, i.e. until someone has pressed.
  const [readyInfo, setReadyInfo] = useState<{ ready: number; total: number } | null>(null)

  const myId = useRef<string>("")
  const statusRef = useRef<Status>("idle")
  const goTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // stable color per player id (survives ticks / deaths)
  const colorMap = useRef<Map<string, string>>(new Map())
  // player usernames (id -> username), filled from the lobby state
  const names = useRef<Map<number, string>>(new Map())

  statusRef.current = status

  // stable identity (only touches refs) so GameCanvas only redraws on new states
  const colorOf = useCallback((id: string): string => {
    const m = colorMap.current
    if (!m.has(id)) {
      if (id === myId.current) m.set(id, COLORS[0])
      else {
        const used = new Set(m.values())
        // COLORS[0] (cyan) is reserved for the local player: prevents a state
        // received before the /users/me response from giving "your" color away
        m.set(id, COLORS.slice(1).find((c) => !used.has(c)) ?? "#999")
      }
    }
    return m.get(id)!
  }, [])

  // Winner display name: "AI" for bots (negative ids), username for players,
  // raw id as fallback when the lobby is unknown (direct navigation).
  // -rbauerMod5- A username is user data and is never translated; only the two
  // labels around it are. `{ id }` fills the "{{id}}" placeholder of the key.
  function winnerLabel(id: string): string {
    if (Number(id) < 0) return t("game.ai")
    return names.current.get(Number(id)) ?? t("game.player", { id })
  }

  // ---- socket + identity: active as soon as the page mounts ----
  useEffect(() => {
    const socket = getSocket()
    connectSocket()

    apiFetch("/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => { if (me?.id != null) myId.current = String(me.id) })
      .catch(() => {})

    // usernames: the game state only carries ids, so we re-subscribe to the
    // original lobby (remembered by the lobby page when the game started)
    const onLobbyState = (l: { players: { id: number; username: string }[] }) => {
      for (const p of l.players) names.current.set(p.id, p.username)
    }
    const lobbyId = sessionStorage.getItem("lastLobbyId")
    if (lobbyId) socket?.emit("lobby:subscribe", { lobbyId })

    const onState = (s: State) => {
      const alive = s.players.filter((p) => p.alive)

      // first state of a new game -> visual reset
      if (statusRef.current !== "playing" && alive.length > 1) {
        colorMap.current.clear()
        setWinner(null)
        setStatus("playing")
      }

      setState(s)

      // game over: 1 (or 0) survivor left
      if (statusRef.current === "playing" && alive.length <= 1) {
        setStatus("over")
        setWinner(alive[0]?.id ?? null)
        setCountdown(null)
      }
    }

    // server countdown: 3, 2, 1, 0 = GO (shown briefly)
    const onCountdown = ({ value }: { value: number }) => {
      setCountdown(value)
      if (goTimer.current) clearTimeout(goTimer.current)
      if (value === 0) goTimer.current = setTimeout(() => setCountdown(null), 800)
    }

    // -rbauerMod7- Sent to the whole game room on every Play received, so a
    // player who has already pressed watches the others arrive.
    const onReady = ({ ready, total }: { ready: number; total: number }) =>
      setReadyInfo({ ready, total })

    socket?.on("lobby.state", onLobbyState)
    socket?.on("game:state", onState)
    socket?.on("game:countdown", onCountdown)
    socket?.on("game:ready", onReady) // -rbauerMod7-
    return () => {
      socket?.off("lobby.state", onLobbyState)
      socket?.off("game:state", onState)
      socket?.off("game:countdown", onCountdown)
      socket?.off("game:ready", onReady) // -rbauerMod7-
      if (goTimer.current) clearTimeout(goTimer.current)
    }
  }, [])

  // ---- keyboard -> server input ----
  // (also accepted during the countdown: lets you pre-orient your cycle)
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

  // ---- -rbauerMod7- Play pressed: tell the server this player is done reading
  // The button disables itself immediately (`pressedPlay`) instead of waiting
  // for the round trip: the click is what the player sees, and the server
  // ignores a duplicate anyway (markReady works on a Set).
  function play() {
    setPressedPlay(true)
    getSocket()?.emit("player_ready")
  }

  // ---- back to lobby after the game ----
  function backToLobby() {
    const id = sessionStorage.getItem("lastLobbyId")
    // the backend reopened the lobby when the game ended (status 'open'),
    // so we can go back and start again; otherwise, back to the lobby list.
    router.push(id ? `/dashboard/online/lobby/${id}` : "/dashboard/online")
  }

  const me = state?.players.find((p) => p.id === myId.current)
  // local player's color for the board border
  // (grey until the id is known, so we do not pollute the colorMap)
  const myColor = myId.current ? colorOf(myId.current) : "#333"

  return (
    // -rbauerMod6- `pb-16` added for the tutorial: board + status bar + panel
    // can now be taller than the screen, and the footer (Footer.tsx) is fixed,
    // so it would sit on top of the last rules. Same fix as the lobby and
    // privacy pages.
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3.5 p-5 pb-16 font-mono text-[#ddd]">
      <GameCanvas state={state} colorOf={colorOf} borderColor={myColor}>
        {countdown !== null && <CountdownOverlay value={countdown} />}
        {status === "over" && (
          <GameOverOverlay
            // -rbauerMod5- Same three cases as before, each string now coming
            // from the dictionary of the active language.
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

      {/* -rbauerMod6- Rules and win condition, only while waiting for the host
          to start. `status` leaves "idle" on the first game:state, so the panel
          is gone before the first move -- nothing to hide by hand. */}
      {/* -rbauerMod7- ...and it now stays up as long as the player needs, since
          the countdown only starts once everyone has pressed the Play button at
          the bottom of the panel. The 1/1 fallback is what the button shows in
          the moment between the click and the server's first answer. */}
      {status === "idle" && (
        <GameTutorial
          pressed={pressedPlay}
          ready={readyInfo?.ready ?? 1}
          total={readyInfo?.total ?? 1}
          onPlay={play}
        />
      )}
    </div>
  )
}
