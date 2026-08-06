"use client";

import styles from './IdentificationCard.module.css';
import NavigationLink from './NavigationLink';
import { useTranslation } from '../lib/i18n/useTranslation';

const IdentificationCard = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.card}>
      <NavigationLink label={t("home.loginCta")} href="/login" />
      <NavigationLink label={t("home.registerCta")} href="/register" />
    </div>
  )
}

export default IdentificationCard
