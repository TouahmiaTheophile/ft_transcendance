"use client"

// ============================================================================
// -rbauerMod7- The Play button that now starts the game.
//
// Before this modification the server started its 3-2-1 as soon as the host
// pressed Start in the lobby, so the tutorial next to this button was only on
// screen for three seconds -- not enough to read it. The countdown now waits
// for every human player to press Play (backend/src/game/game.service.ts:
// markReady), which means this button is the real starting gun.
//
// It has exactly two states, and it never leaves the screen between them:
//   - not pressed yet -> "Play", clickable.
//   - pressed         -> "Waiting for the other players… 1/2", disabled.
//
// Both labels come from the dictionaries (game.tutorial.*), so the button
// follows the language switcher like everything else -- which is precisely
// what makes its width a problem, see below.
// ============================================================================

import { useTranslation } from "@/app/lib/i18n/useTranslation"
import styles from "./PlayButton.module.css"

type Props = {
  // -rbauerMod7- Already pressed: the click has been sent, we are only waiting
  // for the other players now.
  pressed: boolean
  // -rbauerMod7- How many players have pressed, out of how many. Null until the
  // server has answered the first click (it broadcasts 'game:ready'), which is
  // why the page passes a 1/1 fallback rather than leaving a hole in the text.
  ready: number
  total: number
  onPlay: () => void
}

export default function PlayButton({ pressed, ready, total, onPlay }: Props) {
  const { t } = useTranslation()

  // -rbauerMod7- One label, picked before rendering: the JSX below stays a
  // single <button>, so React keeps the same element and the box does not jump
  // when the state changes.
  const label = pressed
    ? t("game.tutorial.waitingPlayers", { ready, total })
    : t("game.tutorial.play")

  return (
    <button
      className={styles.button}
      onClick={onPlay}
      disabled={pressed}
      // -rbauerMod7- The label can be cut by the CSS ellipsis (a long
      // translation in a fixed box). `title` puts the whole sentence back in
      // the native tooltip, so nothing is ever truly lost -- and it is also
      // what screen readers announce.
      title={label}
    >
      {/* -rbauerMod7- The text lives in its own <span> because that is what
          gets truncated: `text-overflow` needs a block that overflows, and the
          button itself is the fixed-size box around it. */}
      <span className={styles.label}>{label}</span>
    </button>
  )
}
