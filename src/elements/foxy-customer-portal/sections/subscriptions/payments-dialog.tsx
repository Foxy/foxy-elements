import { useMemo } from "react";
import { FormattedDate, FormattedNumber, useIntl } from "react-intl";
import { Button } from "@foxy.io/design-system/button";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { SummaryTable } from "@foxy.io/design-system/summary-table";
import { useCollection } from "@/lib/customer-api";
import { messages } from "../../messages";
import { PortalDialog } from "../../portal-dialog";
import type { SubscriptionResource } from "./card";

type Payment = {
  id: number;
  transaction_date: string;
  total_order: number;
  currency_code: string;
  status: string;
  _links: { "fx:receipt"?: { href: string } };
  _embedded?: { "fx:items"?: { name: string; quantity: number }[] };
};

type Props = {
  subscription: SubscriptionResource;
  open: boolean;
  onClose: () => void;
};

export function PaymentsDialog({ subscription, open, onClose }: Props) {
  const intl = useIntl();
  const link = subscription._links["fx:transactions"];

  // Items are zoomed per transaction, not read off the subscription, so a
  // subscription that was later modified still shows what was actually
  // charged at the time of each payment.
  const query = useMemo(() => ({ zoom: "items", limit: 10 }), []);

  const { items, isLoading, totalItems, offset, limit, loadNext, loadPrev } =
    useCollection<Payment>(link as never, query);

  return (
    <PortalDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={intl.formatMessage(messages.paymentsHeading)}
    >
      {isLoading ? <Skeleton /> : null}

      {!isLoading && items.length === 0 ? (
        <p>{intl.formatMessage(messages.paymentsEmpty)}</p>
      ) : null}

      <SummaryTable.Root>
        {items.map((payment) => (
          <SummaryTable.Entry
            key={payment.id}
            title={`#${payment.id}`}
            subtitle={payment.status}
            value={
              <FormattedNumber
                value={payment.total_order}
                style="currency"
                currency={payment.currency_code}
              />
            }
            description={[
              <FormattedDate
                key="date"
                value={payment.transaction_date}
                dateStyle="medium"
              />,
              (payment._embedded?.["fx:items"] ?? [])
                .map((item) => `${item.name} ×${item.quantity}`)
                .join(", "),
            ]}
            action={
              payment._links["fx:receipt"] ? (
                <a href={payment._links["fx:receipt"].href}>
                  {intl.formatMessage(messages.paymentsReceipt)}
                </a>
              ) : null
            }
          />
        ))}
      </SummaryTable.Root>

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
    </PortalDialog>
  );
}
