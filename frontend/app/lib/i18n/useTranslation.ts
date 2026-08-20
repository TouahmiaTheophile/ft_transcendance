"use client";

import { useLanguage } from "./LanguageContext";
import { translations } from "./translations";

function resolve(dictionary: any, path: string): string {
  const parts = path.split(".");
  let current: any = dictionary;

  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return path;
    }
    current = current[part];
  }

  return typeof current === "string" ? current : path;
}

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (fullMatch, variableName) => {
    const value = vars[variableName];
    return value === undefined ? fullMatch : String(value);
  });
}

export function useTranslation() {
  const { locale, setLocale } = useLanguage();

  const dictionary = translations[locale];

  function t(key: string, vars?: Record<string, string | number>): string {
    const rawText = resolve(dictionary, key);
    return interpolate(rawText, vars);
  }

  return { t, locale, setLocale };
}
