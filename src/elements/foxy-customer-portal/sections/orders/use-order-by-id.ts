import { useMemo } from "react";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import type { OrderResource } from "./row";

type CollectionPage = {
  total_items?: number;
  _embedded?: Record<string, unknown[]>;
};

// Same allow-list every other read of this collection uses -- see
// orders/list.tsx's own `ORDER_TYPES_FILTER` and its comment for why.
// Keeping this in sync here matters even though this hook doesn't filter by
// type for correctness (id equality alone would still find the right row) --
// it matters for the 100-item window below not being diluted by
// subscription_renewal/updateinfo rows that are never real orders.
const ORDER_TYPES_FILTER =
  "type:in=transaction,subscription_modification,subscription_cancellation";

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
    () => ({ filters: [ORDER_TYPES_FILTER], zoom: "items", limit: 100 }),
    [],
  );

  const { items, error, isLoading, isUnauthenticated } =
    useCollection<OrderResource>(link, query);

  const order = items.find((item) => String(item.id) === id) ?? null;

  return { order, error, isLoading, isUnauthenticated };
}
