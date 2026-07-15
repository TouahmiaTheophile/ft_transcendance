import styles from "./StartButton.module.css"

type Props = {
  canStart: boolean
  onStart: () => void
}

export default function StartButton({ canStart, onStart }: Props) {
  return (
    <button onClick={onStart} disabled={!canStart} className={styles.button}>
      {canStart ? "Start game" : "Need at least 2 players"}
    </button>
  )
}
