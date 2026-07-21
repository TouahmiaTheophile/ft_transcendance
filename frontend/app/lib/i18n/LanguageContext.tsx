"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { SUPPORTED_LOCALES, type Locale } from "./translations";

const STORAGE_KEY = "ft_locale";
const DEFAULT_LOCALE: Locale = "en";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isSupportedLocale(value: string | null): value is Locale {
  return SUPPORTED_LOCALES.some((l) => l.code === value);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server-rendered HTML always uses DEFAULT_LOCALE (no access to
  // localStorage/navigator there). Reading the real preference in an effect
  // -- instead of in the useState initializer -- keeps the first client
  // render identical to the server one and avoids a hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLocale(stored)) {
      setLocaleState(stored);
      return;
    }

    const browserLocale = window.navigator.language.slice(0, 2);
    if (isSupportedLocale(browserLocale)) {
      setLocaleState(browserLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return <LanguageContext.Provider value={{ locale, setLocale }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
