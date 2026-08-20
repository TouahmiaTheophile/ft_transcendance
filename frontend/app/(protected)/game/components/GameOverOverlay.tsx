"use client"

import styles from "./GameOverOverlay.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type Props = {
  label: string
  color: string
  subtitle: string
  onBack: () => void
}

export default function GameOverOverlay({ label, color, subtitle, onBack }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.overlay}>
      <div className={styles.label} style={{ color }}>
        {label}
      </div>
      <div className={styles.subtitle}>{subtitle}</div>
      <button onClick={onBack} className={styles.button}>
        ← {t("game.backToLobby")}
      </button>
    </div>
  )
}
