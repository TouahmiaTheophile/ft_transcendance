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
}

export default function FriendList({ friends, onlineIds, onConversationSelect }: Props) {
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
          <button key={current.id} className={styles.row} onClick={() => onConversationSelect(current.friend.id)}>
            <Avatar username={current.friend.username} avatarUrl={current.friend.avatarUrl} size={32} />
            <span className={styles.username}>{current.friend.username}</span>
            <span
              title={isOnline ? t("social.online") : t("social.offline")}
              className={`${styles.status} ${isOnline ? styles.online : ""}`}
            />
          </button>
        )
      })}
    </div>
  )
}
