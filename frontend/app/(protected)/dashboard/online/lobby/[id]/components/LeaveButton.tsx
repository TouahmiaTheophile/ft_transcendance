"use client";

import styles from "./LeaveButton.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type Props = {
  onLeave: () => void
}

export default function LeaveButton({ onLeave }: Props) {
  const { t } = useTranslation()

  return (
    <button onClick={onLeave} aria-label={t("lobby.leave")} className={styles.button}>
      <span className={styles.arrow}>←</span>
      {t("lobby.leave")}
    </button>
  )
}
