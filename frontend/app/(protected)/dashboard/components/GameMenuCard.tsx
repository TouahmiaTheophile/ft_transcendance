import styles from './GameMenuCard.module.css';
import NavigationLink from '../../../components/NavigationLink';

const GameMenuCard = () => {
  return (
    <div className={styles.card}>
      <NavigationLink label="Local" href="/local" />
      <NavigationLink label="Online" href="/online" />
    </div>
  )
}

export default GameMenuCard