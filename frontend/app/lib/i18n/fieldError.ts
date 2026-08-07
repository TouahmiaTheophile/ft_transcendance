// ============================================================================
// -rbauer- Helper for form error state (login, register, ...).
//
// Storing the RESULT of t() in React state freezes the text: a later language
// change does not re-run t(), so the error stays in the old language until the
// form is re-submitted.
//
// So state holds a FieldError (a translation key + optional placeholder values)
// and t() is only called at render time, via errorText(). Changing the language
// re-renders every consumer, so the text is always current.
// ============================================================================

// -rbauer- Most errors are ours: a dictionary key plus optional placeholder
// values. A few are raw backend text that has no translation key, so a plain
// string is also accepted and displayed as-is.
export type FieldError = { key: string; vars?: Record<string, string | number> } | string;

// -rbauer- Converts a FieldError into displayable text with the currently active
// `t`. Called from JSX, so it re-runs on every render.
export function errorText(
  error: FieldError | undefined,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string | undefined {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  return t(error.key, error.vars);
}
