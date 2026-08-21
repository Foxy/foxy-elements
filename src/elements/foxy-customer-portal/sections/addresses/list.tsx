import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../../messages";
import { AddressCard, type AddressResource } from "./card";
import { AddressEditDialog } from "./edit-dialog";

type CustomerWithLinks = {
  _links: Record<string, FollowableLink<never> & { href: string }>;
};

type Props = { customer: CustomerWithLinks };

export function AddressesSection({ customer }: Props) {
  const intl = useIntl();
  const [editing, setEditing] = useState<AddressResource | null>(null);

  const link = customer._links["fx:customer_addresses"];
  const query = useMemo(() => ({ limit: 10 }), []);

  const {
    items,
    error,
    isLoading,
    isUnauthenticated,
    totalItems,
    offset,
    limit,
    loadNext,
    loadPrev,
    refresh,
  } = useCollection<AddressResource>(link as never, query);

  if (isLoading || isUnauthenticated) {
    return (
      <section>
        <h2>{intl.formatMessage(messages.addressesHeading)}</h2>
        <Skeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>{intl.formatMessage(messages.addressesHeading)}</h2>
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      </section>
    );
  }

  // No addresses at all -- nothing to show, and no create button to offer
  // instead (the store's `addresses:actions:create` control is hidden by
  // default -- see the plan's Global Constraints).
  if (items.length === 0) return null;

  return (
    <section>
      <h2>{intl.formatMessage(messages.addressesHeading)}</h2>

      {items.map((address) => (
        <AddressCard
          key={address._links.self.href}
          address={address}
          onEdit={() => setEditing(address)}
        />
      ))}

      {/* Mounted only while editing, matching ManageDialog/OrderDetailDialog:
          the dialog seeds its form state from `address` once, on mount, so
          reusing one instance across different addresses would leak the
          previous address's fields into the next. */}
      {editing ? (
        <AddressEditDialog
          key={editing._links.self.href}
          address={editing}
          open
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      ) : null}

      {totalItems > limit ? (
        <div>
          <Button type="button" onClick={loadPrev} disabled={offset === 0}>
            {"<"}
          </Button>
          <span>
            {offset + 1}&ndash;{Math.min(offset + limit, totalItems)} /{" "}
            {totalItems}
          </span>
          <Button
            type="button"
            onClick={loadNext}
            disabled={offset + limit >= totalItems}
          >
            {">"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
