import { useMemo } from "react";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import type { AddressResource } from "./card";

type CollectionPage = {
  total_items?: number;
  _embedded?: Record<string, unknown[]>;
};

function addressId(address: AddressResource): string {
  return address._links.self.href.replace(/\/+$/, "").split("/").pop() ?? "";
}

/**
 * Resolves a single address by id when navigation didn't already carry it in
 * memory. Same fallback mechanism and known limitation as
 * subscriptions/use-subscription-by-id.ts and orders/use-order-by-id.ts --
 * see those files' doc comments and this plan's Task 4 ledger entry for why
 * a live id-filter check wasn't possible in the implementing environment.
 *
 * KNOWN LIMITATION: fetches the first 100 addresses (no `id` filter) and
 * scans them client-side, rather than filtering server-side by id. A deep
 * link to an address outside the customer's first 100 will not resolve.
 */
export function useAddressById(
  link: FollowableLink<CollectionPage> | null,
  id: string,
) {
  const query = useMemo(() => ({ limit: 100 }), []);

  const { items, error, isLoading, isUnauthenticated } =
    useCollection<AddressResource>(link, query);

  const address = items.find((item) => addressId(item) === id) ?? null;

  return { address, error, isLoading, isUnauthenticated };
}
