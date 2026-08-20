"use client"

import { Status } from "../types"
import styles from "./GameStatusBar.module.css"
// -rbauerMod5- Same hook as every other translated component (PlayerList,
// StartButton...): it reads the language chosen in the header and re-renders
// this bar on its own when it changes.
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type Props = {
  status: Status
  myColor: string
  eliminated: boolean
  alive: number
  total: number
}

export default function GameStatusBar({ status, myColor, eliminated, alive, total }: Props) {
  // -rbauerMod5- Called before the early returns below: a hook must run on every
  // render, so it can never sit after an `if`.
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
      {/* your color badge (computed at runtime -> inline) */}
      <b style={{ color: myColor }}>{t("game.you")}</b>
      {/* -rbauerMod5- The em dash stays here, in the layout: it is punctuation,
          not text to translate. Only the words go through t(). */}
      {eliminated && <span className={styles.dead}> — {t("game.eliminated")}</span>}
      <span className={styles.muted}>
        {"  |  "}
        {/* -rbauerMod5- The two numbers are passed to t() as variables, so each
            language decides where they land in the sentence. */}
        {t("game.alive", { alive, total })}
      </span>
    </div>
  )
}
