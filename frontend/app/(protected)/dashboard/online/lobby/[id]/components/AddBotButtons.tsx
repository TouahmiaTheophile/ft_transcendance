import styles from "./AddBotButtons.module.css"

type Props = {
  onAddBot: (kind: "smart" | "random") => void
}

export default function AddBotButtons({ onAddBot }: Props) {
  return (
    <div className={styles.row}>
      <button onClick={() => onAddBot("smart")} className={styles.button}>
        Smart bot
      </button>
      <button onClick={() => onAddBot("random")} className={styles.button}>
        Random bot
      </button>
    </div>
  )
}
