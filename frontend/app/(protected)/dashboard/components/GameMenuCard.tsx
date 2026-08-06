import styles from './GameMenuCard.module.css';
import NavigationLink from '../../../components/NavigationLink';

const GameMenuCard = () => {
  return (
    <div className={styles.card}>
      <NavigationLink label="Play" href="/dashboard/online" />
      <NavigationLink label="Social" href="/dashboard/social" />

    </div>
  )
}

export default GameMenuCard