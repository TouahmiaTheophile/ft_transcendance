"use client"

import { Status } from "../types"
import styles from "./GameStatusBar.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type Props = {
  status: Status
  myColor: string
  eliminated: boolean
  alive: number
  total: number
}

export default function GameStatusBar({ status, myColor, eliminated, alive, total }: Props) {
  const { t } = useTranslation()

  if (status === "idle")
    return (
      <div className={styles.bar}>
        <span className={styles.muted}>{t("game.waiting")}</span>
      </div>
    )

  if (status !== "playing") return null

  return (
    <div className={styles.bar}>
      <b style={{ color: myColor }}>{t("game.you")}</b>
      {eliminated && <span className={styles.dead}> — {t("game.eliminated")}</span>}
      <span className={styles.muted}>
        {"  |  "}
        {t("game.alive", { alive, total })}
      </span>
    </div>
  )
}
