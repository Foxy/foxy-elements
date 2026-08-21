import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { OrderDetailDialog } from "./detail-dialog";
import type { OrderResource } from "./row";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

function order(overrides: Partial<OrderResource> = {}): OrderResource {
  return {
    id: 98213,
    display_id: 98213,
    transaction_date: "2023-02-11T22:45:01-0700",
    total_order: 47.5,
    total_item_price: "40.00",
    total_tax: "2.50",
    total_shipping: "5.00",
    currency_code: "USD",
    status: "captured",
    _links: {
      self: { href: "/s/98213" },
      "fx:receipt": { href: "https://example.test/receipt/98213" },
    },
    _embedded: {
      "fx:items": [{ name: "Coffee", quantity: 2, price: 20 }],
    },
    ...overrides,
  };
}

function render(props: Partial<Parameters<typeof OrderDetailDialog>[0]> = {}) {
  screen = mountScreen(
    <OrderDetailDialog order={order()} open onClose={() => {}} {...props} />,
    {},
  );
  return screen;
}

describe("OrderDetailDialog", () => {
  it("lists every item with its quantity and price", () => {
    render();

    expect(document.body.textContent).toMatch(/Coffee/);
    expect(document.body.textContent).toMatch(/2/);
    expect(document.body.textContent).toMatch(/\$20\.00/);
  });

  it("shows the item price, tax, shipping and order total as numbers, not raw strings", () => {
    render();

    // total_item_price/total_tax/total_shipping are decimal STRINGS on the
    // wire -- this assertion fails if they are passed to FormattedNumber
    // unconverted, which either mis-renders or throws depending on the
    // runtime's Intl implementation.
    expect(document.body.textContent).toMatch(/\$40\.00/);
    expect(document.body.textContent).toMatch(/\$2\.50/);
    expect(document.body.textContent).toMatch(/\$5\.00/);
    expect(document.body.textContent).toMatch(/\$47\.50/);
  });

  it("links to the receipt", () => {
    render();

    const receipt = [...document.querySelectorAll("a")].find((a) =>
      /receipt/i.test(a.textContent ?? ""),
    );

    expect(receipt?.href).toBe("https://example.test/receipt/98213");
  });

  it("withholds the receipt href entirely when the link is absent, not just disabling it", () => {
    render({
      order: order({ _links: { self: { href: "/s/98213" } } }),
    });

    const receipt = [...document.querySelectorAll("a")].find((a) =>
      /receipt/i.test(a.textContent ?? ""),
    );

    expect(receipt?.getAttribute("href")).toBeNull();
  });
});
