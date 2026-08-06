// ============================================================================
// -rbauer- Helper for form error state (login, register, ...).
//
// The bug this file fixes: if you call t("some.key") once when an error
// happens and store the RESULT (already-translated text) in React state,
// that text is frozen. If the user changes language afterwards, nothing
// tells React to re-run t() on it, so the error stays in the old language
// until the user re-submits the form and a fresh t() call overwrites it.
//
// The fix: never store translated text in state. Store a FieldError
// (a translation KEY, plus optional values for placeholders like
// "{{field}}") and only call t() at render time, via errorText() below.
// Since render happens again automatically whenever the language changes
// (changing the language updates React state in LanguageProvider, which
// re-renders every component reading it), the displayed text is always
// re-computed in the current language -- no stale text possible.
// ============================================================================

// -rbauer- Most errors are ones we authored ourselves: a dictionary key (+ optional
// values to fill in placeholders). A few errors are raw text sent by the
// backend (e.g. a validation message we don't control) -- those can't be
// translated on the frontend, so we allow storing a plain string for them
// too, and just display it as-is.
export type FieldError = { key: string; vars?: Record<string, string | number> } | string;

// -rbauer- Converts a FieldError into the actual text to show on screen, using
// whatever `t` function is currently active (i.e. bound to the current
// language). Called from JSX, so it re-runs on every render.
export function errorText(
  error: FieldError | undefined,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string | undefined {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  return t(error.key, error.vars);
}
