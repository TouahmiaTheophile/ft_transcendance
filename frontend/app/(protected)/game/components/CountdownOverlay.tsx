"use client"

import styles from "./CountdownOverlay.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation" // -rbauerMod5-

type Props = {
  value: number // 3, 2, 1, 0 = GO
}

export default function CountdownOverlay({ value }: Props) {
  const { t } = useTranslation() // -rbauerMod5-

  return (
    <div className={`${styles.overlay} ${value === 0 ? styles.go : ""}`}>
      {/* -rbauerMod5- Only the last step is a word ("GO!", "PARTEZ !", "LOS!"):
          3, 2 and 1 are digits, the same in every language. */}
      {value === 0 ? t("game.go") : value}
    </div>
  )
}
