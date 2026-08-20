"use client"

import styles from "./GameOverOverlay.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation" // -rbauerMod5-

type Props = {
  // -rbauerMod5- `label` and `subtitle` stay props, already translated by the
  // page: both depend on WHO won (a username, a bot, a draw), which only the
  // page knows. It calls t() there and this component just displays the result.
  label: string // winner username, t("game.ai"), or t("game.draw")
  color: string // winner's cycle color
  subtitle: string // t("game.youWin") / t("game.winsTheGame") / t("game.nobodySurvived")
  onBack: () => void
}

export default function GameOverOverlay({ label, color, subtitle, onBack }: Props) {
  // -rbauerMod5- The button text, on the other hand, is fixed: translated here.
  const { t } = useTranslation()

  return (
    <div className={styles.overlay}>
      {/* winner name in their cycle color (computed at runtime -> inline) */}
      <div className={styles.label} style={{ color }}>
        {label}
      </div>
      <div className={styles.subtitle}>{subtitle}</div>
      <button onClick={onBack} className={styles.button}>
        {/* -rbauerMod5- The arrow is decoration and stays out of the dictionary,
            like in LeaveButton.tsx. */}
        ← {t("game.backToLobby")}
      </button>
    </div>
  )
}
