type FullNameValues = { first_name?: string; last_name?: string };

const SUPPORTED_TOKENS = new Set(["first_name", "last_name"]);
const TOKEN_PATTERN = /\{(\w+)\}/g;

/**
 * Resolves the `full-name-template` attribute.
 *
 * Plain token substitution, deliberately not an ICU message: the template
 * comes from an HTML attribute at runtime, so it cannot be extracted into the
 * catalogue, and a malformed ICU string would throw during render.
 */
export function formatFullName(
  template: string,
  values: FullNameValues,
): string {
  const substituted = template.replace(TOKEN_PATTERN, (match, token: string) =>
    SUPPORTED_TOKENS.has(token)
      ? (values[token as keyof FullNameValues] ?? "")
      : match,
  );

  return substituted.replace(/\s+/g, " ").trim();
}
