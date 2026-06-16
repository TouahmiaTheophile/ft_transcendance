"use client"

import { apiFetch } from "@/app/lib/api"
import Avatar from "./Avatar"
import styles from "./PendingRequests.module.css"

type User = {
  id: number
  username: string
  avatarUrl: string | null
}

type Props = {
  requests: { id: number; requester: User }[]
  onResolved: () => void
}

export default function PendingRequests({ requests, onResolved }: Props) {
  if (requests.length === 0) return null

  const respond = async (friendshipId: number, action: "accept" | "reject") => {
    const res = await apiFetch(`/friends/${action}/${friendshipId}`, { method: "POST" })
    if (res.ok) onResolved()
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.label}>Friend requests</h3>
      {requests.map(r => (
        <div key={r.id} className={styles.row}>
          <Avatar username={r.requester.username} avatarUrl={r.requester.avatarUrl} size={28} />
          <span className={styles.username}>{r.requester.username}</span>
          <button onClick={() => respond(r.id, "accept")} className={styles.acceptBtn}>
            Accept
          </button>
          <button onClick={() => respond(r.id, "reject")} className={styles.rejectBtn}>
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
