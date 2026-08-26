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

// Two items by default -- one plain, one carrying an option, a weight and a
// code -- so a test can assert on the count and every detail-row kind
// without every caller having to build its own items array.
const DEFAULT_ITEMS = [
  { name: "Coffee", quantity: 1, price: 5 },
  {
    name: "Mug",
    quantity: 1,
    price: 12,
    weight: 12,
    code: "MUG-1",
    _embedded: {
      "fx:item_options": [{ name: "Engraving", value: "A. Marsh" }],
    },
  },
];

function subscription(
  overrides: Record<string, unknown> = {},
  patch?: (body: unknown) => Promise<{ ok: boolean; status: number }>,
) {
  const { items, ...rest } = overrides as {
    items?: unknown[];
  } & Record<string, unknown>;

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
        shipping_address1: "129 Elm Avenue",
        shipping_city: "Oakland",
        shipping_state: "CA",
        shipping_postal_code: "94612",
        shipping_country: "US",
        _embedded: { "fx:items": items ?? DEFAULT_ITEMS },
      },
    },
    ...rest,
  };
}

/** A subscription whose template carries `count` plain items, for paging. */
function subscriptionWithItems(count: number) {
  return subscription({
    items: Array.from({ length: count }, (_, i) => ({
      name: `Item ${i + 1}`,
      quantity: 1,
      price: 5,
    })),
  });
}

/**
 * Mounts `SubscriptionPage` with a default subscription (and no portal
 * settings), overridable per test. Assertions in this describe block read
 * `document.body.textContent` rather than `screen.host.textContent` -- both
 * work, since `mountScreen` appends `host` to `document.body`.
 */
function render(
  overrides: {
    subscription?: unknown;
    cartDisplayConfig?: unknown;
    paymentMethodLink?: unknown;
  } = {},
) {
  screen = mountScreen(
    <SubscriptionPage
      subscription={(overrides.subscription ?? subscription()) as never}
      settings={null}
      cartDisplayConfig={overrides.cartDisplayConfig as never}
      paymentMethodLink={overrides.paymentMethodLink as never}
      onBack={vi.fn()}
    />,
    {},
  );
}

/** Matches `payment-method.test.tsx`'s own link fixture shape. */
function paymentMethodLink(json: unknown) {
  return {
    href: "/s/customer/default_payment_method",
    get: async () => ({ ok: true, status: 200, json: async () => json }),
  };
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

  it("lists the subscription's items with their options", () => {
    render();
    expect(document.body.textContent).toMatch(/Items \(2\)/);
    expect(document.body.textContent).toMatch(/Engraving/);
    expect(document.body.textContent).toMatch(/A\. Marsh/);
  });

  it("shows an item's weight and code", () => {
    render();
    // Plain /12/ would also be satisfied by the Mug's own $12.00 price, so
    // anchor to the weight row's label instead of the bare number.
    expect(document.body.textContent).toMatch(/Weight\s*12/);
    expect(document.body.textContent).toMatch(/Code/);
    expect(document.body.textContent).toMatch(/MUG-1/);
  });

  it("hides options the store has turned off", () => {
    render({ cartDisplayConfig: { show_product_options: false } });
    expect(document.body.textContent).not.toMatch(/Engraving/);
    // The item itself still renders.
    expect(document.body.textContent).toMatch(/Items \(2\)/);
  });

  it("pages the items when there are more than fit", () => {
    render({ subscription: subscriptionWithItems(5) });

    // The page's <h1> also lists every item's name (see `title` in
    // subscription-page.tsx), so "Item 4" is present in `document.body`
    // from the very first render regardless of pagination. Scope every
    // content assertion to the Items section itself -- the <section> that
    // wraps its <h2> -- so the assertions actually exercise
    // `visibleItems`, not the unrelated title.
    const itemsSectionText = () => {
      const heading = [...document.querySelectorAll("h2")].find((h) =>
        /^Items/.test(h.textContent ?? ""),
      );
      return heading?.parentElement?.textContent ?? "";
    };

    const pageButtons = () =>
      [...document.querySelectorAll("button")].filter((b) =>
        /^\d+$/.test(b.textContent?.trim() ?? ""),
      );

    // 5 items at 3 per page.
    expect(pageButtons()).toHaveLength(2);

    expect(itemsSectionText()).toMatch(/Item 1/);
    expect(itemsSectionText()).toMatch(/Item 2/);
    expect(itemsSectionText()).toMatch(/Item 3/);
    expect(itemsSectionText()).not.toMatch(/Item 4/);

    act(() => {
      pageButtons()
        .find((b) => b.textContent?.trim() === "2")!
        .click();
    });

    expect(itemsSectionText()).toMatch(/Item 4/);
    expect(itemsSectionText()).toMatch(/Item 5/);
    expect(itemsSectionText()).not.toMatch(/Item 1/);
  });

  // Scoped to the Billing & shipping section's own subtree -- see the
  // pager test above for why a whole-`document.body` match can pass for
  // the wrong reason on this page.
  const billingSectionText = () => {
    const heading = [...document.querySelectorAll("h2")].find((h) =>
      /^Billing & shipping/.test(h.textContent ?? ""),
    );
    return heading?.parentElement?.textContent ?? "";
  };

  it("shows the shipping address from the subscription's template", () => {
    render();
    expect(billingSectionText()).toMatch(/129 Elm Avenue/);
    expect(billingSectionText()).toMatch(/Oakland/);
  });

  it("shows the default payment method's card label in the billing section", async () => {
    render({
      paymentMethodLink: paymentMethodLink({
        cc_type: "visa",
        cc_number_masked: "************4242",
        cc_exp_month: "08",
        cc_exp_year: "2028",
      }),
    });
    await flush();

    expect(billingSectionText()).toMatch(/Visa ••••4242/);
  });

  it("omits the card value when there is no default payment method", async () => {
    // No `paymentMethodLink` at all -- covers the store-has-no-rel case.
    // The row must still show its own label and note, just no value.
    render();
    await flush();

    expect(billingSectionText()).toMatch(/Payment method/);
    expect(billingSectionText()).toMatch(
      /Your default payment method is charged/,
    );
    expect(billingSectionText()).not.toMatch(/undefined/);
    expect(billingSectionText()).not.toMatch(/•/);
  });

  it("links the address Edit out to the hosted cart", () => {
    // The default fixture carries no `fx:sub_token_url`, so the Edit link
    // (like the existing Cancel/Update billing links) only renders once one
    // is supplied -- overriding `_links` wholesale, so `self` and
    // `fx:transactions` have to be repeated alongside it.
    render({
      subscription: subscription({
        _links: {
          self: { href: "/s/1042" },
          "fx:transactions": {
            href: "/s/42/transactions",
            get: async () => ({
              ok: true,
              status: 200,
              json: async () => ({ total_items: 0, _embedded: {} }),
            }),
          },
          "fx:sub_token_url": { href: "https://example.com/cart" },
        },
      }),
    });

    const edit = [...document.querySelectorAll("a")].find((a) =>
      /^edit$/i.test(a.textContent?.trim() ?? ""),
    );
    expect(edit?.getAttribute("href")).toMatch(/cart=checkout/);
  });

  it("hides billing and shipping once the subscription has ended", () => {
    render({ subscription: subscription({ is_active: false, end_date: past }) });
    expect(document.body.textContent).not.toMatch(/Billing & shipping/);
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
