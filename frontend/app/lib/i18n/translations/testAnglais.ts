// ============================================================================
// -rbauer- "test_anglais" is not a real language -- it's a QA tool (this
// technique is called "pseudo-localization").
//
// It takes the English dictionary and adds "X_" in front of every single
// piece of text. Once that's the active language, ANY text visible in the
// app that does NOT start with "X_" is a text that isn't coming from our
// translation system -- meaning either:
//   - a string hardcoded directly in a component instead of using t(), or
//   - text coming straight from the backend (which we don't translate).
//
// It's generated automatically from `en` (instead of being typed out by
// hand like fr/es/de) so it can never go out of sync: whatever key you add
// in en.ts instantly gets an "X_" version here, with zero extra work.
// ============================================================================
import en from "./en";
import type { Dictionary } from "./index";

const PREFIX = "X_";

// -rbauer- Walks through an object and, for every string value it finds (no matter
// how deeply nested), returns a new object with that string prefixed.
// Everything that isn't a string (i.e. every nested object) is walked into
// recursively -- the function calls itself on each nested object until it
// only has strings left to prefix.
//
// We use `any` here on purpose: writing the "this function preserves
// whatever shape you give it" type precisely is possible but adds a lot of
// generic-type complexity for zero practical benefit inside this one small,
// self-contained function. The important type safety happens right after,
// on the line below the function, where we declare the *result* as
// `Dictionary` -- that's the check that actually matters.
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

// -rbauer- `: Dictionary` here is what guarantees this pseudo-language has the exact
// same shape as English -- same safety net as `satisfies Dictionary` in
// fr.ts/es.ts/de.ts, just written as a variable type annotation instead,
// since the value comes from a function call rather than being typed by hand.
const testAnglais: Dictionary = prefixAllStrings(en, PREFIX);

export default testAnglais;
