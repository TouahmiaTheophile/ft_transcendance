import styles from './IdentificationCard.module.css';
import NavigationLink from './NavigationLink';

const IdentificationCard = () => {
  return (
    <div className={styles.card}>
      <NavigationLink label="Login" href="/login" />
      <NavigationLink label="Register" href="/register" />
    </div>
  )
}

export default IdentificationCard