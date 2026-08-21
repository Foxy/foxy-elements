import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { PaymentsDialog } from "./payments-dialog";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

function subscription(spy = vi.fn()) {
  return {
    _links: {
      self: { href: "/s/1" },
      "fx:transactions": {
        href: "https://demo.foxycart.com/s/customer/subscriptions/1/transactions",
        get: async (query?: Record<string, unknown>) => {
          spy(query);
          return {
            ok: true,
            status: 200,
            json: async () => ({
              total_items: 1,
              _embedded: {
                "fx:transactions": [
                  {
                    id: 98213,
                    transaction_date: "2026-08-14T00:00:00Z",
                    total_order: 42,
                    currency_code: "USD",
                    status: "captured",
                    _links: {
                      "fx:receipt": { href: "https://example.test/r" },
                    },
                    _embedded: {
                      "fx:items": [{ name: "Coffee", quantity: 2 }],
                    },
                  },
                ],
              },
            }),
          };
        },
      },
    },
  };
}

function render(sub = subscription()) {
  screen = mountScreen(
    <PaymentsDialog subscription={sub as never} open onClose={vi.fn()} />,
    {},
  );
  return screen;
}

describe("PaymentsDialog", () => {
  it("zooms items so each payment shows what was charged", async () => {
    const spy = vi.fn();
    render(subscription(spy));
    await flush();

    const [query] = spy.mock.calls.at(-1) ?? [];
    expect(String(query?.zoom)).toMatch(/items/);
  });

  it("lists a payment with its id, amount and summary", async () => {
    render();
    await flush();

    expect(document.body.textContent).toMatch(/98213/);
    expect(document.body.textContent).toMatch(/\$42/);
    expect(document.body.textContent).toMatch(/Coffee/);
  });

  it("links to the receipt", async () => {
    render();
    await flush();

    const receipt = [...document.querySelectorAll("a")].find((a) =>
      /receipt/i.test(a.textContent ?? ""),
    );

    expect(receipt?.href).toBe("https://example.test/r");
  });

  it("says so when there are no payments", async () => {
    const empty = {
      _links: {
        self: { href: "/s/1" },
        "fx:transactions": {
          href: "/t",
          get: async () => ({
            ok: true,
            status: 200,
            json: async () => ({ total_items: 0, _embedded: {} }),
          }),
        },
      },
    };

    screen = mountScreen(
      <PaymentsDialog subscription={empty as never} open onClose={vi.fn()} />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/no payments yet/i);
  });
});
