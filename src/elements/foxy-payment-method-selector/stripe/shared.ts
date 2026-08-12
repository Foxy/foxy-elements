import type { StripeElementLocale } from "@stripe/stripe-js";

const STRIPE_SUPPORTED_LOCALES: ReadonlySet<StripeElementLocale> = new Set([
  "ar",
  "bg",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "en-GB",
  "es",
  "es-419",
  "et",
  "fi",
  "fil",
  "fr",
  "fr-CA",
  "hr",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "lt",
  "lv",
  "ms",
  "mt",
  "nb",
  "nl",
  "pl",
  "pt",
  "pt-BR",
  "ro",
  "ru",
  "sk",
  "sl",
  "sv",
  "th",
  "tr",
  "vi",
  "zh",
  "zh-HK",
  "zh-TW",
]);

function isStripeLocale(locale: string): locale is StripeElementLocale {
  return STRIPE_SUPPORTED_LOCALES.has(locale as StripeElementLocale);
}

export function resolveStripeLocale(
  locale: string | undefined,
): StripeElementLocale {
  if (!locale) return "en";

  const trimmed = locale.trim();
  if (!trimmed) return "en";

  const hyphenated = trimmed.replace(/_/g, "-");
  const parts = hyphenated.split("-").filter(Boolean);
  const language = parts[0]?.toLowerCase();
  const region = parts[1]?.toUpperCase();
  const normalized = language && region ? `${language}-${region}` : language;

  const candidates = [trimmed, hyphenated, normalized, language]
    .filter((candidate): candidate is string => Boolean(candidate))
    .flatMap((candidate) => [candidate, candidate.toLowerCase()]);

  for (const candidate of candidates) {
    if (isStripeLocale(candidate)) return candidate;
  }

  return "en";
}

/**
 * Digits after the decimal point in a currency's smallest unit, which is the
 * exponent Stripe amounts are expressed in (2 for USD, 0 for JPY, 3 for KWD).
 *
 * Deliberately not the checkout JSON's `format.maximum_fraction_digits`: that
 * is a display setting (2, or 0 when the store hides decimals) and says nothing
 * about the currency. The backend converts with the locale's `frac_digits`, and
 * an amount that disagrees with the PaymentIntent's cannot be confirmed.
 *
 * @returns undefined for a currency code Intl does not recognize
 */
export function getCurrencyMinorUnitExponent(
  currencyCode: string,
): number | undefined {
  const normalized = currencyCode.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) return undefined;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalized,
    }).resolvedOptions().maximumFractionDigits;
  } catch {
    return undefined;
  }
}

export function resolveStripePublishableKey(
  explicitKey: string | undefined,
): string | undefined {
  const fromOption = explicitKey?.trim();
  if (fromOption) return fromOption;

  const fromEnvPrimary = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim();
  if (fromEnvPrimary) return fromEnvPrimary;

  const fromEnvDemo = import.meta.env.VITE_STRIPE_DEMO_PUBLISHABLE_KEY?.trim();
  if (fromEnvDemo) return fromEnvDemo;

  return undefined;
}
