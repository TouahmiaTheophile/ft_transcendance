"use client";

import Link from "next/link";
import { useTranslation } from "@/app/lib/i18n/useTranslation";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur">
      <nav
        aria-label={t("footer.nav")}
        className="flex items-center justify-center gap-3 py-2 text-xs text-white/60"
      >
        <Link href="/privacy" className="hover:text-white focus-visible:text-white">
          {t("footer.privacy")}
        </Link>

        <span aria-hidden="true">·</span>

        <Link href="/terms" className="hover:text-white focus-visible:text-white">
          {t("footer.terms")}
        </Link>
      </nav>
    </footer>
  );
}
