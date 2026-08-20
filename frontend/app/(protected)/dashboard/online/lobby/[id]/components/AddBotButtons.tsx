"use client"

import styles from "./AddBotButtons.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation" // -rbauerMod5-

type Props = {
  onAddBot: (kind: "smart" | "random") => void
}

export default function AddBotButtons({ onAddBot }: Props) {
  const { t } = useTranslation() // -rbauerMod5-

  return (
    <div className={styles.row}>
      {/* -rbauerMod5- "smart" / "random" stay as they are in onAddBot(): they are
          values sent to the backend, not text shown to the user. Only the
          button labels are translated. */}
      <button onClick={() => onAddBot("smart")} className={styles.button}>
        {t("lobby.smartBot")}
      </button>
      <button onClick={() => onAddBot("random")} className={styles.button}>
        {t("lobby.randomBot")}
      </button>
    </div>
  )
}
