"use client";

import styles from "./PlayerList.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type LobbyPlayer = {
  id: number
  username: string
}

type Props = {
  players: LobbyPlayer[]
  maxPlayers: number
  hostId: number
  myId: number | null
}

export default function PlayerList({ players, maxPlayers, hostId, myId }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.section}>
      <p className={styles.count}>{t("lobby.players", { count: players.length, max: maxPlayers })}</p>
      {players.map(player => (
        <div key={player.id} className={styles.row}>
          <span>{player.id < 0 ? "🤖" : "👤"}</span>
          <span className={styles.username}>{player.username}</span>
          {player.id === hostId && <span className={styles.host}>{t("lobby.host")}</span>}
          {player.id === myId && <span className={styles.you}>{t("lobby.you")}</span>}
        </div>
      ))}
    </div>
  )
}
