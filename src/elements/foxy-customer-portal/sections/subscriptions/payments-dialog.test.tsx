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

function subscription(
  spy = vi.fn(),
  status = "captured",
  // Offset-carrying with a late time-of-day, not UTC midnight -- the shape
  // the API actually sends. See the "shows the store's calendar day..." test
  // below for why this matters.
  transactionDate = "2026-08-14T22:45:01-0700",
) {
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
                    transaction_date: transactionDate,
                    total_order: 42,
                    currency_code: "USD",
                    status,
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

  it("shows the store's calendar day, not the viewer's UTC-shifted one", async () => {
    // '2023-02-11T22:45:01-0700' is 05:45:01Z on Feb 12 -- naively parsing
    // and formatting in a viewer timezone at or east of the store's rolls
    // the displayed payment date forward to Feb 12.
    render(subscription(vi.fn(), "captured", "2023-02-11T22:45:01-0700"));
    await flush();

    expect(document.body.textContent).toMatch(/Feb 11, 2023/);
    expect(document.body.textContent).not.toMatch(/Feb 12, 2023/);
  });

  it("links to the receipt", async () => {
    render();
    await flush();

    const receipt = [...document.querySelectorAll("a")].find((a) =>
      /receipt/i.test(a.textContent ?? ""),
    );

    expect(receipt?.href).toBe("https://example.test/r");
  });

  it("shows an empty API status as completed, not blank", async () => {
    // The SDK documents '' as: a normal gateway was used, so the transaction
    // should be considered completed. A source change that would satisfy
    // this alone (e.g. hardcoding the subtitle to a fixed string) is ruled
    // out by the next test, which requires a *different* status to render
    // *different* text.
    render(subscription(vi.fn(), ""));
    await flush();

    expect(document.body.textContent).toMatch(/completed/i);
  });

  it("translates a raw API status into customer-readable text", async () => {
    // Guards both defects at once: the raw enum value must never reach the
    // customer, and it must resolve to calm, non-alarming wording -- not
    // "pending_fraud_review" verbatim.
    render(subscription(vi.fn(), "pending_fraud_review"));
    await flush();

    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/pending_fraud_review/);
    expect(text).toMatch(/under review/i);
  });

  it("falls back to the raw status instead of crashing when it's unrecognized", async () => {
    // The SDK's status union is a claim about the API, not a runtime
    // guarantee -- a value outside the 15 known statuses must degrade to
    // the raw string, not throw and take down the whole dialog.
    render(subscription(vi.fn(), "some_future_status"));
    await flush();

    expect(document.body.textContent).toMatch(/some_future_status/);
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

  it("tells a failed payments read from an empty one", async () => {
    // A rejected read settles as `{ data: null, error, isLoading: false }`
    // (see `cache.ts`), which is indistinguishable from a genuinely empty
    // collection unless `error` is checked. A 500 here must not read as "no
    // payments yet" -- that tells the customer something false.
    const broken = {
      _links: {
        self: { href: "/s/1" },
        "fx:transactions": {
          href: "/t",
          get: async () => ({
            ok: false,
            status: 500,
            json: async () => ({}),
          }),
        },
      },
    };

    screen = mountScreen(
      <PaymentsDialog subscription={broken as never} open onClose={vi.fn()} />,
      {},
    );
    await flush();

    expect(document.body.textContent).not.toMatch(/no payments yet/i);
    expect(document.body.textContent).toMatch(/something went wrong/i);
  });

  it("routes to sign-in instead of flashing an error when the session has expired", async () => {
    const onUnauthenticated = vi.fn();
    const expired = {
      _links: {
        self: { href: "/s/1" },
        "fx:transactions": {
          href: "/t",
          get: async () => ({
            ok: false,
            status: 401,
            json: async () => ({}),
          }),
        },
      },
    };

    screen = mountScreen(
      <PaymentsDialog subscription={expired as never} open onClose={vi.fn()} />,
      {},
      onUnauthenticated,
    );
    await flush();

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    // Neither the generic error nor the empty state -- both would flash
    // false information for the instant before routing away.
    expect(document.body.textContent).not.toMatch(/something went wrong/i);
    expect(document.body.textContent).not.toMatch(/no payments yet/i);
  });

  it("omits the date description line instead of rendering it blank when the date can't be parsed", async () => {
    // `SummaryTable.Entry` maps every array element in `description` --
    // `null` included -- into its own paragraph. `card.tsx` and
    // `manage-dialog.tsx` both omit the block entirely instead of passing
    // `null` through; this keeps the four date sites consistent.
    render(subscription(vi.fn(), "captured", "0000-00-00"));
    await flush();

    const paragraphs = [...document.querySelectorAll("p")].filter(
      (p) => p.textContent === "",
    );
    expect(paragraphs).toHaveLength(0);
  });
});
