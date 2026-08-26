import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import {
  SubscriptionPage,
  SubscriptionPageContainer,
} from "./subscription-page";
import type * as DateConstraints from "./date-constraints";

let screen: MountedScreen | null = null;

afterEach(() => {
  screen?.unmount();
  screen = null;
});

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

// Well behind `start_date`/`next_transaction_date`, so a test that plugs it
// into `end_date` or `first_failed_transaction_date` gets an unambiguous
// past instant.
const past = "2020-01-01T00:00:00Z";

function subscription(
  overrides: Record<string, unknown> = {},
  patch?: (body: unknown) => Promise<{ ok: boolean; status: number }>,
) {
  return {
    frequency: "1m",
    start_date: "2026-01-01T00:00:00Z",
    next_transaction_date: "2099-01-01T00:00:00Z",
    end_date: null,
    is_active: true,
    error_message: "",
    first_failed_transaction_date: null,
    _links: {
      self: { href: "/s/1042", patch },
      "fx:transactions": {
        href: "/s/42/transactions",
        get: async () => ({
          ok: true,
          status: 200,
          json: async () => ({ total_items: 0, _embedded: {} }),
        }),
      },
    },
    _embedded: {
      "fx:transaction_template": {
        currency_code: "USD",
        total_order: 10,
        _embedded: { "fx:items": [{ name: "Coffee", quantity: 1 }] },
      },
    },
    ...overrides,
  };
}

/**
 * Mounts `SubscriptionPage` with a default subscription (and no portal
 * settings), overridable per test. Assertions in this describe block read
 * `document.body.textContent` rather than `screen.host.textContent` -- both
 * work, since `mountScreen` appends `host` to `document.body`.
 */
function render(overrides: { subscription?: unknown } = {}) {
  screen = mountScreen(
    <SubscriptionPage
      subscription={(overrides.subscription ?? subscription()) as never}
      settings={null}
      onBack={vi.fn()}
    />,
    {},
  );
}

describe("SubscriptionPage", () => {
  it("renders the subscription id and a Back button", async () => {
    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription() as never}
        settings={null}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(screen.host.textContent).toMatch(/42/);
    const buttons = [...screen.host.querySelectorAll("button")];
    expect(buttons.some((b) => /^back$/i.test(b.textContent ?? ""))).toBe(true);
  });

  it("shows the payment history below the manage controls", async () => {
    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription() as never}
        settings={null}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(screen.host.textContent).toMatch(/payments/i);
    expect(screen.host.textContent).toMatch(/no payments yet/i);
  });

  it("saves a changed frequency and returns home", async () => {
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));
    const onBack = vi.fn();

    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription({}, patch) as never}
        settings={{
          subscriptions: {
            allow_frequency_modification: [
              { jsonata_query: "*", values: ["1m", "1y"] },
            ],
            allow_next_date_modification: true,
          },
        }}
        onBack={onBack}
      />,
      {},
    );
    await flush();

    act(() => {
      const day = screen!.host.querySelector<HTMLButtonElement>(
        "button[data-day]:not([disabled])",
      );
      day?.click();
    });

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /^save$/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    expect(patch).toHaveBeenCalled();
    expect(onBack).toHaveBeenCalled();
  });

  it("heads the page with the subscription's items and id", () => {
    render();
    expect(document.body.textContent).toMatch(/#1042/);
  });

  it("badges a live subscription as active", () => {
    render();
    expect(document.body.textContent).toMatch(/Active/);
  });

  it("badges an ended subscription and explains it", () => {
    render({
      subscription: subscription({ is_active: false, end_date: past }),
    });
    expect(document.body.textContent).toMatch(/Ended/);
    expect(document.body.textContent).toMatch(/No further payments/);
  });

  it("raises an alert when a payment has failed", () => {
    render({
      subscription: subscription({
        first_failed_transaction_date: past,
        past_due_amount: 24,
      }),
    });
    expect(document.body.textContent).toMatch(/Payment failed/);
    expect(document.body.textContent).toMatch(/\$24\.00/);
  });

  it("shows no alert when nothing has failed", () => {
    render();
    expect(document.body.textContent).not.toMatch(/Payment failed/);
  });
});

describe("SubscriptionPageContainer", () => {
  it("renders immediately from a resource already in memory, with no fetch", async () => {
    const link = { href: "/subs", get: vi.fn() };

    screen = mountScreen(
      <SubscriptionPageContainer
        id="42"
        resource={subscription() as never}
        subscriptionsLink={link as never}
        settings={null}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(screen.host.textContent).toMatch(/42/);
    expect(link.get).not.toHaveBeenCalled();
  });

  it("fetches by id when no resource was handed in", async () => {
    const link = {
      href: "/subs",
      get: vi.fn(async (_query?: Record<string, unknown>) => ({
        ok: true,
        status: 200,
        json: async () => ({
          total_items: 1,
          _embedded: { "fx:subscriptions": [subscription()] },
        }),
      })),
    };

    screen = mountScreen(
      <SubscriptionPageContainer
        id="1042"
        subscriptionsLink={link as never}
        settings={null}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(link.get).toHaveBeenCalled();
    expect(screen.host.textContent).toMatch(/42/);
  });

  it("shows a Back-aware error when the id resolves to nothing", async () => {
    const link = {
      href: "/subs",
      get: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ total_items: 0, _embedded: {} }),
      }),
    };
    const onBack = vi.fn();

    screen = mountScreen(
      <SubscriptionPageContainer
        id="missing"
        subscriptionsLink={link as never}
        settings={null}
        onBack={onBack}
      />,
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

/**
 * Ported from the deleted `manage-dialog.timezone.test.tsx`, which covered
 * `ManageDialog`'s `<Calendar>` mount before this task folded it into
 * `SubscriptionPage`. `date-constraints.ts` documents that its local-day
 * matchers are correct only as long as `<Calendar>` (react-day-picker) is
 * never given a `timeZone`: with one set, `dateLib.newDate()` builds every
 * calendar cell as a `TZDate` (from `@date-fns/tz`) instead of a plain
 * `Date`. A `TZDate` still passes `instanceof Date` -- its prototype chain
 * does not include `Date.prototype` -- so `Object.getPrototypeOf(cell) ===
 * Date.prototype` is a zone-independent way to tell the two apart.
 *
 * `toDatePickerBounds` is mocked to hand `<Calendar>` a probe function
 * matcher instead of its real disable rules, so every `date` DayPicker
 * checks against it gets recorded. `subscription-page.tsx` itself is
 * untouched -- this only observes what it hands to the real
 * `<Calendar>`/`DayPicker`.
 */
let seenDates: Date[];

vi.mock("./date-constraints", async (importOriginal) => {
  const actual = await importOriginal<typeof DateConstraints>();
  return {
    ...actual,
    toDatePickerBounds: () => ({
      disabled: [
        (date: Date) => {
          seenDates.push(date);
          return false;
        },
      ],
    }),
  };
});

beforeEach(() => {
  seenDates = [];
});

// `allow_next_date_modification` has to resolve to an *object*, not the
// boolean `true`/`false` shorthand -- `SubscriptionPage` only calls
// `toDatePickerBounds` (mocked above) in the object branch.
const TIMEZONE_SETTINGS = {
  subscriptions: {
    allow_frequency_modification: [{ jsonata_query: "*", values: ["1m"] }],
    allow_next_date_modification: [{ jsonata_query: "*", min: "1d" }],
  },
};

describe("SubscriptionPage's Calendar disabled matcher", () => {
  it("only ever receives a plain Date, never a TZDate", async () => {
    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription() as never}
        settings={TIMEZONE_SETTINGS as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    // The matcher has to have actually been invoked, or the assertion below
    // would pass vacuously because the loop never runs.
    expect(seenDates.length).toBeGreaterThan(0);

    for (const date of seenDates) {
      expect(Object.getPrototypeOf(date)).toBe(Date.prototype);
    }
  });
});
