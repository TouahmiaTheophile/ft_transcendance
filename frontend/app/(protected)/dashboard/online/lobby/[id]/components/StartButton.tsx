"use client";

import styles from "./StartButton.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type Props = {
  canStart: boolean
  onStart: () => void
}

export default function StartButton({ canStart, onStart }: Props) {
  const { t } = useTranslation()

  return (
    <button onClick={onStart} disabled={!canStart} className={styles.button}>
      {canStart ? t("lobby.startGame") : t("lobby.needMorePlayers")}
    </button>
  )
}
