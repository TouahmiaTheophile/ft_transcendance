import { Status } from "../types"
import styles from "./GameStatusBar.module.css"

type Props = {
  status: Status
  myColor: string
  eliminated: boolean
  alive: number
  total: number
}

export default function GameStatusBar({ status, myColor, eliminated, alive, total }: Props) {
  if (status === "idle")
    return (
      <div className={styles.bar}>
        <span className={styles.muted}>waiting for the game to start…</span>
      </div>
    )

  if (status !== "playing") return null

  return (
    <div className={styles.bar}>
      {/* your color badge (computed at runtime -> inline) */}
      <b style={{ color: myColor }}>you</b>
      {eliminated && <span className={styles.dead}> — eliminated, spectating</span>}
      <span className={styles.muted}>
        {"  |  "}alive: {alive}/{total}
      </span>
    </div>
  )
}
