import type { RegionType } from "@foxy.io/sdk/checkout";
import type { FollowableLink } from "@/lib/customer-api";

/**
 * The store's country and region lists, as `/property_helpers/countries` and
 * `/property_helpers/regions` return them through `/s/customer`.
 *
 * The v1 property-helper shape: a `message` naming what was resolved, and a
 * `values` map. Only a few of these fields matter to the portal --
 * `alternate_values`, `boost` and `active` are carried by the resource for
 * other consumers and typed here only so the shape is honest about what
 * arrives.
 *
 * See FX-366 for the full design and FX-367 for the endpoint contract.
 */
export type CountryEntry = {
  /** The country's name, in English. Localized names come from `Intl`. */
  default?: string;
  cc2?: string;
  cc3?: string;
  alternate_values?: string[];
  boost?: number;
  has_regions?: boolean;
  regions_required?: boolean;
  /** "state" | "province" | "county" | "canton" | "prefecture". */
  regions_type?: RegionType | null;
  active?: boolean;
};

export type RegionEntry = {
  /** The region's name, in English. Localized names come from the SDK. */
  default?: string;
  code?: string;
  alternate_values?: string[];
  boost?: number;
  active?: boolean;
};

export type CountryOptions = { message?: string; values?: Record<string, CountryEntry> };
export type RegionOptions = { message?: string; values?: Record<string, RegionEntry> };

export type CountryOptionsLink = FollowableLink<CountryOptions>;
export type RegionOptionsLink = FollowableLink<RegionOptions>;

/** Which list a given address is governed by. */
export type AddressType = "billing" | "shipping";

/**
 * The `address_type` to ask for.
 *
 * Billing and shipping addresses are always separate records -- a customer
 * has at least two, one of each -- so an address has exactly one type and
 * there is no intersection to compute.
 *
 * An address flagged neither is **inferred as shipping** by Foxy, so shipping
 * rules govern it. Treating the unflagged case as unconstrained would offer
 * countries the store cannot ship to.
 */
export function addressTypeFor(address: {
  is_default_billing?: boolean;
  is_default_shipping?: boolean;
}): AddressType {
  return address.is_default_billing ? "billing" : "shipping";
}

/**
 * The codes from a property-helper payload, in the order the API returned
 * them.
 *
 * Exists because the SDK's `toCountryOptions` / `toRegionOptions` take an
 * **array** and return `[]` for anything else -- handing either the `values`
 * map directly yields an empty dropdown with no error and no throw. Going
 * through this function is what makes that mistake impossible to make
 * silently.
 */
export function codesFrom(values: Record<string, unknown> | undefined): string[] {
  if (!values || typeof values !== "object") return [];
  return Object.keys(values).filter((code) => code.trim() !== "");
}

/**
 * The codes to offer, with `saved` guaranteed to appear.
 *
 * A store can narrow its countries after a customer saved an address, and the
 * saved value must survive that: dropping it would mean editing an unrelated
 * field silently rewrote the customer's country. So an out-of-list value is
 * appended rather than discarded, and the customer keeps it unless they
 * choose otherwise.
 *
 * Returns `[]` when there is nothing to offer at all, which is the caller's
 * signal to fall back to a free-text control.
 */
export function withSavedCode(codes: string[], saved: string | null | undefined): string[] {
  const value = saved?.trim() ?? "";
  if (codes.length === 0) return [];
  if (value === "" || codes.includes(value)) return codes;
  return [...codes, value];
}
