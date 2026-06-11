import Avatar from "./Avatar"
import styles from "./FriendList.module.css"

type Friend = {
  id: number
  friend: { id: number; username: string; avatarUrl: string | null }
}

type Props = {
  friends: Friend[]
}

export default function FriendList({ friends }: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Friends</h2>
      {friends.length === 0 && (
        <p className={styles.empty}>No friends yet.</p>
      )}
      {friends.map(f => (
        <div key={f.id} className={styles.row}>
          <Avatar username={f.friend.username} avatarUrl={f.friend.avatarUrl} size={32} />
          <span className={styles.username}>{f.friend.username}</span>
        </div>
      ))}
    </div>
  )
}
