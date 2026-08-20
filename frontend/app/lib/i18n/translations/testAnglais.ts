import en from "./en";
import type { Dictionary } from "./index";

const PREFIX = "X_";

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

const testAnglais: Dictionary = prefixAllStrings(en, PREFIX);

export default testAnglais;
