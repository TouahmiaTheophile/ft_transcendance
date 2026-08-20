"use client"

// ============================================================================
// -rbauerMod6- The game tutorial: the rules and how to win.
//
// Shown on the game page while `status === "idle"` -- the stretch between
// arriving from the lobby and the host pressing Start. That is the one moment
// where the player is waiting with nothing to do, and it disappears on its own
// when the countdown begins, so it never covers the board and needs no
// open/close button, no state and no timer.
//
// Every line comes from the dictionaries (game.tutorial.*), so the tutorial
// follows the language switcher like the rest of the app.
//
// -rbauerMod7- Correction of that "disappears on its own" above: it used to
// disappear after three seconds, whether or not the panel had been read. The
// panel now ends with a Play button, and the server waits for it before
// counting down -- so the tutorial stays up exactly as long as the player
// wants. The state of that button belongs to the page (it talks to the
// socket), so it arrives here as props and is only laid out.
// ============================================================================

import { useTranslation } from "@/app/lib/i18n/useTranslation"
import PlayButton from "./PlayButton" // -rbauerMod7-
import styles from "./GameTutorial.module.css"

// -rbauerMod6- Display order of the rules. Each name matches a
// `game.tutorial.rules.<name>` key in the four dictionaries.
//
// Same trick as the privacy page: the list drives the rendering, so adding or
// reordering a rule happens here instead of in the JSX below.
const RULES = [
  "move",
  "trail",
  "crash",
  "headOn",
  "noReverse",
  "controls",
  "countdown",
  "win",
]

// -rbauerMod7- Everything here is passed straight down to PlayButton; the
// tutorial itself has no state and only decides where the button sits.
type Props = {
  pressed: boolean
  ready: number
  total: number
  onPlay: () => void
}

export default function GameTutorial({ pressed, ready, total, onPlay }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{t("game.tutorial.title")}</h2>

      {/* -rbauerMod6- The goal first, on its own: it is the one line a player
          has to read if they read nothing else. */}
      <p className={styles.goal}>{t("game.tutorial.goal")}</p>

      <ul className={styles.list}>
        {/* -rbauerMod6- One <li> per entry of RULES. The key is built by
            interpolation, which t() handles like any other string. */}
        {RULES.map((rule) => (
          <li key={rule}>{t(`game.tutorial.rules.${rule}`)}</li>
        ))}
      </ul>

      {/* -rbauerMod7- The button closes the panel the way a form closes with
          its submit: read the rules, then press. Placed inside the panel, and
          last, so the reading order is the playing order. */}
      <PlayButton pressed={pressed} ready={ready} total={total} onPlay={onPlay} />
    </div>
  )
}
