import { useMemo } from "react";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import type { OrderResource } from "./row";

type CollectionPage = {
  total_items?: number;
  _embedded?: Record<string, unknown[]>;
};

// Deliberately NOT the same allow-list as orders/list.tsx's own
// `ORDER_TYPES_FILTER`: that list excludes `subscription_renewal` because the
// list view already shows renewals on the subscription's own page. That
// reasoning doesn't apply here -- this hook resolves one specific transaction
// the customer was just told about via a link (e.g. the subscription card's
// "Last payment -> View"), and that transaction may legitimately be a
// renewal (the steady state for any subscription that has renewed at least
// once). Excluding it here would make a cold resolve (page reload, or
// Back/Forward with `url-sync`) of that link fail for most real
// subscriptions, even though the in-session navigation (which carries the
// resource directly) always works.
const ORDER_TYPES_FILTER =
  "type:in=transaction,subscription_modification,subscription_cancellation,subscription_renewal";

/**
 * Resolves a single order by id when navigation didn't already carry it in
 * memory (a cold deep link, or a browser Back/Forward landing here).
 *
 * KNOWN LIMITATION: fetches the first 100 matching transactions (no `id`
 * filter) and scans them client-side for a match, rather than filtering
 * server-side by id -- a live-store check of whether `filters: ["id=<value>"]`
 * is honoured by this API was not possible in the implementing environment
 * (no store credentials available). A deep link to an order outside the
 * customer's first 100 (by the collection's default order) will not resolve.
 * See subscriptions/use-subscription-by-id.ts for the identical trade-off
 * applied to that resource, and this plan's Task 4 ledger entry for the
 * reasoning.
 */
export function useOrderById(
  link: FollowableLink<CollectionPage> | null,
  id: string,
) {
  const query = useMemo(
    () => ({ filters: [ORDER_TYPES_FILTER], zoom: "items:item_options", limit: 100 }),
    [],
  );

  const { items, error, isLoading, isUnauthenticated } =
    useCollection<OrderResource>(link, query);

  const order = items.find((item) => String(item.id) === id) ?? null;

  return { order, error, isLoading, isUnauthenticated };
}
