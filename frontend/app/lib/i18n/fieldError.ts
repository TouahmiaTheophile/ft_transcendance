export type FieldError = { key: string; vars?: Record<string, string | number> } | string;

export function errorText(
  error: FieldError | undefined,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string | undefined {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  return t(error.key, error.vars);
}
