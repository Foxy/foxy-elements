/**
 * The `type` values the Customer API actually returns.
 *
 * `@foxy.io/sdk/customer` declares `'' | 'updateinfo' |
 * 'subscription_modification' | 'subscription_renewal' |
 * 'subscription_cancellation'`. That is wrong in two ways: a plain order is
 * `'transaction'`, and `''` never occurs. Observed on a live store — a census
 * of one customer's 14 transactions returned `subscription_renewal` ×13 and
 * `transaction` ×1.
 *
 * Tracked upstream as FX-290. Keep this in sync when the SDK tarball is next
 * repacked, and delete it once the SDK ships the fix.
 *
 * Only `transaction` and `subscription_renewal` have been observed directly;
 * the other three come from the SDK's union and are unconfirmed.
 */
export const TRANSACTION_TYPES = [
  "transaction",
  "updateinfo",
  "subscription_modification",
  "subscription_renewal",
  "subscription_cancellation",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
