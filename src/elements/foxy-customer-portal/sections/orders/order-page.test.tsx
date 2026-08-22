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
