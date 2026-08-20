"use client"

import styles from "./CountdownOverlay.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type Props = {
  value: number
}

export default function CountdownOverlay({ value }: Props) {
  const { t } = useTranslation()

  return (
    <div className={`${styles.overlay} ${value === 0 ? styles.go : ""}`}>
      {value === 0 ? t("game.go") : value}
    </div>
  )
}
