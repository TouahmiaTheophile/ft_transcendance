"use client";

// ============================================================================
// -rbauer- This file exports the `useTranslation()` hook -- the thing every component
// actually calls to display translated text:
//
//   const { t } = useTranslation();
//   <button>{t("login.submit")}</button>
//
// It's built out of two small, independent pieces:
//   - resolve()     -> given a key like "login.submit", find the matching
//                       text inside the current language's dictionary.
//   - interpolate() -> given a text with placeholders like "{{count}}",
//                       replace them with real values.
// ============================================================================

import { useLanguage } from "./LanguageContext";
import { translations } from "./translations";

// -rbauer- Looks up a "dotted path" (e.g. "login.errors.network") inside a nested
// object, one level at a time.
//
// Example: resolve(en, "login.errors.network")
//   1. path.split(".") -> ["login", "errors", "network"]
//   2. start with `current = en`
//   3. current = current["login"]          -> the `login` object
//   4. current = current["errors"]          -> the `errors` object
//   5. current = current["network"]         -> the actual string
//   6. return it
//
// If at any point the path doesn't exist (typo in the key, for example),
// we stop and return the key itself instead of crashing -- so a mistake
// shows up as visible broken-looking text ("login.mispelled") in the UI,
// which is easy to notice and fix, rather than a blank page or a JS error.
function resolve(dictionary: any, path: string): string {
  const parts = path.split(".");
  let current: any = dictionary;

  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      // -rbauer- We hit a dead end before reaching the last part of the path.
      return path;
    }
    current = current[part];
  }

  return typeof current === "string" ? current : path;
}

// -rbauer- Replaces "{{name}}" placeholders in a string with real values.
//
// Example: interpolate("{{count}}/{{max}} players", { count: 3, max: 4 })
//          -> "3/4 players"
//
// `text.replace(regex, callback)` scans the string for every match of the
// regex, and calls the callback for each one; whatever the callback
// returns takes the place of the match.
//
// The regex `/\{\{(\w+)\}\}/g` means:
//   \{\{      -> a literal "{{"
//   (\w+)     -> capture one or more "word" characters (letters/digits/_) ;
//                this captured text is the variable name, e.g. "count"
//   \}\}      -> a literal "}}"
//   g         -> find ALL matches in the string, not just the first one
function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (fullMatch, variableName) => {
    const value = vars[variableName];
    return value === undefined ? fullMatch : String(value);
  });
}

// -rbauer- The main hook. Every component that needs to display text calls this.
export function useTranslation() {
  const { locale, setLocale } = useLanguage();

  // -rbauer- The dictionary for whichever language is currently active
  // (translations.en, translations.fr, ...).
  const dictionary = translations[locale];

  // -rbauer- `key` is typed as `string` here (not restricted to a fixed list of
  // valid keys) to keep this file simple to read. The trade-off: if you
  // typo a key, TypeScript won't catch it at compile time -- but `resolve()`
  // above handles that gracefully at runtime by showing the broken key
  // instead of crashing, so it's still easy to spot while testing.
  function t(key: string, vars?: Record<string, string | number>): string {
    const rawText = resolve(dictionary, key);
    return interpolate(rawText, vars);
  }

  return { t, locale, setLocale };
}
