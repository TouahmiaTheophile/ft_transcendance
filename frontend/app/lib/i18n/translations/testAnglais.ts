// ============================================================================
// -rbauer- "test_anglais" is not a real language but a QA tool
// (pseudo-localization).
//
// It prefixes every English string with "X_". With it active, any visible text
// NOT starting with "X_" does not come from the translation system: either a
// string hardcoded in a component instead of t(), or untranslated backend text.
//
// Generated from `en` rather than written by hand, so it can never fall out of
// sync: a new key in en.ts immediately gets its "X_" version here.
// ============================================================================
import en from "./en";
import type { Dictionary } from "./index";

const PREFIX = "X_";

// -rbauer- Returns a copy of the object with every string value prefixed, at
// any depth: nested objects are walked recursively.
//
// `any` is deliberate: typing "preserves the shape you give it" precisely
// costs a lot of generic complexity for no benefit in this small function.
// The real check is the `Dictionary` annotation on the result below.
function prefixAllStrings(value: any, prefix: string): any {
  if (typeof value === "string") {
    return prefix + value;
  }

  const result: any = {};
  for (const key in value) {
    result[key] = prefixAllStrings(value[key], prefix);
  }
  return result;
}

// -rbauer- `: Dictionary` guarantees the same shape as English -- the same net
// as `satisfies Dictionary` in fr/es/de, written as an annotation because the
// value comes from a function call.
const testAnglais: Dictionary = prefixAllStrings(en, PREFIX);

export default testAnglais;
