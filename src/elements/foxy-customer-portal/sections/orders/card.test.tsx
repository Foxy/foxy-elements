import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { OrderCard } from "./card";
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
    // A late fixed time-of-day with an explicit non-UTC offset, the shape the
    // API really sends -- see `calendar-date.ts` on why the store's day, not
    // the viewer's, is the one to render.
    transaction_date: "2023-02-11T22:45:01-0700",
    total_order: 42,
    total_item_price: "40.00",
    total_tax: "2.00",
    total_shipping: "0.00",
    currency_code: "USD",
    status: "captured",
    _links: { self: { href: "/s/98213" } },
    _embedded: {
      "fx:items": [
        { name: "Coffee", quantity: 2, price: 15 },
        { name: "Grinder", quantity: 1, price: 10 },
      ],
    },
    ...overrides,
  } as OrderResource;
}

function render(resource: OrderResource, props = {}) {
  screen = mountScreen(
    <OrderCard order={resource} onOpen={vi.fn()} {...props} />,
    {},
  );
  return screen;
}

describe("OrderCard", () => {
  it("summarises flat items with their quantities as the title", () => {
    render(order());
    expect(screen!.host.textContent).toMatch(/Coffee/);
    expect(screen!.host.textContent).toMatch(/×2/);
    expect(screen!.host.textContent).toMatch(/Grinder/);
  });

  it("titles a bundled order with the parent item's name and lists children separately", () => {
    render(
      order({
        _embedded: {
          "fx:items": [
            { name: "Coffee Sampler", quantity: 1, price: 30, code: "SAMPLER" },
            { name: "Extra Filters", quantity: 2, price: 5, parent_code: "SAMPLER" },
          ],
        },
      } as never),
    );

    expect(screen!.host.textContent).toMatch(/Coffee Sampler/);
    expect(screen!.host.textContent).toMatch(/Extra Filters/);
    expect(screen!.host.textContent).toMatch(/×2/);
  });

  // A transaction can arrive with no items embedded -- an older zoom, or a
  // record with none. The card still has to say which order it is.
  it("falls back to the order number as its title when no items are embedded", () => {
    render(order({ _embedded: {} } as never));
    expect(screen!.host.textContent).toMatch(/98213/);
  });

  it("shows the total in the order's currency", () => {
    render(order());
    expect(screen!.host.textContent).toMatch(/\$42/);
  });

  it("shows the payment status", () => {
    render(order({ status: "declined" }));
    expect(screen!.host.textContent).toMatch(/declined/i);
  });

  // The store's own day, not the viewer's: formatting a `-0700` timestamp in
  // a timezone at or east of UTC rolls the displayed day forward, so the card
  // would disagree with the customer's receipt.
  it("shows the transaction date in the store's timezone", () => {
    render(order());
    expect(screen!.host.textContent).toMatch(/Feb 11, 2023/);
    expect(screen!.host.textContent).not.toMatch(/Feb 12, 2023/);
  });

  it("links to the receipt when the order carries one", () => {
    render(
      order({
        _links: {
          self: { href: "/s/98213" },
          "fx:receipt": { href: "https://demo.foxycart.com/receipt?id=1" },
        },
      } as never),
    );

    const link = screen!.host.querySelector("a")!;
    expect(link.getAttribute("href")).toBe(
      "https://demo.foxycart.com/receipt?id=1",
    );
  });

  it("renders no receipt link when the order has none", () => {
    render(order());
    expect(screen!.host.querySelector("a")).toBeNull();
  });

  it("opens the order when its view control is activated", () => {
    const onOpen = vi.fn();
    render(order(), { onOpen });

    act(() => {
      screen!.host.querySelector("button")?.click();
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  // A deliberately wide, short image: the tile has to stay square regardless
  // of what shape the store's own artwork is.
  const WIDE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50">' +
      '<rect width="200" height="50" fill="red"/></svg>',
  )}`;

  it("shows one thumbnail tile per item, using each item's image", async () => {
    render(
      order({
        _embedded: {
          "fx:items": [
            { name: "A", quantity: 1, price: 1, image: WIDE_IMAGE },
            { name: "B", quantity: 1, price: 1, image: WIDE_IMAGE },
            // No image, so the empty swatch has to hold its shape too.
            { name: "C", quantity: 1, price: 1 },
          ],
        },
      } as never),
    );

    const image = screen!.host.querySelector("img")!;
    const grid = image.parentElement!.parentElement!;

    // Measure only once the images carry their intrinsic size. Before they
    // decode the tiles are square by accident, which would let this pass
    // against the very layout it exists to catch.
    await Promise.all(
      [...screen!.host.querySelectorAll("img")].map((img) =>
        img.decode().catch(() => undefined),
      ),
    );

    expect([...grid.children]).toHaveLength(3);
    for (const tile of grid.children) {
      const box = tile.getBoundingClientRect();
      expect(box.width).toBeGreaterThan(0);
      expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(1);
    }
  });
});
