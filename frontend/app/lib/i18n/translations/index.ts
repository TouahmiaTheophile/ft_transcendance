// ============================================================================
// -rbauer- This file is the "assembly point" of the translation system.
// It does 3 things:
//   1. Lists which languages the app supports (SUPPORTED_LOCALES).
//   2. Defines the shape every language dictionary must have (Dictionary).
//   3. Puts all the language dictionaries together in one object (translations).
// ============================================================================

import en from "./en";
import fr from "./fr";
import es from "./es";
import de from "./de";
import testAnglais from "./testAnglais";

// ----------------------------------------------------------------------------
// -rbauer- 1. The list of supported languages.
//
// `code` is the internal identifier we store (in localStorage, in state...).
// `label` is what the user actually sees in the dropdown (LanguageSwitcher.tsx).
//
// To add a language: write a new dictionary file (copy fr.ts as a template),
// import it above, and add one line here. That's it -- the switcher and the
// rest of the app pick it up automatically because they read this array
// instead of having the list hardcoded somewhere else.
// ----------------------------------------------------------------------------
export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "test_anglais", label: "X_ Test (EN)" },
] as const;

// -rbauer- `Locale` is just "the list of valid language codes, as a TypeScript type".
// We write it out explicitly (instead of deriving it automatically from
// SUPPORTED_LOCALES) because that's the version that's easiest to read: you
// can see immediately, without any mental gymnastics, which codes are valid.
//
// The trade-off: if you add a language above, you must also add its code
// here. TypeScript will remind you anyway, because the moment `translations`
// (below) doesn't have an entry for a code listed here, or has one for a
// code that ISN'T listed here, it becomes a compile error.
export type Locale = "en" | "fr" | "es" | "de" | "test_anglais";

// ----------------------------------------------------------------------------
// -rbauer- 2. What shape must EVERY language dictionary have?
//
// `typeof en` means: "the exact shape (all the keys, all nested objects) of
// the `en` object below". We don't write that shape by hand -- we just point
// at the English file and let TypeScript compute it. `en` is our single
// "source of truth": whatever keys it has, every other language must have
// too.
// ----------------------------------------------------------------------------
export type Dictionary = typeof en;

// ----------------------------------------------------------------------------
// -rbauer- 3. One object that groups every language, keyed by its code.
//
// `Record<Locale, Dictionary>` tells TypeScript: "this object must have
// exactly one property per Locale, and each property's value must match the
// Dictionary shape". If you forget a language here, or if one of the
// imported dictionaries is missing a key compared to `en`, the build fails
// with a clear error pointing at the problem -- instead of silently shipping
// a half-translated app.
// ----------------------------------------------------------------------------
export const translations: Record<Locale, Dictionary> = {
  en,
  fr,
  es,
  de,
  test_anglais: testAnglais,
};
