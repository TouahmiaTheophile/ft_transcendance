"use client";

// ============================================================================
// -rbauer- This file holds the CURRENT LANGUAGE as shared, global state.
//
// We use React's Context API for this: it's the standard way to let any
// component in the app read (and change) one shared value, without having
// to manually pass it down as a prop through every single component in
// between (that's called "prop drilling", and it gets messy fast).
//
// How the pieces fit together:
//   - `LanguageContext`  -> the "pipe" that carries the value around.
//   - `LanguageProvider` -> the component that owns the value and feeds it
//                           into the pipe. We wrap the whole app in it once,
//                           in app/layout.tsx.
//   - `useLanguage()`    -> the hook every other component calls to read
//                           from the pipe.
// ============================================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SUPPORTED_LOCALES, type Locale } from "./translations";

// -rbauer- The key we use to remember the chosen language in the browser's
// localStorage, so it's still selected the next time the user comes back.
const STORAGE_KEY = "ft_locale";

// -rbauer- What language do we show before we know the user's real preference?
const DEFAULT_LOCALE: Locale = "en";

// -rbauer- The shape of the value that flows through the Context: the current
// language, plus a function to change it.
type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

// -rbauer- Create the Context "pipe". The starting value (`null`) is never actually
// used by the app -- it only shows up if a component tries to read the
// Context without being wrapped in <LanguageProvider>, which is a bug we
// want to catch (see `useLanguage` below).
const LanguageContext = createContext<LanguageContextValue | null>(null);

// -rbauer- A small helper that checks: "is this random string actually one of our
// supported language codes?". We need this because both `localStorage` and
// the browser's `navigator.language` give us back a plain `string`, which
// could contain literally anything (a user could have edited localStorage
// by hand, for example).
function isSupportedLocale(value: string | null): value is Locale {
  return SUPPORTED_LOCALES.some((entry) => entry.code === value);
}

// -rbauer- The component that owns the "current language" state and makes it
// available to the rest of the app. Used once, in app/layout.tsx, wrapping
// everything else: <LanguageProvider>{children}</LanguageProvider>
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // --------------------------------------------------------------------
  // -rbauer- Why this runs in a useEffect instead of directly in useState(...):
  //
  // Next.js renders this component once on the SERVER (to produce the
  // first HTML sent to the browser), and then again on the CLIENT (to
  // attach interactivity -- this step is called "hydration"). The server
  // has no access to `localStorage` or `navigator`, so it always renders
  // with DEFAULT_LOCALE ("en").
  //
  // If we read localStorage directly while computing the initial state,
  // the very first client render could immediately show a different
  // language than what the server sent -- React would then complain
  // about a "hydration mismatch" (client and server output don't match).
  //
  // A useEffect only runs AFTER the page has already been displayed and
  // matched the server's version. So: first render = "en" (matches the
  // server, no error), then this effect runs, reads the real preference,
  // and triggers a second render with the correct language. In practice
  // that means: for a split second the page shows "en", then switches to
  // the saved language. That tiny flash is the accepted trade-off.
  // --------------------------------------------------------------------
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (isSupportedLocale(stored)) {
      // -rbauer- The user already picked a language on a previous visit.
      setLocaleState(stored);
      return;
    }

    // -rbauer- No saved preference yet: try to match the browser's own language
    // setting. `navigator.language` looks like "fr-FR" or "en-US", so we
    // only keep the first 2 letters ("fr", "en") to compare it against
    // our locale codes.
    const browserLocale = window.navigator.language.slice(0, 2);
    if (isSupportedLocale(browserLocale)) {
      setLocaleState(browserLocale);
    }
    // -rbauer- Otherwise we just keep DEFAULT_LOCALE ("en").
  }, []); // -rbauer- empty array = run this only once, right after the first render.

  // -rbauer- Every time the language changes, also update the <html lang="..."> HTML
  // attribute. Screen readers and browser translation tools use this
  // attribute to know what language the page is in -- it's an accessibility
  // detail, not just cosmetic.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // -rbauer- The function exposed to the rest of the app to actually change the
  // language: updates the React state (which re-renders everything using
  // `t()`) AND saves the choice for next time.
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

// -rbauer- The hook every component calls to read the current language / change it:
//   const { locale, setLocale } = useLanguage();
//
// (In practice, most components use the `useTranslation()` hook instead --
// see ./useTranslation.ts -- which calls this one internally and also gives
// you the `t()` function. This hook is the low-level building block.)
export function useLanguage() {
  const value = useContext(LanguageContext);

  // -rbauer- If `value` is null, it means this component isn't rendered inside a
  // <LanguageProvider>. That's always a mistake somewhere in the app, so we
  // fail loudly and immediately instead of silently returning broken data.
  if (!value) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return value;
}
