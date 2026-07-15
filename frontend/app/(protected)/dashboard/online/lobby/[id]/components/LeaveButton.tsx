import styles from "./LeaveButton.module.css"

type Props = {
  onLeave: () => void
}

export default function LeaveButton({ onLeave }: Props) {
  return (
    <button onClick={onLeave} aria-label="Leave lobby" className={styles.button}>
      <span className={styles.arrow}>←</span>
      Leave lobby
    </button>
  )
}
