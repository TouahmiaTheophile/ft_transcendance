// ============================================================================
// -rbauer- Assembly point of the translation system:
//   1. The supported languages (SUPPORTED_LOCALES).
//   2. The shape every dictionary must have (Dictionary).
//   3. All dictionaries gathered in one object (translations).
// ============================================================================

import en from "./en";
import fr from "./fr";
import es from "./es";
import de from "./de";
import testAnglais from "./testAnglais";

// ----------------------------------------------------------------------------
// -rbauer- 1. The supported languages.
//
// `code` is the internal identifier (localStorage, state); `label` is what the
// dropdown shows (LanguageSwitcher.tsx).
//
// To add a language: create the dictionary file (copy fr.ts), import it above
// and add one line here. Everything reads this array, so nothing else changes.
// ----------------------------------------------------------------------------
export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "test_anglais", label: "X_ Test (EN)" },
] as const;

// -rbauer- The valid language codes as a type. Written out rather than derived
// from SUPPORTED_LOCALES because it is easier to read at a glance.
//
// Trade-off: a new language must be added here too. TypeScript enforces it --
// any mismatch with `translations` below is a compile error.
export type Locale = "en" | "fr" | "es" | "de" | "test_anglais";

// ----------------------------------------------------------------------------
// -rbauer- 2. The shape every dictionary must have.
//
// `typeof en` is the exact shape of the English file, computed by TypeScript
// instead of written by hand: `en` is the source of truth, and every other
// language must have the same keys.
// ----------------------------------------------------------------------------
export type Dictionary = typeof en;

// ----------------------------------------------------------------------------
// -rbauer- 3. Every language, keyed by its code.
//
// `Record<Locale, Dictionary>` requires exactly one entry per Locale, each
// matching the Dictionary shape. A missing language or a missing key fails the
// build instead of shipping a half-translated app.
// ----------------------------------------------------------------------------
export const translations: Record<Locale, Dictionary> = {
  en,
  fr,
  es,
  de,
  test_anglais: testAnglais,
};
