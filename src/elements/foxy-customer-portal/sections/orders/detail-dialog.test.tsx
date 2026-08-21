import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { OrderDetailDialog } from "./detail-dialog";
import type { OrderResource } from "./row";

let screen: MountedScreen | null = null;
const capturedFormattedNumberValues: unknown[] = [];

// Mock react-intl's FormattedNumber to capture what values are passed to it
vi.mock("react-intl", async () => {
  const actual = await vi.importActual<typeof import("react-intl")>("react-intl");
  return {
    ...actual,
    FormattedNumber: (props: Record<string, unknown> & { value: number | string | bigint }) => {
      capturedFormattedNumberValues.push(props.value);
      return actual.FormattedNumber(props as never);
    },
  };
});

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
  capturedFormattedNumberValues.length = 0;
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
  it("lists every item with its name and its unit price, not a line total", () => {
    render();

    // `item.price` is the SDK-documented *unit* price (before option
    // modifiers), not a line amount -- there is no line total available,
    // since this section's `zoom=items` never fetches `fx:item_options`.
    // Folding quantity and unit price into one "N × $X each" subtitle is
    // the fix: a bare "$20.00" next to a "Total" row below would read as
    // "this line cost $20", which is wrong for a quantity of 2.
    expect(document.body.textContent).toMatch(/Coffee/);
    expect(document.body.textContent).toMatch(/2 × \$20\.00 each/);
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

  it("passes string totals as numbers to FormattedNumber, not raw strings", () => {
    // This test verifies the Number(...) conversion that the brief calls out.
    // FormattedNumber receives the three string totals converted to numbers.
    // Without this test, we'd only verify the final formatted output, which
    // Intl.NumberFormat coerces strings to numbers anyway, making the test
    // pass even if Number(...) were deleted from the implementation.
    render();

    // Verify the numeric values (from Number(...) conversion) are in the calls
    expect(capturedFormattedNumberValues).toContain(40);
    expect(capturedFormattedNumberValues).toContain(2.5);
    expect(capturedFormattedNumberValues).toContain(5);

    // Verify none of the string totals reached FormattedNumber unconverted
    expect(capturedFormattedNumberValues).not.toContain("40.00");
    expect(capturedFormattedNumberValues).not.toContain("2.50");
    expect(capturedFormattedNumberValues).not.toContain("5.00");
  });

  it("sets the order total apart from items/tax/shipping instead of listing it as a fourth running-sum line", () => {
    // total_order can legitimately differ from
    // total_item_price + total_tax + total_shipping (e.g. a coupon
    // discount, which this resource graph has no field for) -- so Total
    // must not read as "the sum of the three lines above it". Lock in that
    // it lives in its own <dl>, separate from the other three.
    render();

    const lists = [...document.querySelectorAll("dl")];
    const totalList = lists.find((dl) => /Total/.test(dl.textContent ?? ""));
    const linesList = lists.find((dl) => /Items/.test(dl.textContent ?? ""));

    expect(totalList).toBeDefined();
    expect(linesList).toBeDefined();
    expect(totalList).not.toBe(linesList);

    // The three reconcilable lines stay together, away from Total.
    expect(linesList?.textContent).toMatch(/Tax/);
    expect(linesList?.textContent).toMatch(/Shipping/);
    expect(linesList?.textContent).not.toMatch(/Total/);
  });
});
