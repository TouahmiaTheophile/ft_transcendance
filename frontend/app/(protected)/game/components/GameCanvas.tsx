import { ReactNode, useEffect, useRef } from "react"
import { CELL, State } from "../types"
import styles from "./GameCanvas.module.css"

type Props = {
  state: State | null
  colorOf: (id: string) => string
  borderColor: string
  children?: ReactNode
}

export default function GameCanvas({ state, colorOf, borderColor, children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv || !state) return
    const ctx = cv.getContext("2d")
    if (!ctx) return
    cv.width = state.width * CELL
    cv.height = state.height * CELL
    ctx.fillStyle = "#111"
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.fillStyle = "#444"
    for (const c of state.trails) {
      const [x, y] = c.split(",").map(Number)
      ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1)
    }
    for (const p of state.players) {
      ctx.fillStyle = colorOf(p.id)
      ctx.globalAlpha = p.alive ? 1 : 0.25
      ctx.fillRect(p.x * CELL, p.y * CELL, CELL - 1, CELL - 1)
      ctx.globalAlpha = 1
    }
  }, [state, colorOf])

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ borderColor }} />
      {children}
    </div>
  )
}
