import styles from "./PlayerList.module.css"

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
  return (
    <div className={styles.section}>
      <p className={styles.count}>{players.length}/{maxPlayers} players</p>
      {players.map(player => (
        <div key={player.id} className={styles.row}>
          <span>{player.id < 0 ? "🤖" : "👤"}</span>
          <span className={styles.username}>{player.username}</span>
          {player.id === hostId && <span className={styles.host}>host</span>}
          {player.id === myId && <span className={styles.you}>you</span>}
        </div>
      ))}
    </div>
  )
}
