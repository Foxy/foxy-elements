import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { OrderBillingShipping } from "./billing-shipping";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

/** A collection page in the shape the customer API really returns. */
function page(curie: string, rows: unknown[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      total_items: rows.length,
      _embedded: { [curie]: rows },
    }),
  };
}

const failed = { ok: false, status: 500, json: async () => ({}) };

function shipment(overrides: Record<string, unknown> = {}) {
  return {
    address_name: "Default Shipping Address",
    first_name: "Ada",
    last_name: "Lovelace",
    company: "",
    address1: "12 Analytical Engine Way",
    address2: "",
    city: "London",
    region: "",
    postal_code: "SW1A 1AA",
    country: "GB",
    phone: "",
    shipping_service_id: 12,
    shipping_service_description: "Royal Mail Tracked 48",
    total_item_price: 40,
    total_tax: 0,
    total_shipping: 4,
    total_price: 44,
    ...overrides,
  };
}

function payment(overrides: Record<string, unknown> = {}) {
  return {
    type: "plastic",
    purchase_order: "",
    cc_number_masked: "xxxxxxxxxxxx4242",
    cc_type: "visa",
    cc_exp_month: "08",
    cc_exp_year: "2028",
    amount: 44,
    ...overrides,
  };
}

/**
 * An order carrying the two followable links the section reads. The SDK
 * enriches links on resources nested inside an embedded collection too (see
 * `addFollowableLinks` in the SDK's `Response.ts`), so a list-carried order
 * really does arrive with these callable.
 */
function order(
  shipments: unknown = page("fx:shipments", [shipment()]),
  payments: unknown = page("fx:payments", [payment()]),
) {
  return {
    id: 98213,
    display_id: 98213,
    transaction_date: "2023-02-11T22:45:01-0700",
    status: "captured",
    total_order: 44,
    total_item_price: "40.00",
    total_tax: "0.00",
    total_shipping: "4.00",
    currency_code: "USD",
    _links: {
      self: { href: "/o/98213" },
      "fx:shipments": { href: "/o/98213/shipments", get: async () => shipments },
      "fx:payments": { href: "/o/98213/payments", get: async () => payments },
    },
  };
}

async function render(resource: unknown) {
  screen = mountScreen(
    <OrderBillingShipping order={resource as never} />,
    {},
  );
  await flush();
  return screen;
}

describe("OrderBillingShipping", () => {
  it("shows the card that actually paid, not a default payment method", async () => {
    await render(order());
    // Brand plus the masked number's last four, formatted the same way the
    // portal's own payment-method block does it.
    expect(screen!.host.textContent).toMatch(/Visa/);
    expect(screen!.host.textContent).toMatch(/4242/);
  });

  it("shows the card's expiry", async () => {
    await render(order());
    expect(screen!.host.textContent).toMatch(/08\/2028/);
  });

  it("shows a purchase order number instead of a card for a PO payment", async () => {
    await render(
      order(
        page("fx:shipments", []),
        page("fx:payments", [
          payment({
            type: "purchase_order",
            purchase_order: "PO-4471",
            cc_number_masked: "",
            cc_type: null,
            cc_exp_month: null,
            cc_exp_year: null,
          }),
        ]),
      ),
    );

    expect(screen!.host.textContent).toMatch(/PO-4471/);
  });

  // `type` is an internal enum. "amazon_mws" and "ogone" are not names a
  // customer would recognise, so a payment this cannot label shows no label
  // rather than leaking the enum.
  it("never renders a raw payment type it has no label for", async () => {
    await render(
      order(
        page("fx:shipments", []),
        page("fx:payments", [
          payment({
            type: "amazon_mws",
            cc_number_masked: "",
            cc_type: null,
            cc_exp_month: null,
            cc_exp_year: null,
          }),
        ]),
      ),
    );

    expect(screen!.host.textContent).not.toMatch(/amazon_mws/);
  });

  it("shows the shipping address and the service chosen at checkout", async () => {
    await render(order());

    const text = screen!.host.textContent ?? "";
    expect(text).toMatch(/12 Analytical Engine Way/);
    expect(text).toMatch(/London/);
    expect(text).toMatch(/SW1A 1AA/);
    // The country code resolves to a name, the way the address cards do it.
    expect(text).toMatch(/United Kingdom/);
    expect(text).toMatch(/Royal Mail Tracked 48/);
  });

  // A multiship order carries one shipment per destination, each named by its
  // own `shipto` value.
  it("shows one row per shipment on a multiship order", async () => {
    await render(
      order(
        page("fx:shipments", [
          shipment({ address_name: "Home", city: "London" }),
          shipment({
            address_name: "Office",
            address1: "1 Cavendish Square",
            city: "Manchester",
            postal_code: "M1 2AB",
          }),
        ]),
      ),
    );

    const text = screen!.host.textContent ?? "";
    expect(text).toMatch(/Home/);
    expect(text).toMatch(/Office/);
    expect(text).toMatch(/1 Cavendish Square/);
    expect(text).toMatch(/Manchester/);
  });

  it("renders nothing when the order has neither shipments nor payments", async () => {
    await render(order(page("fx:shipments", []), page("fx:payments", [])));
    expect(screen!.host.textContent?.trim()).toBe("");
  });

  // The page's core -- items and totals -- does not depend on this section, so
  // a failed supplementary read must not present the whole order as broken.
  it("renders nothing when both reads fail", async () => {
    await render(order(failed, failed));
    expect(screen!.host.textContent?.trim()).toBe("");
  });

  it("still shows the shipment when only the payments read fails", async () => {
    await render(order(page("fx:shipments", [shipment()]), failed));
    expect(screen!.host.textContent).toMatch(/12 Analytical Engine Way/);
  });

  // An older API, or a transaction type that carries neither, links to
  // neither. The section must not fetch or crash.
  it("renders nothing when the order carries neither link", async () => {
    await render({
      id: 1,
      display_id: 1,
      currency_code: "USD",
      _links: { self: { href: "/o/1" } },
    });

    expect(screen!.host.textContent?.trim()).toBe("");
  });

  it("shows the heading once there is something to show", async () => {
    await render(order());
    expect(screen!.host.textContent).toMatch(/Billing & shipping/i);
  });

  // The panel stacks unrelated blocks -- how they paid, then each place their
  // order went. Without a rule between them a two-shipment order reads as one
  // run of grey lines.
  it("rules between its rows, but not above the first", async () => {
    await render(
      order(
        page("fx:shipments", [
          shipment({ address_name: "Home" }),
          shipment({ address_name: "Office", city: "Manchester" }),
        ]),
      ),
    );

    const panel = screen!.host.querySelector("h2")!.nextElementSibling!;
    const rows = [...panel.children];
    expect(rows).toHaveLength(3);

    const borderOf = (row: Element) =>
      getComputedStyle(row).borderTopWidth;

    expect(borderOf(rows[0])).toBe("0px");
    expect(borderOf(rows[1])).not.toBe("0px");
    expect(borderOf(rows[2])).not.toBe("0px");
  });

  // The cost moved to the summary rail, which lists one line per destination
  // instead of a single combined Shipping figure. Keeping it here too would
  // print the same number twice on one page.
  it("leaves the shipping cost to the summary rail", async () => {
    await render(
      order(
        page("fx:shipments", [shipment({ total_shipping: 7 })]),
        page("fx:payments", [payment({ amount: 44 })]),
      ),
    );

    const text = screen!.host.textContent ?? "";
    // The service still belongs here; the figure does not.
    expect(text).toMatch(/Royal Mail Tracked 48/);
    expect(text).not.toMatch(/\$7\.00/);
  });
});
