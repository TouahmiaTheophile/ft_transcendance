"use client";

// ============================================================================
// -rbauer- Exports `useTranslation()`, the hook every component calls to display
// translated text:
//
//   const { t } = useTranslation();
//   <button>{t("login.submit")}</button>
//
// Built from two independent pieces:
//   - resolve()     -> find the text matching a key in the current dictionary.
//   - interpolate() -> replace "{{placeholders}}" with real values.
// ============================================================================

import { useLanguage } from "./LanguageContext";
import { translations } from "./translations";

// -rbauer- Walks a dotted path ("login.errors.network") through a nested object,
// one level at a time.
//
// If the path does not exist (a typo, say), it returns the key itself instead
// of crashing: the mistake shows up as visible broken text in the UI rather
// than a blank page.
function resolve(dictionary: any, path: string): string {
  const parts = path.split(".");
  let current: any = dictionary;

  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      // -rbauer- Dead end before the last part of the path.
      return path;
    }
    current = current[part];
  }

  return typeof current === "string" ? current : path;
}

// -rbauer- Replaces "{{name}}" placeholders with real values.
//
//   interpolate("{{count}}/{{max}} players", { count: 3, max: 4 }) -> "3/4 players"
//
// The regex captures the variable name between literal "{{" and "}}", and `g`
// matches every occurrence. An unknown name is left untouched.
function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (fullMatch, variableName) => {
    const value = vars[variableName];
    return value === undefined ? fullMatch : String(value);
  });
}

// -rbauer- The main hook, called by every component that displays text.
export function useTranslation() {
  const { locale, setLocale } = useLanguage();

  // -rbauer- The dictionary of the active language (translations.en, .fr, ...).
  const dictionary = translations[locale];

  // -rbauer- `key` is a plain `string`, not a union of valid keys, to keep this
  // file simple: a typo is not caught at compile time, but resolve() makes it
  // visible at runtime instead of crashing.
  function t(key: string, vars?: Record<string, string | number>): string {
    const rawText = resolve(dictionary, key);
    return interpolate(rawText, vars);
  }

  return { t, locale, setLocale };
}
