// src/elements/foxy-customer-portal/sections/orders/row.test.tsx
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { OrderRow } from "./row";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

function order(overrides = {}) {
  return {
    id: 98213,
    display_id: 98213,
    transaction_date: "2023-02-11T22:45:01-0700",
    total_order: 42.5,
    // Present because `OrderResource` declares them (Task 2's dialog needs
    // them on the same object), even though this row does not render them.
    total_item_price: "37.50",
    total_tax: "0.00",
    total_shipping: "5.00",
    currency_code: "USD",
    status: "captured",
    _links: { self: { href: "/s/98213" } },
    _embedded: {
      "fx:items": [
        { name: "Coffee", quantity: 2, price: 20 },
        { name: "Filters", quantity: 1, price: 2.5 },
      ],
    },
    ...overrides,
  };
}

function render(props: Partial<Parameters<typeof OrderRow>[0]> = {}) {
  screen = mountScreen(
    <OrderRow order={order() as never} onOpen={() => {}} {...props} />,
    {},
  );
  return screen;
}

describe("OrderRow", () => {
  it("shows the order id, item summary, status and amount", () => {
    render();

    expect(document.body.textContent).toMatch(/98213/);
    expect(document.body.textContent).toMatch(/Coffee/);
    expect(document.body.textContent).toMatch(/Filters/);
    expect(document.body.textContent).toMatch(/paid/i);
    expect(document.body.textContent).toMatch(/\$42\.50/);
  });

  it("shows the store's calendar day, not the viewer's UTC-shifted one", () => {
    // '2023-02-11T22:45:01-0700' is 05:45:01Z on Feb 12 -- naively parsing
    // this with the viewer's local zone would show Feb 12 somewhere east of
    // the store. Only `toCalendarDate` gets this right; see calendar-date.ts.
    render();
    expect(document.body.textContent).toMatch(/Feb 11, 2023/);
  });

  it("falls back to the raw status when it doesn't recognize one", () => {
    render({ order: order({ status: "some_future_status" }) as never });
    expect(document.body.textContent).toMatch(/some_future_status/);
  });

  it("calls onOpen when clicked", () => {
    const onOpen = vi.fn();
    render({ onOpen });

    act(() => {
      document.querySelector("button")?.click();
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
