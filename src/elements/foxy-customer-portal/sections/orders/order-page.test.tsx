import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { OrderPage, OrderPageContainer } from "./order-page";

let screen: MountedScreen | null = null;

afterEach(() => {
  screen?.unmount();
  screen = null;
});

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: 98213,
    display_id: 98213,
    // A late fixed time-of-day with an explicit non-UTC offset, the shape the
    // API really sends -- see `calendar-date.ts`.
    transaction_date: "2023-02-11T22:45:01-0700",
    status: "captured",
    total_order: 20,
    total_item_price: "20.00",
    total_tax: "0.00",
    total_shipping: "0.00",
    currency_code: "USD",
    _links: { self: { href: "/o/98213" } },
    _embedded: { "fx:items": [{ name: "Widget", quantity: 2, price: 10 }] },
    ...overrides,
  };
}

/** A collection page in the shape the customer API really returns. */
function shipmentsPage(rows: unknown[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      total_items: rows.length,
      _embedded: { "fx:shipments": rows },
    }),
  };
}

function shipment(name: string, cost: number) {
  return {
    address_name: name,
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
    shipping_service_id: 1,
    shipping_service_description: "Royal Mail",
    total_item_price: 10,
    total_tax: 0,
    total_shipping: cost,
    total_price: 10 + cost,
  };
}

/** An order whose `fx:shipments` link resolves to `rows`. */
function orderWithShipments(rows: unknown[], overrides = {}) {
  return order({
    _links: {
      self: { href: "/o/98213" },
      "fx:shipments": {
        href: "/o/98213/shipments",
        get: async () => shipmentsPage(rows),
      },
    },
    ...overrides,
  });
}

function render(resource: unknown, props: Record<string, unknown> = {}) {
  screen = mountScreen(
    <OrderPage order={resource as never} onBack={vi.fn()} {...props} />,
    {},
  );
  return screen;
}

describe("OrderPage", () => {
  it("renders the order id and a Back button", () => {
    screen = mountScreen(
      <OrderPage order={order() as never} onBack={vi.fn()} />,
      {},
    );

    expect(screen.host.textContent).toMatch(/Order #98213/);
    const buttons = [...screen.host.querySelectorAll("button")];
    expect(buttons.some((b) => /^back$/i.test(b.textContent ?? ""))).toBe(
      true,
    );
  });

  it("shows the payment status", () => {
    render(order({ status: "declined" }));
    expect(screen!.host.textContent).toMatch(/declined/i);
  });

  // The store's own day, not the viewer's: formatting a `-0700` timestamp in
  // a timezone at or east of UTC rolls the displayed day forward, so the page
  // would disagree with the customer's receipt.
  it("shows the transaction date in the store's timezone", () => {
    render(order());
    expect(screen!.host.textContent).toMatch(/Feb 11, 2023/);
    expect(screen!.host.textContent).not.toMatch(/Feb 12, 2023/);
  });

  it("shows each item's image", () => {
    render(
      order({
        _embedded: {
          "fx:items": [
            { name: "Widget", quantity: 1, price: 10, image: "/w.png" },
          ],
        },
      }),
    );

    expect(screen!.host.querySelector("img")?.getAttribute("src")).toBe(
      "/w.png",
    );
  });

  it("shows the line total alongside the unit price and quantity", () => {
    render(order());
    // Two at $10.00 each, so the line reads $20.00 as well.
    expect(screen!.host.textContent).toMatch(/2 × \$10\.00/);
    expect(screen!.host.textContent).toMatch(/\$20\.00/);
  });

  it("lists an item's options, weight and code", () => {
    render(
      order({
        _embedded: {
          "fx:items": [
            {
              name: "Widget",
              quantity: 1,
              price: 10,
              code: "WID-1",
              weight: 2.5,
              _embedded: {
                "fx:item_options": [{ name: "Colour", value: "Blue" }],
              },
            },
          ],
        },
      }),
    );

    const text = screen!.host.textContent ?? "";
    expect(text).toMatch(/Colour/);
    expect(text).toMatch(/Blue/);
    expect(text).toMatch(/2\.5/);
    expect(text).toMatch(/WID-1/);
  });

  it("honours the store's hidden product options", () => {
    render(
      order({
        _embedded: {
          "fx:items": [
            {
              name: "Widget",
              quantity: 1,
              price: 10,
              _embedded: {
                "fx:item_options": [
                  { name: "Colour", value: "Blue" },
                  { name: "Internal SKU", value: "X-1" },
                ],
              },
            },
          ],
        },
      }),
      { cartDisplayConfig: { hidden_product_options: ["internal sku"] } },
    );

    const text = screen!.host.textContent ?? "";
    expect(text).toMatch(/Blue/);
    expect(text).not.toMatch(/X-1/);
  });

  // Marks the item without linking to the subscription. The API does expose
  // `fx:subscription` on an item; the SDK's customer item type has yet to
  // declare the rel, so the link is deferred rather than impossible.
  it("marks an item that carries a subscription frequency", () => {
    render(
      order({
        _embedded: {
          "fx:items": [
            {
              name: "Coffee",
              quantity: 1,
              price: 10,
              subscription_frequency: "1m",
            },
          ],
        },
      }),
    );

    expect(screen!.host.textContent).toMatch(/Monthly/i);
  });

  it("leaves an ordinary item unmarked", () => {
    render(order());
    expect(screen!.host.textContent).not.toMatch(/monthly/i);
  });

  it("summarises the totals, with the order total as its own figure", () => {
    render(
      order({
        total_item_price: "40.00",
        total_tax: "3.50",
        total_shipping: "7.00",
        // Deliberately less than the three above sum to: a coupon discount is
        // the known reason a gap appears, and the API reports each total
        // independently. The page must print this figure, not a computed sum.
        total_order: 45.5,
      }),
    );

    const text = screen!.host.textContent ?? "";
    expect(text).toMatch(/\$3\.50/);
    expect(text).toMatch(/\$7\.00/);
    expect(text).toMatch(/\$45\.50/);
    expect(text).not.toMatch(/\$50\.50/);
  });

  it("links to the receipt when the order carries one", () => {
    render(
      order({
        _links: {
          self: { href: "/o/98213" },
          "fx:receipt": { href: "https://demo.foxycart.com/receipt?id=1" },
        },
      }),
    );

    const links = [...screen!.host.querySelectorAll("a")];
    expect(
      links.some(
        (a) =>
          a.getAttribute("href") === "https://demo.foxycart.com/receipt?id=1",
      ),
    ).toBe(true);
  });

  // It used to render `<a href={undefined}>` unconditionally -- a link that
  // looked live and went nowhere.
  it("renders no receipt link at all when the order has none", () => {
    render(order());
    expect(screen!.host.querySelector("a")).toBeNull();
  });

  // 30 items would otherwise render 30 cards on one very long page. The
  // subscription page paginates its items for the same reason.
  it("shows at most ten items at a time and pages through the rest", () => {
    // Zero-padded, because the page renders a name immediately followed by
    // its quantity: an item called "Item 1" puts "Item 11 x $1.00" into
    // `textContent`, which a naive /Item 11/ matches on page one.
    const many = Array.from({ length: 12 }, (_, i) => ({
      name: `Widget-${String(i + 1).padStart(2, "0")}`,
      quantity: 1,
      price: 1,
    }));
    render(order({ _embedded: { "fx:items": many } }));

    // The heading counts every item, not just the visible page.
    expect(screen!.host.textContent).toMatch(/Items \(12\)/);

    expect(screen!.host.textContent).toMatch(/Widget-10/);
    expect(screen!.host.textContent).not.toMatch(/Widget-11/);

    const next = [...screen!.host.querySelectorAll("button")].find((button) =>
      /next/i.test(button.textContent ?? ""),
    );
    act(() => next!.click());

    expect(screen!.host.textContent).toMatch(/Widget-11/);
    expect(screen!.host.textContent).toMatch(/Widget-12/);
    expect(screen!.host.textContent).not.toMatch(/Widget-10/);
  });

  it("shows no pager when every item fits on one page", () => {
    const ten = Array.from({ length: 10 }, (_, i) => ({
      name: `Widget-${String(i + 1).padStart(2, "0")}`,
      quantity: 1,
      price: 1,
    }));
    render(order({ _embedded: { "fx:items": ten } }));

    const next = [...screen!.host.querySelectorAll("button")].find((button) =>
      /next/i.test(button.textContent ?? ""),
    );
    expect(next).toBeUndefined();
  });

  describe("multiship orders", () => {
    function multiship() {
      return order({
        _embedded: {
          "fx:items": [
            { name: "Dark Roast", quantity: 1, price: 18, shipto: "Home" },
            { name: "Office Blend", quantity: 1, price: 22, shipto: "Office" },
            { name: "Mug", quantity: 1, price: 12, shipto: "Home" },
          ],
        },
      });
    }

    it("groups the items under each destination", () => {
      render(multiship());

      const headings = [...screen!.host.querySelectorAll("h3")].map(
        (heading) => heading.textContent,
      );
      expect(headings).toEqual(["Home", "Office"]);
    });

    it("puts each item under its own destination", () => {
      render(multiship());

      // Two groups, in first-appearance order, with Home holding both of its
      // lines rather than one per heading. Read from each heading's own group
      // box: the cards are the heading's siblings inside it, so the heading's
      // `nextElementSibling` alone would only ever be the first card.
      const groups = [...screen!.host.querySelectorAll("h3")].map(
        (heading) => heading.parentElement?.textContent ?? "",
      );

      expect(groups[0]).toMatch(/Dark Roast/);
      expect(groups[0]).toMatch(/Mug/);
      expect(groups[0]).not.toMatch(/Office Blend/);
      expect(groups[1]).toMatch(/Office Blend/);
      expect(groups[1]).not.toMatch(/Dark Roast/);
    });

    // The common case. A heading above every item on a one-destination order
    // repeats what the shipping panel already says.
    it("adds no destination heading to a single-destination order", () => {
      render(
        order({
          _embedded: {
            "fx:items": [
              { name: "Dark Roast", quantity: 1, price: 18, shipto: "Home" },
              { name: "Mug", quantity: 1, price: 12, shipto: "Home" },
            ],
          },
        }),
      );

      expect(screen!.host.querySelectorAll("h3")).toHaveLength(0);
      expect(screen!.host.textContent).toMatch(/Dark Roast/);
    });

    // An unshipped line belongs to no destination, so it gets no heading --
    // naming it would invent one.
    it("renders the unshipped lines without a heading", () => {
      render(
        order({
          _embedded: {
            "fx:items": [
              { name: "Dark Roast", quantity: 1, price: 18, shipto: "Home" },
              { name: "Office Blend", quantity: 1, price: 22, shipto: "Office" },
              { name: "Gift Card PDF", quantity: 1, price: 25 },
            ],
          },
        }),
      );

      const headings = [...screen!.host.querySelectorAll("h3")].map(
        (heading) => heading.textContent,
      );
      expect(headings).toEqual(["Home", "Office"]);
      expect(screen!.host.textContent).toMatch(/Gift Card PDF/);
    });

    // Grouping must not break the pager: it groups whatever is on the current
    // page, so the ten-per-page promise and the total count both hold.
    it("still pages ten at a time, grouping only the visible page", () => {
      const many = Array.from({ length: 12 }, (_, i) => ({
        name: `Widget-${String(i + 1).padStart(2, "0")}`,
        quantity: 1,
        price: 1,
        shipto: i < 6 ? "Home" : "Office",
      }));
      render(order({ _embedded: { "fx:items": many } }));

      expect(screen!.host.textContent).toMatch(/Items \(12\)/);
      expect(screen!.host.textContent).toMatch(/Widget-10/);
      expect(screen!.host.textContent).not.toMatch(/Widget-11/);

      const next = [...screen!.host.querySelectorAll("button")].find((button) =>
        /next/i.test(button.textContent ?? ""),
      );
      act(() => next!.click());

      // Page two holds only Office lines, so only that heading remains.
      const headings = [...screen!.host.querySelectorAll("h3")].map(
        (heading) => heading.textContent,
      );
      expect(headings).toEqual(["Office"]);
      expect(screen!.host.textContent).toMatch(/Widget-11/);
    });
  });

  describe("the summary rail's shipping lines", () => {
    const flush = () =>
      act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

    it("lists one line per destination on a multiship order", async () => {
      render(
        orderWithShipments([shipment("Home", 4), shipment("Office", 8)], {
          total_shipping: "12.00",
        }),
      );
      await flush();

      const text = screen!.host.textContent ?? "";
      expect(text).toMatch(/Shipping to Home/);
      expect(text).toMatch(/Shipping to Office/);
      expect(text).toMatch(/\$4\.00/);
      expect(text).toMatch(/\$8\.00/);
    });

    // The parts replace the whole: printing both would show $12.00 beside the
    // $4.00 and $8.00 that make it up.
    it("drops the combined Shipping line once it lists the parts", async () => {
      render(
        orderWithShipments([shipment("Home", 4), shipment("Office", 8)], {
          total_shipping: "12.00",
        }),
      );
      await flush();

      const text = screen!.host.textContent ?? "";
      expect(text).not.toMatch(/Shipping\$12\.00/);
      // The order total is unaffected -- it is its own reported figure.
      expect(text).toMatch(/\$20\.00/);
    });

    it("keeps one combined Shipping line for a single destination", async () => {
      render(
        orderWithShipments([shipment("Home", 4)], { total_shipping: "4.00" }),
      );
      await flush();

      const text = screen!.host.textContent ?? "";
      expect(text).not.toMatch(/Shipping to Home/);
      expect(text).toMatch(/Shipping/);
      expect(text).toMatch(/\$4\.00/);
    });

    // The order-level figure is always present, so the rail shows it rather
    // than a gap while the shipments request is still in flight.
    it("shows the combined line while the shipments are still loading", () => {
      render(orderWithShipments([shipment("Home", 4), shipment("Office", 8)]));

      expect(screen!.host.textContent).not.toMatch(/Shipping to/);
      expect(screen!.host.textContent).toMatch(/Shipping/);
    });
  });

  it("still names the order when no items are embedded", () => {
    render(order({ _embedded: {} }));
    expect(screen!.host.textContent).toMatch(/Order #98213/);
  });
});

describe("OrderPageContainer", () => {
  it("renders immediately from a resource already in memory, with no fetch", async () => {
    const link = { href: "/orders", get: vi.fn() };

    screen = mountScreen(
      <OrderPageContainer
        id="98213"
        resource={order() as never}
        ordersLink={link as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(screen.host.textContent).toMatch(/Order #98213/);
    expect(link.get).not.toHaveBeenCalled();
  });

  it("fetches by id when no resource was handed in", async () => {
    const link = {
      href: "/orders",
      get: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          total_items: 1,
          _embedded: { "fx:transactions": [order()] },
        }),
      })),
    };

    screen = mountScreen(
      <OrderPageContainer id="98213" ordersLink={link as never} onBack={vi.fn()} />,
      {},
    );
    await flush();

    expect(link.get).toHaveBeenCalled();
    expect(screen.host.textContent).toMatch(/Order #98213/);
  });

  it("shows a Back-aware error when the id resolves to nothing", async () => {
    const link = {
      href: "/orders",
      get: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ total_items: 0, _embedded: {} }),
      }),
    };
    const onBack = vi.fn();

    screen = mountScreen(
      <OrderPageContainer id="missing" ordersLink={link as never} onBack={onBack} />,
      {},
    );
    await flush();

    expect(screen.host.textContent).toMatch(/something went wrong/i);

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /^back$/i.test(b.textContent ?? ""))!.click();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
