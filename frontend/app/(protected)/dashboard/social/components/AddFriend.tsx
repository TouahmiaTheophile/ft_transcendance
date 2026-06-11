"use client"

import { useEffect, useRef, useState } from "react"
import { apiFetch } from "@/app/lib/api"
import Avatar from "./Avatar"
import styles from "./AddFriend.module.css"

type SearchUser = {
  id: number
  username: string
  avatarUrl: string | null
}

type Props = {
  friendIds: Set<number>
}

export default function AddFriend({ friendIds }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchUser[]>([])
  const [sent, setSent] = useState<Set<number>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      const res = await apiFetch(`/users/search?query=${encodeURIComponent(query.trim())}&max=8`)
      if (!res.ok) return
      const data: SearchUser[] = await res.json()
      setResults(data.filter(u => !friendIds.has(u.id)))
    }, 300)
  }, [query, friendIds])

  const sendRequest = async (userId: number) => {
    const res = await apiFetch(`/friends/request/${userId}`, { method: "POST" })
    if (res.ok) setSent(prev => new Set(prev).add(userId))
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.label}>Add friend</h3>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search username..."
        className={styles.input}
      />
      {query.trim() && (
        <div className={styles.results}>
          {results.length === 0 && <p className={styles.empty}>No users found.</p>}
          {results.map(user => (
            <div key={user.id} className={styles.row}>
              <Avatar username={user.username} avatarUrl={user.avatarUrl} size={28} />
              <span className={styles.rowUsername}>{user.username}</span>
              <button
                onClick={() => sendRequest(user.id)}
                disabled={sent.has(user.id)}
                className={styles.inviteBtn}
              >
                {sent.has(user.id) ? "Sent ✓" : "Invite"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
