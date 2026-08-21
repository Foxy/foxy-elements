import { useMemo } from "react";
import { FormattedDate, FormattedNumber, useIntl } from "react-intl";
import { Button } from "@foxy.io/design-system/button";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { SummaryTable } from "@foxy.io/design-system/summary-table";
import { useCollection } from "@/lib/customer-api";
import { toCalendarDate } from "../../calendar-date";
import { messages } from "../../messages";
import { PortalDialog } from "../../portal-dialog";
import { getTransactionStatusMessage } from "../../transaction-status";
import type { SubscriptionResource } from "./card";

type Payment = {
  id: number;
  transaction_date: string;
  total_order: number;
  currency_code: string;
  // Not narrowed to the SDK's status union: this value comes straight off
  // the wire, and `getTransactionStatusMessage` is what stays honest about
  // that by falling back to the raw string instead of assuming the union is
  // exhaustive.
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
        {items.map((payment) => {
          const statusMessage = getTransactionStatusMessage(payment.status);
          // The store's calendar day, not the viewer's -- see `calendar-date.ts`.
          const transactionDate = toCalendarDate(payment.transaction_date);

          return (
            <SummaryTable.Entry
              key={payment.id}
              title={`#${payment.id}`}
              // A status this build doesn't recognize falls back to the raw
              // API value rather than a cheerful default -- claiming
              // "Completed" for an unknown state would be a worse lie than an
              // unfamiliar word.
              subtitle={
                statusMessage
                  ? intl.formatMessage(statusMessage)
                  : payment.status
              }
              value={
                <FormattedNumber
                  value={payment.total_order}
                  style="currency"
                  currency={payment.currency_code}
                />
              }
              description={[
                transactionDate ? (
                  <FormattedDate
                    key="date"
                    value={transactionDate}
                    dateStyle="medium"
                  />
                ) : null,
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
          );
        })}
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
