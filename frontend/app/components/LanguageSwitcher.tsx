"use client";

// ============================================================================
// -rbauer- The visible language picker. Rendered once, in app/layout.tsx, positioned
// fixed in the top-right corner -- so it's visible on every single page of
// the app, including before the user logs in.
// ============================================================================

import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { SUPPORTED_LOCALES, type Locale } from "@/app/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="fixed top-3 right-3 z-50">
      {/*
        -rbauer-
        A real, visible <label> here would clutter the tiny top-right
        corner of the screen. `sr-only` (Tailwind) keeps it in the page --
        so screen readers still announce "Language" when this control gets
        focus -- while making it visually invisible.
      */}
      <label htmlFor="language-switcher" className="sr-only">
        {t("languageSwitcher.label")}
      </label>

      {/*
        -rbauer-
        We use a plain HTML <select> instead of building a custom dropdown
        component. A native <select> already works correctly with the
        keyboard (Tab to focus it, arrow keys or typing a letter to change
        the value) and with screen readers, for free. A hand-built dropdown
        would need extra code to reach the same level of accessibility.
      */}
      <select
        id="language-switcher"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="select select-sm select-bordered bg-black/40 text-white backdrop-blur"
      >
        {/*
          -rbauer-
          One <option> per supported language, generated from the same
          SUPPORTED_LOCALES list defined in translations/index.ts. This is
          why adding a language never requires touching this file: as soon
          as a new entry exists in that list, it shows up here automatically.
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
