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

  it("shows the status with the date it carries", () => {
    // The default subscription is active, already started, with no end date
    // and a future next_transaction_date -- getSubscriptionStatus's
    // "next_payment". The bare "Active" badge this used to render told the
    // customer nothing about *when* -- the date has to be in the text.
    render(subscription());
    expect(screen!.host.textContent).toMatch(/next payment on/i);
  });

  it("shows the next payment date only once, not once as a description line and again in the badge", () => {
    // Regression: a commit that put the date back on the status badge
    // collided with an existing "Next payment {date}" description line --
    // the default subscription (active, started, no end date, future
    // next_transaction_date) rendered both "Next payment ..." and "Next
    // payment on ..." on the same card. v1's card has no such description
    // line (SubscriptionCard.ts renders summary, status and price only) --
    // the badge is the one place this belongs.
    render(subscription());
    const matches = screen!.host.textContent?.match(/next payment/gi) ?? [];
    expect(matches).toHaveLength(1);
  });

  it("shows the actual start date for a subscription starting well in the future, not a vague label", () => {
    // Regression for the bug this commit fixes: "Starting soon" used to
    // render even for a subscription starting years out.
    render(subscription({ start_date: storeDate(2000) }));
    expect(screen!.host.textContent).toMatch(/starts on/i);
    expect(screen!.host.textContent).not.toMatch(/starting soon/i);
  });

  it("substitutes the actual date into the badge, not the raw ICU pattern", () => {
    // Mutation this guards against: dropping the values argument at card.tsx's
    // `intl.formatMessage(STATUS_MESSAGES[status], statusDates)` call.
    // react-intl doesn't throw on a missing value -- it renders the pattern's
    // placeholder literally ("Starts on {start_date}"), so every prefix-only
    // assertion in this file (/starts on/i, /failed on/i, /next payment on/i,
    // /scheduled to start/i) stays green regardless. Only asserting the
    // actual formatted digits catches it.
    //
    // A `will_start` fixture isolates the badge specifically: card.tsx has no
    // description line that ever rendered `start_date` (only `frequency` and,
    // before item 1, `next_transaction_date` did), so these digits can only
    // have come from the badge's own substitution.
    const startDate = storeDate(2000);
    const [, year, month, day] = /^(\d{4})-(\d{2})-(\d{2})/.exec(startDate)!;
    const expected = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(Number(year), Number(month) - 1, Number(day)));

    render(subscription({ start_date: startDate }));

    expect(screen!.host.textContent).toContain(expected);
  });

  it("shows the date a failed payment happened", () => {
    // first_failed_transaction_date used to be consumed only as a boolean by
    // status.ts and rendered nowhere -- a customer whose payment failed had
    // no way to see when.
    render(
      subscription({ first_failed_transaction_date: storeDate(-2) }),
    );
    expect(screen!.host.textContent).toMatch(/failed on/i);
  });

  it("shows a date-free label instead of the raw date when the store turned the matching flag off", () => {
    render(subscription({ start_date: storeDate(2000) }), {
      cartDisplayConfig: { show_sub_startdate: false },
    });
    expect(screen!.host.textContent).toMatch(/scheduled to start/i);
    expect(screen!.host.textContent).not.toMatch(/starts on/i);
  });

  it("shows an error message when the subscription has one", () => {
    render(subscription({ error_message: "Card declined." }));
    expect(screen!.host.textContent).toMatch(/Card declined\./);
  });

  it("shows no error text when there is none", () => {
    render(subscription());
    expect(screen!.host.textContent).not.toMatch(/declined/i);
  });

  it("falls back to a date-free badge when the date is the API's unset sentinel", () => {
    // There is no separate next-payment description line (see item 1) --
    // this now exercises `getExtendedSubscriptionStatus`'s own fallback,
    // which drops to "next_payment_no_nextdate" ("Active") whenever the
    // date can't be shown.
    render(subscription({ next_transaction_date: "0000-00-00" }));
    expect(screen!.host.textContent).not.toMatch(/next payment/i);
  });

  it("shows the store's calendar day, not the viewer's UTC-shifted one", () => {
    // '2023-02-11T22:45:01-0700' is 05:45:01Z on Feb 12 -- naively parsing
    // and formatting in a viewer timezone at or east of the store's rolls
    // the displayed day forward to Feb 12, a day after what the store (and
    // the customer's receipt) considers the payment date. The status badge
    // is the only place this date renders (see item 1) -- there is no
    // separate next-payment description line to satisfy this independently.
    render(subscription({ next_transaction_date: "2023-02-11T22:45:01-0700" }));
    expect(screen!.host.textContent).toMatch(/Feb 11, 2023/);
    expect(screen!.host.textContent).not.toMatch(/Feb 12, 2023/);
  });

  it("shows the frequency line by default, with no cart_display_config at all", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/every/i);
  });

  it("hides the frequency line when the store turned show_sub_frequency off", () => {
    render(subscription(), {
      cartDisplayConfig: { show_sub_frequency: false },
    });
    expect(screen!.host.textContent).not.toMatch(/every/i);
  });

  it("hides the next-payment date from the badge when the store turned show_sub_nextdate off", () => {
    // Gated in `getExtendedSubscriptionStatus` (status.ts), not here -- there
    // is no separate next-payment description line for card.tsx itself to
    // gate (see item 1).
    render(subscription(), {
      cartDisplayConfig: { show_sub_nextdate: false },
    });
    expect(screen!.host.textContent).not.toMatch(/next payment/i);
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
