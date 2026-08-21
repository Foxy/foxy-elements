import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { SubscriptionCard, type SubscriptionResource } from "./card";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const DAY = 86_400_000;

// A store-timezone date `days` from now, in the shape the API really sends:
// an explicit non-UTC offset with a late time-of-day, not the UTC-midnight
// instant `.toISOString()` produces. '22:45:01-0700' is late enough that any
// viewer at or east of the store's offset sees a rolled-forward calendar day
// if the string is parsed as an instant instead of read as a calendar day --
// the exact bug this file's dates guard against. The day-count offsets here
// are wide enough (30 days past, 14 days future) that the few hours' shift
// from the fixed time-of-day never flips which side of "now" they land on,
// so `status.ts`'s relative-time checks still see the same "already started,
// not yet due" subscription they did before.
function storeDate(days: number): string {
  const date = new Date(Date.now() + days * DAY);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}T22:45:01-0700`;
}

function subscription(
  overrides: Partial<SubscriptionResource> = {},
): SubscriptionResource {
  return {
    frequency: "1m",
    start_date: storeDate(-30),
    next_transaction_date: storeDate(14),
    end_date: null,
    is_active: true,
    error_message: "",
    first_failed_transaction_date: null,
    _links: { self: { href: "/s/1" } },
    _embedded: {
      "fx:transaction_template": {
        currency_code: "USD",
        total_order: 42,
        _embedded: {
          "fx:items": [
            { name: "Coffee", quantity: 2 },
            { name: "Grinder", quantity: 1 },
          ],
        },
      },
    },
    ...overrides,
  } as SubscriptionResource;
}

function render(sub: SubscriptionResource, props = {}) {
  screen = mountScreen(
    <SubscriptionCard
      subscription={sub}
      onManage={vi.fn()}
      onPayments={vi.fn()}
      {...props}
    />,
    {},
  );
  return screen;
}

describe("SubscriptionCard", () => {
  it("summarises the items with their quantities", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/Coffee/);
    expect(screen!.host.textContent).toMatch(/2/);
    expect(screen!.host.textContent).toMatch(/Grinder/);
  });

  it("shows the price in the transaction template's currency", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/\$42/);
  });

  it("shows the status", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/active/i);
  });

  it("shows an error message when the subscription has one", () => {
    render(subscription({ error_message: "Card declined." }));
    expect(screen!.host.textContent).toMatch(/Card declined\./);
  });

  it("shows no error text when there is none", () => {
    render(subscription());
    expect(screen!.host.textContent).not.toMatch(/declined/i);
  });

  it("omits the next-payment line when the date is the API's unset sentinel", () => {
    render(subscription({ next_transaction_date: "0000-00-00" }));
    expect(screen!.host.textContent).not.toMatch(/next payment/i);
  });

  it("shows the store's calendar day, not the viewer's UTC-shifted one", () => {
    // '2023-02-11T22:45:01-0700' is 05:45:01Z on Feb 12 -- naively parsing
    // and formatting in a viewer timezone at or east of the store's rolls
    // the displayed day forward to Feb 12, a day after what the store (and
    // the customer's receipt) considers the payment date.
    render(subscription({ next_transaction_date: "2023-02-11T22:45:01-0700" }));
    expect(screen!.host.textContent).toMatch(/Feb 11, 2023/);
    expect(screen!.host.textContent).not.toMatch(/Feb 12, 2023/);
  });

  it("calls onManage", () => {
    const onManage = vi.fn();
    render(subscription(), { onManage });

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /manage/i.test(b.textContent ?? ""))!.click();
    });

    expect(onManage).toHaveBeenCalled();
  });

  it("calls onPayments", () => {
    const onPayments = vi.fn();
    render(subscription(), { onPayments });

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /payments/i.test(b.textContent ?? ""))!.click();
    });

    expect(onPayments).toHaveBeenCalled();
  });
});
