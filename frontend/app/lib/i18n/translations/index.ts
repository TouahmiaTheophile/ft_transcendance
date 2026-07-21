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

export type Locale = (typeof SUPPORTED_LOCALES)[number]["code"];

// Dictionary` still forces them to declare the exact same keys/variables.
export type Dictionary = typeof en;

export const translations: Record<Locale, Dictionary> = {
  en,
  fr,
  es,
  de,
  test_anglais: testAnglais,
};

// Builds a union of every dot-separated leaf path in Dictionary, e.g.
// "login.errors.network". Used to type-check every t("...") call site.
type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : DotPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = DotPaths<Dictionary>;
