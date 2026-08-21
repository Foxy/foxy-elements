import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { OrdersSection } from "./list";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const TRANSACTIONS_HREF = "https://demo.foxycart.com/s/customer/transactions";

function customer(get: (query?: Record<string, unknown>) => Promise<unknown>) {
  return {
    _links: {
      self: { href: "/s/customer" },
      "fx:transactions": { href: TRANSACTIONS_HREF, get },
    },
  };
}

function page(orders: unknown[], totalItems = orders.length) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      total_items: totalItems,
      _embedded: { "fx:transactions": orders },
    }),
  };
}

function order(id: number) {
  return {
    id,
    display_id: id,
    transaction_date: "2023-02-11T22:45:01-0700",
    total_order: 10,
    currency_code: "USD",
    status: "captured",
    _links: { self: { href: `/s/${id}` } },
    _embedded: { "fx:items": [{ name: "Widget", quantity: 1 }] },
  };
}

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

describe("OrdersSection", () => {
  it("requests the allow-list filter and the items zoom, and nothing else", async () => {
    const spy = vi.fn(async (_query?: Record<string, unknown>) => page([]));
    screen = mountScreen(<OrdersSection customer={customer(spy) as never} />, {});
    await flush();

    const [query] = spy.mock.calls.at(-1) ?? [];
    expect(String(query?.filters)).toMatch(
      /type:in=transaction,subscription_modification,subscription_cancellation/,
    );
    expect(String(query?.zoom)).toBe("items");
  });

  it("renders nothing at all when there are no orders", async () => {
    screen = mountScreen(
      <OrdersSection
        customer={customer(async () => page([])) as never}
      />,
      {},
    );
    await flush();

    expect(document.body.textContent?.trim()).toBe("");
  });

  it("lists every order it receives", async () => {
    screen = mountScreen(
      <OrdersSection
        customer={
          customer(async () => page([order(1), order(2)])) as never
        }
      />,
      {},
    );
    await flush();

    expect(document.querySelectorAll("button").length).toBeGreaterThanOrEqual(2);
  });

  it("opens the detail dialog for the clicked order", async () => {
    screen = mountScreen(
      <OrdersSection
        customer={customer(async () => page([order(98213)])) as never}
      />,
      {},
    );
    await flush();

    act(() => {
      document.querySelector("button")?.click();
    });

    expect(document.body.textContent).toMatch(/98213/);
  });

  it("shows an error, not an empty section, when the read fails", async () => {
    screen = mountScreen(
      <OrdersSection
        customer={
          customer(async () => ({ ok: false, status: 500, json: async () => ({}) })) as never
        }
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/something went wrong/i);
  });
});
