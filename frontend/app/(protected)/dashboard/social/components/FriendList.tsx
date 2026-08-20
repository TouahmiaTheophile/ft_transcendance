"use client";

import Avatar from "./Avatar"
import styles from "./FriendList.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type Friend = {
  id: number
  friend: { id: number; username: string; avatarUrl: string | null }
}

type Props = {
  friends: Friend[]
  onlineIds: Set<number>
  onConversationSelect: (friendId: number) => void
  onRemove: (friendshipId: number) => void
}

export default function FriendList({ friends, onlineIds, onConversationSelect, onRemove }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{t("social.friendsTitle")}</h2>
      {friends.length === 0 && (
        <p className={styles.empty}>{t("social.noFriends")}</p>
      )}
      {friends.map(current => {
        const isOnline = onlineIds.has(current.friend.id)
        return (
          <div key={current.id} className={styles.row}>
            <button className={styles.open} onClick={() => onConversationSelect(current.friend.id)}>
              <Avatar username={current.friend.username} avatarUrl={current.friend.avatarUrl} size={32} />
              <span className={styles.username}>{current.friend.username}</span>
              <span
                title={isOnline ? t("social.online") : t("social.offline")}
                className={`${styles.status} ${isOnline ? styles.online : ""}`}
              />
            </button>
            <button
              onClick={() => onRemove(current.id)}
              aria-label={t("social.removeFriend")}
              title={t("social.removeFriend")}
              className={styles.removeBtn}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
