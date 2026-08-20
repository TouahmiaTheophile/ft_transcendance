import en from "./en";
import fr from "./fr";
import es from "./es";
import de from "./de";
import testAnglais from "./testAnglais";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "test_anglais", label: "X_ Test (EN)" },
] as const;

export type Locale = "en" | "fr" | "es" | "de" | "test_anglais";

export type Dictionary = typeof en;

export const translations: Record<Locale, Dictionary> = {
  en,
  fr,
  es,
  de,
  test_anglais: testAnglais,
};
