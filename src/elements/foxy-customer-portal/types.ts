export type PortalScreen =
  "sign-in" | "access-recovery" | "sign-up" | "password-reset" | "account";

/**
 * Which of the store's two selling shapes the portal is laid out for. A store
 * that sells subscriptions leads with them; a store that mostly sells products
 * leads with its orders and shows no subscriptions section at all.
 *
 * Public: set through the element's `variant` attribute. `"subscriptions"` is
 * the default, so an unset or unrecognised attribute keeps the layout every
 * existing embed already has.
 */
export type PortalVariant = "subscriptions" | "orders";
