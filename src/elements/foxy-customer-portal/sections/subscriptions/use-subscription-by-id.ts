import { useMemo } from "react";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import type { SubscriptionResource } from "./card";

type CollectionPage = {
  total_items?: number;
  _embedded?: Record<string, unknown[]>;
};

/** Matches `subscription-page.tsx`'s and `list.tsx`'s own derivation. */
function subscriptionId(subscription: SubscriptionResource): string {
  return (
    subscription._links.self.href.replace(/\/+$/, "").split("/").pop() ?? ""
  );
}

/**
 * Resolves a single subscription by id when navigation didn't already carry
 * it in memory (a cold deep link, or a browser Back/Forward landing here).
 *
 * KNOWN LIMITATION: fetches the collection's first 100 items (no id filter)
 * and scans them client-side, rather than filtering server-side by id. This
 * is a deliberate fallback, not an oversight -- see this plan's Task 4
 * header and the SDD ledger entry it produced. A live-store check of
 * whether `filters: ["id=<value>"]` is honoured by this API was not
 * possible in the implementing environment (no store credentials
 * available); doing that check and switching to a server-side filter is
 * follow-up work, not part of this task. Until then, a deep link to a
 * subscription outside the customer's first 100 (by the collection's
 * default order) will not resolve.
 *
 * SECOND UNVERIFIED ASSUMPTION: this sends no `filters` at all, unlike
 * `list.tsx`, which always sends `is_active=true` or `is_active=false`.
 * This assumes the unfiltered `fx:subscriptions` collection includes both
 * active and inactive subscriptions by default. That default was not
 * verified against a live store either -- if it turns out to default to
 * active-only, a deep link to an inactive subscription would never resolve,
 * regardless of its position in the collection.
 */
export function useSubscriptionById(
  link: FollowableLink<CollectionPage> | null,
  id: string,
) {
  const query = useMemo(
    () => ({ zoom: "transaction_template:items", limit: 100 }),
    [],
  );

  const { items, error, isLoading, isUnauthenticated } =
    useCollection<SubscriptionResource>(link, query);

  const subscription =
    items.find((item) => subscriptionId(item) === id) ?? null;

  return { subscription, error, isLoading, isUnauthenticated };
}
