/** Domain appended when `store-domain` is a bare label such as "demo". */
const DEFAULT_STORE_SUFFIX = "foxycart.com";

/**
 * Turns a `store-domain` attribute value into the Customer API base URL.
 *
 * A value with no dot is treated as a Foxy subdomain label and gets
 * `.foxycart.com` appended. Anything containing a dot is used as-is, which is
 * what makes custom domains work.
 *
 * Returns a `URL` because that is what the SDK's `API` constructor takes.
 */
export function resolveBaseUrl(storeDomain: string): URL {
  const trimmed = storeDomain.trim();
  if (!trimmed) throw new TypeError("store-domain must not be empty.");

  const host = trimmed.includes(".")
    ? trimmed
    : `${trimmed}.${DEFAULT_STORE_SUFFIX}`;

  return new URL(`https://${host}/s/customer/`);
}
