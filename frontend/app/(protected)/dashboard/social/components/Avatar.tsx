import { apiUrl } from "@/app/lib/api"
import styles from "./Avatar.module.css"

type Props = {
  username: string
  avatarUrl: string | null
  size?: number
}

export default function Avatar({ username, avatarUrl, size = 36 }: Props) {
  const style = { width: size, height: size }
  if (avatarUrl)
    return <img src={apiUrl(avatarUrl)} alt={username} className={styles.avatar} style={style} />
  return (
    <div className={styles.initials} style={{ ...style, fontSize: size * 0.38 }}>
      {username[0].toUpperCase()}
    </div>
  )
}
