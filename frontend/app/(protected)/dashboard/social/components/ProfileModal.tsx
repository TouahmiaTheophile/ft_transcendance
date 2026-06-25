"use client"

import { useState } from "react"
import { apiFetch } from "@/app/lib/api"
import Avatar from "./Avatar"
import styles from "./ProfileModal.module.css"

type User = {
  id: number
  username: string
  avatarUrl: string | null
  email?: string | null
}

type Props = {
  user: User
  isMe: boolean
  onClose: () => void
  onUpdated: () => void
}

export default function ProfileModal({ user, isMe, onClose, onUpdated }: Props) {
  const [email, setEmail] = useState(user.email ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const changeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setStatus(null)


    const form = new FormData()
    form.append("file", file)
    const res = await apiFetch("/users/me/avatar", { method: "PATCH", body: form })

    if (res.ok) {
      setStatus("Photo updated")
      onUpdated()
    } else {
      setError("Couldn't update photo (must be an image under 2 MB)")
    }
  }

  const removeAvatar = async () => {
    setError(null)
    setStatus(null)
    const res = await apiFetch("/users/me/avatar", { method: "DELETE" })
    if (res.ok) {
      setStatus("Photo removed")
      onUpdated()
    } else {
      setError("Couldn't remove photo")
    }
  }

  const saveEmail = async () => {
    setError(null)
    setStatus(null)
    const res = await apiFetch("/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, currentPassword }),
    })

    if (res.ok) {
      setStatus("Email updated")
      setCurrentPassword("")
      onUpdated()
    } else {
      const data = await res.json().catch(() => null)
      setError(data?.message ?? "Couldn't update email")
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Profile</h2>
          <button onClick={onClose} className={styles.close}>✕</button>
        </div>

        <div className={styles.identity}>
          <Avatar username={user.username} avatarUrl={user.avatarUrl} size={96} />
          <span className={styles.username}>{user.username}</span>
        </div>

        {isMe && (
          <div className={styles.editSection}>
            <div className={styles.avatarControls}>
              <label className={styles.avatarBtn}>
                Change photo
                <input type="file" accept="image/*" hidden onChange={changeAvatar} />
              </label>
              <button onClick={removeAvatar} className={styles.avatarBtn}>
                Remove
              </button>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Username (cannot be changed)</span>
              <input value={user.username} disabled className={styles.input} />
            </label>

            <div className={styles.emailSection}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Current password (to confirm)</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.input}
                />
              </label>
              <button onClick={saveEmail} className={styles.saveBtn}>
                Save email
              </button>
            </div>
          </div>
        )}

        <div className={styles.history}>
          <h3 className={styles.historyTitle}>Match history</h3>
          <p className={styles.historyEmpty}>Coming soon.</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {status && <p className={styles.status}>{status}</p>}
      </div>
    </div>
  )
}
