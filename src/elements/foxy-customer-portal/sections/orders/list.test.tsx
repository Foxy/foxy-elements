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
    total_item_price: "10.00",
    total_tax: "0.00",
    total_shipping: "0.00",
    currency_code: "USD",
    status: "captured",
    _links: { self: { href: `/s/${id}` } },
    _embedded: { "fx:items": [{ name: "Widget", quantity: 1, price: 10 }] },
  };
}

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

describe("OrdersSection", () => {
  it("requests the allow-list filter and the items:item_options zoom, and nothing else", async () => {
    const spy = vi.fn(async (_query?: Record<string, unknown>) => page([]));
    screen = mountScreen(
      <OrdersSection customer={customer(spy) as never} onNavigate={vi.fn()} />,
      {},
    );
    await flush();

    const [query] = spy.mock.calls.at(-1) ?? [];
    // Exact equality, not a substring match: this is the one test guarding
    // the allow-list-over-deny-list distinction the whole task exists for.
    // A loose match here would pass just as well for a filter with an extra
    // type appended, or for a second filter entry alongside this one -- the
    // exact failure mode the live store silently accepts (full unfiltered
    // set, still a 200) instead of rejecting.
    expect(query?.filters).toEqual([
      "type:in=transaction,subscription_modification,subscription_cancellation",
    ]);
    // Two levels deep, and the second is load-bearing: this is the request
    // that supplies `order-page.tsx` when the customer opens an order, and
    // that page's item cards read `item._embedded["fx:item_options"]` (see
    // `item-details.ts`). Dropping `:item_options` costs no test and no
    // error against the real API -- the option rows just silently stop
    // existing -- so this pins the exact string.
    expect(String(query?.zoom)).toBe("items:item_options");
  });

  it("renders nothing at all when there are no orders", async () => {
    screen = mountScreen(
      <OrdersSection
        customer={customer(async () => page([])) as never}
        onNavigate={vi.fn()}
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
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(document.querySelectorAll("button").length).toBeGreaterThanOrEqual(2);
  });

  it("navigates to the order page with its resource when a row is clicked", async () => {
    const onNavigate = vi.fn();
    screen = mountScreen(
      <OrdersSection
        customer={customer(async () => page([order(98213)])) as never}
        onNavigate={onNavigate}
      />,
      {},
    );
    await flush();

    act(() => {
      document.querySelector("button")?.click();
    });

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ type: "order", id: "98213" }),
    );
  });

  it("shows an error, not an empty section, when the read fails", async () => {
    screen = mountScreen(
      <OrdersSection
        customer={
          customer(async () => ({ ok: false, status: 500, json: async () => ({}) })) as never
        }
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/something went wrong/i);
  });

  it("shows the Payment history heading", async () => {
    screen = mountScreen(
      <OrdersSection
        customer={customer(async () => page([order(1)])) as never}
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/payment history/i);
  });

  describe('variant="orders"', () => {
    it("also asks for subscription renewals, which the row view leaves to the subscription page", async () => {
      const spy = vi.fn(async (_query?: Record<string, unknown>) => page([]));
      screen = mountScreen(
        <OrdersSection
          customer={customer(spy) as never}
          variant="orders"
          onNavigate={vi.fn()}
        />,
        {},
      );
      await flush();

      const [query] = spy.mock.calls.at(-1) ?? [];
      // Exact equality for the same reason the row view's test uses it: a
      // live store answers a malformed filter with the full unfiltered set
      // and a 200, so a substring match would pass for the wrong query.
      // `updateinfo` stays out in both variants -- a zero-dollar card-update
      // record is not a payment.
      expect(query?.filters).toEqual([
        "type:in=transaction,subscription_modification,subscription_cancellation,subscription_renewal",
      ]);
    });

    it("heads the section Orders, not Payment history", async () => {
      screen = mountScreen(
        <OrdersSection
          customer={customer(async () => page([order(1)])) as never}
          variant="orders"
          onNavigate={vi.fn()}
        />,
        {},
      );
      await flush();

      // This section IS the page in this variant, and on a store that sells
      // products the customer thinks of these as orders, not as a payment
      // ledger under a subscriptions list.
      expect(document.body.textContent).toMatch(/orders/i);
      expect(document.body.textContent).not.toMatch(/payment history/i);
    });

    it("renders cards instead of table rows", async () => {
      screen = mountScreen(
        <OrdersSection
          customer={customer(async () => page([order(1)])) as never}
          variant="orders"
          onNavigate={vi.fn()}
        />,
        {},
      );
      await flush();

      expect(document.body.textContent).toMatch(/view order/i);
      // The Summary column exists only in the table presentation.
      expect(document.body.textContent).not.toMatch(/summary/i);
    });

    it("says there are no payments yet instead of rendering nothing", async () => {
      screen = mountScreen(
        <OrdersSection
          customer={customer(async () => page([])) as never}
          variant="orders"
          onNavigate={vi.fn()}
        />,
        {},
      );
      await flush();

      // The row view returns null when empty, because the subscriptions
      // section above it still fills the page. In this variant this section
      // is the whole page, so an empty one has to say so.
      expect(document.body.textContent).toMatch(/no payments yet/i);
    });

    it("navigates to the order page when a card's view control is used", async () => {
      const onNavigate = vi.fn();
      screen = mountScreen(
        <OrdersSection
          customer={customer(async () => page([order(98213)])) as never}
          variant="orders"
          onNavigate={onNavigate}
        />,
        {},
      );
      await flush();

      // The card's own control, found by its label rather than by taking
      // the first button on the page -- which in the row presentation is the
      // clickable row, so a loose query here would pass in either variant.
      const view = [...document.querySelectorAll("button")].find((button) =>
        /view order/i.test(button.textContent ?? ""),
      );

      act(() => view?.click());

      expect(onNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ type: "order", id: "98213" }),
      );
    });
  });
});
