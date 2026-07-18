import styles from "./GameOverOverlay.module.css"

type Props = {
  label: string // winner username, "AI", or "draw"
  color: string // winner's cycle color
  subtitle: string // "you win!", "wins the game", "nobody survived"
  onBack: () => void
}

export default function GameOverOverlay({ label, color, subtitle, onBack }: Props) {
  return (
    <div className={styles.overlay}>
      {/* winner name in their cycle color (computed at runtime -> inline) */}
      <div className={styles.label} style={{ color }}>
        {label}
      </div>
      <div className={styles.subtitle}>{subtitle}</div>
      <button onClick={onBack} className={styles.button}>
        ← back to lobby
      </button>
    </div>
  )
}
