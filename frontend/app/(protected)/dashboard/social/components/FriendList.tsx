import Avatar from "./Avatar"
import styles from "./FriendList.module.css"

type Friend = {
  id: number
  friend: { id: number; username: string; avatarUrl: string | null }
}

type Props = {
  friends: Friend[]
  onConversationSelect: (friendId: number) => void
}

export default function FriendList({ friends, onConversationSelect }: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Friends</h2>
      {friends.length === 0 && (
        <p className={styles.empty}>No friends yet.</p>
      )}
      {friends.map(current => (
        <button key={current.id} className={styles.row} onClick={() => onConversationSelect(current.friend.id)}>
          <Avatar username={current.friend.username} avatarUrl={current.friend.avatarUrl} size={32} />
          <span className={styles.username}>{current.friend.username}</span>
        </button>
      ))}
    </div>
  )
}
