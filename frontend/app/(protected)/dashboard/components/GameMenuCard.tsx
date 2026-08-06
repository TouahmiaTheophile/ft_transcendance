"use client";

import styles from './GameMenuCard.module.css';
import NavigationLink from '../../../components/NavigationLink';
import { useTranslation } from '../../../lib/i18n/useTranslation';

const GameMenuCard = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.card}>
      <NavigationLink label={t("dashboard.play")} href="/dashboard/online" />
      <NavigationLink label={t("dashboard.social")} href="/dashboard/social" />

    </div>
  )
}

export default GameMenuCard
