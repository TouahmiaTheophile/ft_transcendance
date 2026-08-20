"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SUPPORTED_LOCALES, type Locale } from "./translations";

const STORAGE_KEY = "ft_locale";

const DEFAULT_LOCALE: Locale = "en";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isSupportedLocale(value: string | null): value is Locale {
  return SUPPORTED_LOCALES.some((entry) => entry.code === value);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
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

export function useLanguage() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return value;
}
