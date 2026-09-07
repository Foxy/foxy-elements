import type { AddressResource } from "./sections/addresses/card";
import type { OrderResource } from "./sections/orders/row";
import type { SubscriptionResource } from "./sections/subscriptions/card";

export type AccountPage =
  | { type: "home" }
  | { type: "profile" }
  | { type: "password" }
  | { type: "subscription"; id: string; resource?: SubscriptionResource }
  | { type: "order"; id: string; resource?: OrderResource }
  | { type: "address"; id: string; resource?: AddressResource };

/**
 * Identifies one page for scroll bookkeeping. Includes the id, so backing out
 * of one address restores the list where that address is, not where a
 * different one was.
 */
export function accountPageKey(page: AccountPage): string {
  return "id" in page ? `${page.type}:${page.id}` : page.type;
}

const PAGE_PARAM = "fc_page";
const ID_PARAM = "fc_id";

/**
 * Degrades to `home` on anything it doesn't recognize -- an unknown
 * `fc_page` value, or a per-item type missing `fc_id` -- rather than
 * erroring, so a browser Back that lands on a URL with no portal-related
 * params at all (or one a future version no longer emits) reads exactly
 * like a fresh visit.
 */
export function parseAccountPageFromSearch(search: string): AccountPage {
  const params = new URLSearchParams(search);
  const page = params.get(PAGE_PARAM);
  const id = params.get(ID_PARAM)?.trim();

  if (page === "profile") return { type: "profile" };
  if (page === "password") return { type: "password" };
  if (page === "subscription" && id) return { type: "subscription", id };
  if (page === "order" && id) return { type: "order", id };
  if (page === "address" && id) return { type: "address", id };

  return { type: "home" };
}

/**
 * Never includes `resource` -- a URL is not the place to serialise a whole
 * fetched object, and every consumer that needs it already has it in memory
 * at the point it calls this.
 */
export function accountPageToSearchParams(page: AccountPage): URLSearchParams {
  const params = new URLSearchParams();

  switch (page.type) {
    case "home":
      return params;
    case "profile":
    case "password":
      params.set(PAGE_PARAM, page.type);
      return params;
    case "subscription":
    case "order":
    case "address":
      params.set(PAGE_PARAM, page.type);
      params.set(ID_PARAM, page.id);
      return params;
  }
}
