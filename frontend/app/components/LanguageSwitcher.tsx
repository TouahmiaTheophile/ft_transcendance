"use client";

import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { SUPPORTED_LOCALES, type Locale } from "@/app/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="fixed top-3 right-3 z-50">
      <label htmlFor="language-switcher" className="sr-only">
        {t("languageSwitcher.label")}
      </label>

      <select
        id="language-switcher"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="select select-sm select-bordered bg-black/40 text-white backdrop-blur"
      >
        {SUPPORTED_LOCALES.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  );
}
