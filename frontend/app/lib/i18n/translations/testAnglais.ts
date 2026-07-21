import en from "./en";
import type { Dictionary } from "./index";

// Pseudo-locale for QA (a "pseudo-localization" trick): every English string
// is prefixed with "X_". If any visible text in the app does NOT start with
// "X_" while this locale is active, that text isn't going through t() -- it's
// a hardcoded string that was missed during the i18n pass. Generated from
// `en` instead of hand-written so it can never drift out of sync with it.
function prefixAll<T>(node: T, prefix: string): T {
  if (typeof node === "string") {
    return (prefix + node) as unknown as T;
  }

  const out: any = {};
  for (const key of Object.keys(node as Record<string, unknown>)) {
    out[key] = prefixAll((node as any)[key], prefix);
  }
  return out as T;
}

const testAnglais: Dictionary = prefixAll(en, "X_");

export default testAnglais;
