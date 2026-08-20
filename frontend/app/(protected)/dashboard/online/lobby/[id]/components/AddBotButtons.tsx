"use client"

import styles from "./AddBotButtons.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type Props = {
  onAddBot: (kind: "smart" | "random") => void
}

export default function AddBotButtons({ onAddBot }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.row}>
      <button onClick={() => onAddBot("smart")} className={styles.button}>
        {t("lobby.smartBot")}
      </button>
      <button onClick={() => onAddBot("random")} className={styles.button}>
        {t("lobby.randomBot")}
      </button>
    </div>
  )
}
