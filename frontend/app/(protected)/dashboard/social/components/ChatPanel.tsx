"use client"

import styles from "./ChatPanel.module.css"
import { useCallback, useEffect, useState } from "react"
import { apiFetch } from "@/app/lib/api"
import { getSocket } from "@/app/lib/socket"
import { useTranslation } from "@/app/lib/i18n/useTranslation"


type User = {
  id: number
  username: string
  avatarUrl: string | null
}

type Conversation = {
  id: number
  friend: User
}

type Props = {
  conversation: Conversation | null
  meId: number | null
  onViewProfile: (user: User) => void
}

type Message = {
  id: number
  conversationId: number
  sender: User
  content: string
  sentAt: string
}

export default function ChatPanel({ conversation, meId, onViewProfile }: Props) {
  const { t } = useTranslation()

  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const sendMessage = () => {
    if (!conversation || !text.trim()) return
    const socket = getSocket()
    if (!socket) return
    setError(null)
    socket.emit("sendMessage", { conversationId: conversation.id, content: text })
    setText("")
  }

  useEffect(() => {
    if (!conversation)
      return

    const socket = getSocket()
    if (!socket)
      return

    socket.emit("joinConversation", { conversationId: conversation.id, limit: 50 })

    const onHistory = (msgs: Message[]) => setMessages(msgs)
    socket.on("history", onHistory)

    const onMessage = (msg: Message) => setMessages(prev => [...prev, msg])
    socket.on("message", onMessage)

    const onException = (err: { code: string; message: string }) => {
      console.error("chat error:", err.message)
      setError(err.message)
    }
    socket.on("exception", onException)

    return () => {
    socket.emit("leaveConversation", { conversationId: conversation.id })
    socket.off("history", onHistory)
    socket.off("message", onMessage)
    socket.off("exception", onException)
    }
  }, [conversation])

  return (
    // -rbauerMod3- Dropped `lg:h-[calc(100vh-3rem)]`: the 3rem underestimated
    // where this panel starts (pt-10 + back link + gap-6, ~84px, plus the 48px
    // reserved for the footer), so the panel was too tall and pushed its input
    // row below the fold.
    //
    // `h-full` replaces it with no magic number: the grid cell is already sized
    // by the parent chain in social/page.tsx, so the browser computes the
    // height and it survives changes to the header or the padding above.
    <div className={`${styles.panel} h-full`}>
      <div className={styles.header}>
        {conversation ? (
          <button
            onClick={() => onViewProfile(conversation.friend)}
            className={styles.title}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            {conversation.friend.username}
          </button>
        ) : (
          <h2 className={styles.title}>{t("chat.title")}</h2>
        )}
      </div>
      <div className={styles.body}>
        {conversation ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.row} ${message.sender.id === meId ? styles.rowMine : ""}`}
            >
              <div
                className={`${styles.bubble} ${message.sender.id === meId ? styles.bubbleMine : ""}`}
              >
                {message.content}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>{t("chat.emptyState")}</div>
        )}
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.inputRow}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage() }}
          placeholder={t("chat.placeholder")}
          className={styles.input}
        />
        <button onClick={sendMessage} className={styles.inviteBtn}>
          {t("chat.send")}
        </button>
      </div>
    </div>
  )
}
