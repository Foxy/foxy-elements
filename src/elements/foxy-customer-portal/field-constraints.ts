/**
 * Field limits mirror the live Foxy Customer API documentation
 * (https://api.foxy.io/rels/customer, https://api.foxy.io/rels/customer_address),
 * fetched 2026-08-24 -- not inferred from this codebase, not guessed. Do not
 * change a number here without re-checking those docs.
 */

export type FieldRule = {
  required?: boolean;
  maxLength?: number;
  email?: boolean;
};

export type FieldRules = Record<string, FieldRule>;

export const CUSTOMER_FIELD_LIMITS = {
  firstName: { maxLength: 50 },
  lastName: { maxLength: 50 },
  email: { required: true, maxLength: 100, email: true },
  taxId: { maxLength: 50 },
  // No `required` here: whether a password field is required varies by
  // form (sign-up's is deliberately optional) -- each form that needs it
  // required spreads this and overrides, rather than this being a fixed
  // default every consumer must fight.
  password: { maxLength: 50 },
} as const satisfies FieldRules;

export const ADDRESS_FIELD_LIMITS = {
  addressName: { required: true, maxLength: 100 },
  firstName: { maxLength: 50 },
  lastName: { maxLength: 50 },
  company: { maxLength: 50 },
  address1: { required: true, maxLength: 100 },
  address2: { maxLength: 100 },
  city: { maxLength: 50 },
  // Free-text fallback for a country with no known region list; the
  // Select-driven case can only ever produce a valid 2-character code, so
  // this only matters for that fallback -- see the spec §3.
  region: { maxLength: 50 },
  postalCode: { maxLength: 50 },
  phone: { maxLength: 50 },
} as const satisfies FieldRules;
