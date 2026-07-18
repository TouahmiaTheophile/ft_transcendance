import styles from "./CountdownOverlay.module.css"

type Props = {
  value: number // 3, 2, 1, 0 = GO
}

export default function CountdownOverlay({ value }: Props) {
  return (
    <div className={`${styles.overlay} ${value === 0 ? styles.go : ""}`}>
      {value === 0 ? "GO!" : value}
    </div>
  )
}
