"use client";

// ============================================================================
// -rbauerMod3- "/privacy" -- the Privacy Policy page required by the subject.
//
// In the (public) route group, which has no auth guard: a visitor must be able
// to read what data the app collects before signing up.
//
// The text lives in the translation dictionaries, so the page follows the
// language switcher like every other page.
// ============================================================================

import Link from "next/link";
import { useTranslation } from "@/app/lib/i18n/useTranslation";

// -rbauerMod3- Two values that must NOT be translated: kept here so they are
// written once instead of duplicated across the four language files, and
// injected through the {{date}} and {{logins}} placeholders.
const LAST_UPDATED = "2026-08-16";
const TEAM_LOGINS = "rbauer, van-nguy, ttouahmi, anvacca";

// -rbauerMod3- Display order. Each entry matches a `privacy.<name>.title` /
// `privacy.<name>.body` pair in the dictionaries. Adding a section means one
// line here plus one entry per dictionary -- no JSX; reordering is reordering
// this list.
const SECTIONS = [
  "intro",
  "dataCollected",
  "purpose",
  "cookies",
  "sharing",
  "retention",
  "security",
  "rights",
  "contact",
];

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    // -rbauerMod3- `pb-16` reserves room for the fixed footer (Footer.tsx),
    // which would otherwise cover the last lines of this scrollable page.
    <main className="flex flex-col items-center min-h-screen pt-10 px-4 pb-16">
      {/* -rbauerMod3- max-w-3xl caps the line length: full-width paragraphs on a
          desktop screen are hard to follow from one line to the next. */}
      <div className="w-full max-w-3xl">
        {/* -rbauerMod3- Same "back to home" link as login/register, reusing the
            existing common.* keys. */}
        <Link
          href="/"
          aria-label={t("common.backToHomeAria")}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white w-fit"
        >
          <span className="text-lg leading-none">←</span>
          {t("common.backToHome")}
        </Link>

        {/* -rbauerMod3- `title title-log` are the global classes used by the
            login/register headings: no new heading style. */}
        <h1 className="title title-log mt-6">{t("privacy.title")}</h1>

        <p className="text-center text-sm text-white/50">
          {t("common.lastUpdated", { date: LAST_UPDATED })}
        </p>

        {/*
          -rbauerMod3-
          One <section> per entry of SECTIONS, with the key built by
          interpolation: t() takes a plain string, so a dynamic key works like a
          hardcoded one.

          `logins` is passed to every body although only `contact` uses it:
          interpolate() only substitutes placeholders actually present.
        */}
        {SECTIONS.map((section) => (
          <section key={section} className="mt-8">
            <h2 className="subtitle-top">{t(`privacy.${section}.title`)}</h2>
            <p className="text-white/80 leading-relaxed">
              {t(`privacy.${section}.body`, { logins: TEAM_LOGINS })}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
