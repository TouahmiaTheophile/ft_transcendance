import styles from "./ChatPanel.module.css"

export default function ChatPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Chat</h2>
      </div>
      <div className={styles.body}>
        Select a friend to start chatting
      </div>
    </div>
  )
}
