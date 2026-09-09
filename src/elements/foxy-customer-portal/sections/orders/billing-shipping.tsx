import { useIntl } from "react-intl";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../../messages";
import {
  Panel,
  PanelLabel,
  PanelNote,
  PanelRow,
  PanelValue,
  SectionHeading,
} from "../../detail-page-layout";
import { formatAddressLines, type AddressLike } from "../addresses/card";
import { formatCardLabel } from "../payment-method";
import type { OrderResource } from "./row";

/**
 * One `fx:shipment`, narrowed to the fields the customer API exposes and this
 * panel renders. The API's own allow-list is deliberately small -- the
 * customer's own destination, the service they chose and that shipment's
 * totals -- and carries no carrier account or rate internals.
 */
export type ShipmentResource = AddressLike & {
  shipping_service_description: string;
  /** What shipping to THIS destination cost, not the order's combined total. */
  total_shipping: number;
  total_price: number;
};

/**
 * One `fx:payment`. `type` is an internal enum, so it is never rendered
 * directly -- see `paymentLabel`.
 *
 * The card fields are null on every non-card payment, which is why they are
 * typed nullable rather than as the plain strings a card payment carries.
 */
export type PaymentResource = {
  type: string;
  purchase_order: string;
  cc_number_masked: string;
  cc_type: string | null;
  cc_exp_month: string | null;
  cc_exp_year: string | null;
  amount: number;
};

type FollowableCollection = FollowableLink<{
  total_items?: number;
  _embedded?: Record<string, unknown[]>;
}> & { href: string };

type Props = { order: OrderResource };

function collectionLink(
  order: OrderResource,
  curie: string,
): FollowableCollection | null {
  const link = order._links[curie] as FollowableCollection | undefined;
  // `href` alone is not enough: the panel calls `get()`, which only exists
  // once the SDK has enriched the link. An order handed in from a hand-built
  // fixture (or a response predating these rels) has neither.
  return link && typeof link.get === "function" ? link : null;
}

/**
 * An order's shipments. Called by this panel and, for its per-destination
 * shipping lines, by the summary rail in `order-page.tsx`.
 *
 * Two callers, one request: `RequestCache.read` returns the existing entry for
 * a (href, query) pair and only loads once, so both hooks share the same
 * fetch. Exported rather than lifted into a prop so there is a single
 * definition of how to reach an order's shipments.
 */
export function useOrderShipments(order: OrderResource) {
  return useCollection<ShipmentResource>(
    collectionLink(order, "fx:shipments"),
  );
}

export function OrderBillingShipping({ order }: Props) {
  const intl = useIntl();

  const shipmentsLink = collectionLink(order, "fx:shipments");
  const paymentsLink = collectionLink(order, "fx:payments");

  const shipments = useOrderShipments(order);
  const payments = useCollection<PaymentResource>(paymentsLink);

  const isLoading =
    (shipmentsLink !== null && shipments.isLoading) ||
    (paymentsLink !== null && payments.isLoading);

  /**
   * What a customer can be told about how they paid. A card shows as brand
   * plus last four; a purchase order shows its number.
   *
   * Everything else returns `null` and renders no row. `type` is an internal
   * enum -- `amazon_mws`, `ogone`, `hosted` -- and none of those are names a
   * customer would recognise, so showing nothing beats leaking the enum or
   * inventing a display name for a gateway. Widen this deliberately, with a
   * translated message per type, if those payments need labelling.
   */
  function paymentLabel(payment: PaymentResource): string | null {
    if (payment.cc_number_masked) {
      return formatCardLabel({
        cc_type: payment.cc_type ?? "",
        cc_number_masked: payment.cc_number_masked,
        cc_exp_month: payment.cc_exp_month ?? "",
        cc_exp_year: payment.cc_exp_year ?? "",
      });
    }

    if (payment.purchase_order) {
      return intl.formatMessage(messages.orderPurchaseOrder, {
        number: payment.purchase_order,
      });
    }

    return null;
  }

  const paymentRows = payments.items
    .map((payment) => ({ payment, label: paymentLabel(payment) }))
    .filter((row): row is { payment: PaymentResource; label: string } =>
      row.label !== null,
    );

  if (isLoading) return <Skeleton />;

  // Nothing resolved -- an order with no shipments and no labellable payment,
  // or both reads failed. The section renders nothing rather than an empty
  // frame or a destructive alert: the page's core (its items and totals) does
  // not come from here, so a failed supplementary read must not present the
  // whole order as broken. Whatever did resolve still renders, which is why
  // this is one combined check rather than a per-collection error branch.
  if (paymentRows.length === 0 && shipments.items.length === 0) return null;

  return (
    <section>
      <SectionHeading>
        {intl.formatMessage(messages.orderBillingHeading)}
      </SectionHeading>

      <Panel>
        {paymentRows.map(({ payment, label }, index) => {
          const expires =
            payment.cc_exp_month && payment.cc_exp_year
              ? intl.formatMessage(messages.paymentMethodsExpires, {
                  month: payment.cc_exp_month,
                  year: payment.cc_exp_year,
                })
              : null;

          return (
            <PanelRow key={`payment-${index}`}>
              <div>
                <PanelLabel>
                  {intl.formatMessage(messages.orderPaymentMethodLabel)}
                </PanelLabel>
                <PanelNote>{label}</PanelNote>
                {expires ? <PanelNote>{expires}</PanelNote> : null}
              </div>

              <PanelValue>
                {intl.formatNumber(payment.amount, {
                  style: "currency",
                  currency: order.currency_code,
                })}
              </PanelValue>
            </PanelRow>
          );
        })}

        {shipments.items.map((shipment, index) => {
          const lines = formatAddressLines(shipment, intl.locale);

          return (
            <PanelRow key={`shipment-${index}`}>
              <div>
                {/* The shipment's own name: `Default Shipping Address` on an
                    ordinary order, and the `shipto` value on each leg of a
                    multiship one -- which is the only thing distinguishing
                    those rows from each other. */}
                <PanelLabel>{shipment.address_name}</PanelLabel>
                <PanelNote>{lines.name}</PanelNote>
                <PanelNote>{lines.line1}</PanelNote>
                <PanelNote>{lines.cityStateZip}</PanelNote>
                <PanelNote>{lines.country}</PanelNote>
              </div>

              {/* The service only. What it cost is a summary figure, and the
                  rail lists one line per destination -- see `order-page.tsx`.
                  Printing it here as well would show the same number twice on
                  one page. */}
              {shipment.shipping_service_description ? (
                <PanelValue>
                  {shipment.shipping_service_description}
                </PanelValue>
              ) : null}
            </PanelRow>
          );
        })}
      </Panel>
    </section>
  );
}
