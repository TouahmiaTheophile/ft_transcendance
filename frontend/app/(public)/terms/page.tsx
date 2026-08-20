"use client";

import Link from "next/link";
import { useTranslation } from "@/app/lib/i18n/useTranslation";

const LAST_UPDATED = "2026-08-16";

const SECTIONS = [
  "intro",
  "account",
  "conduct",
  "content",
  "availability",
  "termination",
  "liability",
  "changes",
];

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <main className="flex flex-col items-center min-h-screen pt-10 px-4 pb-16">
      <div className="w-full max-w-3xl">
        <Link
          href="/"
          aria-label={t("common.backToHomeAria")}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white w-fit"
        >
          <span className="text-lg leading-none">←</span>
          {t("common.backToHome")}
        </Link>

        <h1 className="title title-log mt-6">{t("terms.title")}</h1>

        <p className="text-center text-sm text-white/50">
          {t("common.lastUpdated", { date: LAST_UPDATED })}
        </p>

        {SECTIONS.map((section) => (
          <section key={section} className="mt-8">
            <h2 className="subtitle-top">{t(`terms.${section}.title`)}</h2>
            <p className="text-white/80 leading-relaxed">{t(`terms.${section}.body`)}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
