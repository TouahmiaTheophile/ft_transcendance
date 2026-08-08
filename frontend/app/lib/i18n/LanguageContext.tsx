"use client";

// ============================================================================
// -rbauer- Holds the CURRENT LANGUAGE as shared global state, through React's
// Context API: any component can read and change it without prop drilling.
//
//   - `LanguageContext`  -> the pipe carrying the value.
//   - `LanguageProvider` -> owns the value and feeds the pipe; wraps the whole
//                           app once, in app/layout.tsx.
//   - `useLanguage()`    -> the hook other components use to read it.
// ============================================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SUPPORTED_LOCALES, type Locale } from "./translations";

// -rbauer- localStorage key remembering the chosen language between visits.
const STORAGE_KEY = "ft_locale";

// -rbauer- Shown until the user's real preference is known.
const DEFAULT_LOCALE: Locale = "en";

// -rbauer- What flows through the Context: the current language and a setter.
type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

// -rbauer- The Context itself. The `null` default is never used in practice: it
// only appears when a component reads the Context outside <LanguageProvider>,
// which `useLanguage` below turns into an explicit error.
const LanguageContext = createContext<LanguageContextValue | null>(null);

// -rbauer- Checks whether an arbitrary string is one of our language codes.
// Both localStorage and navigator.language return a plain `string` that can
// contain anything (hand-edited localStorage, for instance).
function isSupportedLocale(value: string | null): value is Locale {
  return SUPPORTED_LOCALES.some((entry) => entry.code === value);
}

// -rbauer- Owns the "current language" state and exposes it to the app. Used
// once in app/layout.tsx, wrapping everything else.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // --------------------------------------------------------------------
  // -rbauer- In a useEffect, not in useState(...), because of hydration.
  //
  // Next.js renders this on the server, which has no localStorage or
  // navigator, so the server HTML always uses DEFAULT_LOCALE. Reading the
  // stored preference during the initial state would make the first client
  // render differ from it -- a hydration mismatch.
  //
  // The effect runs after that first render matches, then triggers a second
  // one with the real language. The brief flash of "en" is the trade-off.
  // --------------------------------------------------------------------
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (isSupportedLocale(stored)) {
      // -rbauer- A language was already picked on a previous visit.
      setLocaleState(stored);
      return;
    }

    // -rbauer- No saved preference: fall back to the browser's language.
    // `navigator.language` is "fr-FR" / "en-US", so only the first 2 letters
    // are compared against our codes.
    const browserLocale = window.navigator.language.slice(0, 2);
    if (isSupportedLocale(browserLocale)) {
      setLocaleState(browserLocale);
    }
    // -rbauer- Otherwise DEFAULT_LOCALE ("en") is kept.
  }, []); // -rbauer- empty array = run once, right after the first render.

  // -rbauer- Keeps the <html lang="..."> attribute in sync: screen readers and
  // browser translation tools rely on it. Accessibility, not cosmetics.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // -rbauer- Exposed to the app to change the language: updates the state (which
  // re-renders every `t()` consumer) and saves the choice for next time.
  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

// -rbauer- The hook to read or change the current language:
//   const { locale, setLocale } = useLanguage();
//
// Most components use useTranslation() instead, which calls this one and also
// returns `t()`. This is the low-level building block.
export function useLanguage() {
  const value = useContext(LanguageContext);

  // -rbauer- A null value means the component is not inside <LanguageProvider>.
  // Always a bug, so fail loudly rather than return broken data.
  if (!value) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return value;
}
