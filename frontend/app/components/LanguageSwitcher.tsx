"use client";

// ============================================================================
// -rbauer- The language picker. Rendered once in app/layout.tsx, fixed in the
// top-right corner, so it is present on every page, logged in or not.
// ============================================================================

import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { SUPPORTED_LOCALES, type Locale } from "@/app/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="fixed top-3 right-3 z-50">
      {/*
        -rbauer-
        A visible <label> would clutter the corner. `sr-only` keeps it in the
        page for screen readers while hiding it visually.
      */}
      <label htmlFor="language-switcher" className="sr-only">
        {t("languageSwitcher.label")}
      </label>

      {/*
        -rbauer-
        A plain <select> rather than a custom dropdown: it already handles the
        keyboard and screen readers correctly, which a hand-built one would
        have to reimplement.
      */}
      <select
        id="language-switcher"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="select select-sm select-bordered bg-black/40 text-white backdrop-blur"
      >
        {/*
          -rbauer-
          One <option> per language, generated from SUPPORTED_LOCALES in
          translations/index.ts -- which is why adding a language never
          requires touching this file.
        */}
        {SUPPORTED_LOCALES.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  );
}
