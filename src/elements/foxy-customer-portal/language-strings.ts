export const DEFAULT_LOCALE = "en-US";

/**
 * The portal blocks first paint on this request, so it needs a ceiling: a hung
 * endpoint must degrade to English rather than leave a skeleton on screen
 * forever. 3s is a placeholder until the endpoint has a real p99 (FX-372).
 */
export const DEFAULT_TIMEOUT_MS = 3000;

export type LanguageStringsOptions = {
  base: URL;
  templateSetId?: string | null;
  timeoutMs?: number;
};

export type ResolvedLanguageStrings = {
  locale: string;
  messages: Record<string, string>;
};

/**
 * The English portal. Not an error state: `defineMessages` compiles a
 * `defaultMessage` into the bundle for every key, and react-intl renders it
 * whenever `messages` has no entry, so an empty catalogue is correct English
 * rather than a broken screen.
 *
 * Built fresh per call so a caller handing `messages` to `IntlProvider`
 * cannot mutate the fallback for everyone else.
 */
function englishFallback(): ResolvedLanguageStrings {
  return { locale: DEFAULT_LOCALE, messages: {} };
}

async function read(
  base: URL,
  templateSetId: string | null | undefined,
): Promise<ResolvedLanguageStrings> {
  const url = new URL("./language_strings", base);
  // Omitted rather than sent empty: absent means "the store's default
  // template set", which the server resolves. `template_set_id=` would ask
  // for a set whose id is the empty string.
  if (templateSetId) url.searchParams.set("template_set_id", templateSetId);

  const response = await fetch(url.toString());
  if (!response.ok) return englishFallback();

  const body = (await response.json()) as Partial<{
    locale_code: string;
    values: Record<string, string>;
  }>;

  // A 200 carrying the wrong shape is treated as a miss, not as data. Handing
  // `IntlProvider` an undefined locale is worse than falling back to English.
  if (typeof body?.locale_code !== "string" || !body.values) {
    return englishFallback();
  }

  return { locale: body.locale_code, messages: body.values };
}

export async function resolveLanguageStrings({
  base,
  templateSetId,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: LanguageStringsOptions): Promise<ResolvedLanguageStrings> {
  // Raced rather than left to `AbortSignal`'s own rejection: the ceiling has
  // to hold even if the request never settles for a reason abort does not
  // cover.
  const ceiling = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), timeoutMs);
  });

  try {
    return (await Promise.race([read(base, templateSetId), ceiling])) ?? englishFallback();
  } catch {
    return englishFallback();
  }
}
