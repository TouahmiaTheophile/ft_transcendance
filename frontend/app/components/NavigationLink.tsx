import Link from 'next/link';
import styles from './IdentificationCard.module.css';

export default function NavigationLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className={`${styles.link} btn btn-primary`} aria-label={label}>
      {label}
    </Link>
  );
}
