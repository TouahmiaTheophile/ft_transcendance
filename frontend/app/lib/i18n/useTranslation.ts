"use client";

import { useCallback } from "react";
import { useLanguage } from "./LanguageContext";
import { translations, type TranslationKey } from "./translations";

function resolve(dict: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);

  return typeof value === "string" ? value : path;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));
}

export function useTranslation() {
  const { locale, setLocale } = useLanguage();

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      interpolate(resolve(translations[locale], key), vars),
    [locale],
  );

  return { t, locale, setLocale };
}
