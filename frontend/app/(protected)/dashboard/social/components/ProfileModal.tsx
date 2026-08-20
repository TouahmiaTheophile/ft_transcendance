"use client"

import { useState } from "react"
import { apiFetch } from "@/app/lib/api"
import Avatar from "./Avatar"
import styles from "./ProfileModal.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type User = {
  id: number
  username: string
  avatarUrl: string | null
  email?: string | null
  age?: number | null
}

type Props = {
  user: User
  isMe: boolean
  onClose: () => void
  onUpdated: () => void
}

export default function ProfileModal({ user, isMe, onClose, onUpdated }: Props) {
  const { t } = useTranslation()
  const [email, setEmail] = useState(user.email ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [age, setAge] = useState(user.age != null ? String(user.age) : "")
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
      setStatus(t("profile.status.photoUpdated"))
      onUpdated()
    } else {
      setError(t("profile.errors.photoUpdateFailed"))
    }
  }

  const removeAvatar = async () => {
    setError(null)
    setStatus(null)
    const res = await apiFetch("/users/me/avatar", { method: "DELETE" })
    if (res.ok) {
      setStatus(t("profile.status.photoRemoved"))
      onUpdated()
    } else {
      setError(t("profile.errors.photoRemoveFailed"))
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
      setStatus(t("profile.status.emailUpdated"))
      setCurrentPassword("")
      onUpdated()
    } else {
      setError(t("profile.errors.emailUpdateFailed"))
    }
  }

  const saveAge = async () => {
    setError(null)
    setStatus(null)

    const trimmed = age.trim()
    const ageNumber = Number(trimmed)
    if (!trimmed || !Number.isInteger(ageNumber) || ageNumber < 0 || ageNumber > 150) {
      setError(t("profile.errors.ageUpdateFailed"))
      return
    }

    const res = await apiFetch("/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: ageNumber }),
    })

    if (res.ok) {
      setStatus(t("profile.status.ageUpdated"))
      onUpdated()
    } else {
      setError(t("profile.errors.ageUpdateFailed"))
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t("profile.title")}</h2>
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
                {t("profile.changePhoto")}
                <input type="file" accept="image/*" hidden onChange={changeAvatar} />
              </label>
              <button onClick={removeAvatar} className={styles.avatarBtn}>
                {t("profile.removePhoto")}
              </button>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t("profile.usernameLocked")}</span>
              <input value={user.username} disabled className={styles.input} />
            </label>

            <div className={styles.emailSection}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>{t("profile.emailLabel")}</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>{t("profile.currentPasswordLabel")}</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.input}
                />
              </label>
              <button onClick={saveEmail} className={styles.saveBtn}>
                {t("profile.saveEmail")}
              </button>
            </div>

            <div className={styles.ageSection}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>{t("profile.ageLabel")}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className={styles.input}
                />
              </label>
              <button onClick={saveAge} className={styles.saveBtn}>
                {t("profile.saveAge")}
              </button>
            </div>
          </div>
        )}

        <div className={styles.history}>
          <h3 className={styles.historyTitle}>{t("profile.matchHistoryTitle")}</h3>
          <p className={styles.historyEmpty}>{t("profile.comingSoon")}</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {status && <p className={styles.status}>{status}</p>}
      </div>
    </div>
  )
}
