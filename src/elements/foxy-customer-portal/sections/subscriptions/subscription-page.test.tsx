import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { page } from "vitest/browser";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { RequestCache } from "@/lib/customer-api";
import {
  SubscriptionPage,
  SubscriptionPageContainer,
} from "./subscription-page";
import type * as DateConstraints from "./date-constraints";

let screen: MountedScreen | null = null;

// Mirrors row.test.tsx's own note: the suite's default iframe is under
// row.tsx's 640px MOBILE breakpoint, and this hook restores it
// unconditionally so a thrown assertion in a desktop-viewport test never
// leaks a wide viewport into a later test.
afterEach(async () => {
  screen?.unmount();
  screen = null;
  await page.viewport(414, 896);
});

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

// Well behind `start_date`/`next_transaction_date`, so a test that plugs it
// into `end_date` or `first_failed_transaction_date` gets an unambiguous
// past instant.
const past = "2020-01-01T00:00:00Z";

// After `start_date` (2026-01-01) but before the default fixture's
// `next_transaction_date` (2099-01-01), so plugging this into `end_date`
// alone (leaving `next_transaction_date` at its default) yields
// `getSubscriptionStatus`'s "will_end" -- live, but with a cancellation
// already scheduled -- rather than "ended" or "will_end_after_payment".
const future = "2027-01-01T00:00:00Z";

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
        total_order: 42,
        total_shipping: "4.50",
        total_tax: "2.25",
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

/** A single `fx:transactions` entry, shaped like `OrderResource`. */
function payment(overrides: Record<string, unknown> = {}) {
  return {
    id: 9001,
    display_id: 9001,
    transaction_date: "2026-03-01T00:00:00Z",
    total_order: 42,
    total_item_price: "37.50",
    total_tax: "0.00",
    total_shipping: "4.50",
    currency_code: "USD",
    status: "captured",
    _links: { self: { href: "/s/9001" } },
    _embedded: { "fx:items": [{ name: "Coffee", quantity: 1, price: 42 }] },
    ...overrides,
  };
}

/** A subscription whose `fx:transactions` link resolves to `payments`. */
function subscriptionWithPayments(payments: unknown[]) {
  return subscription({
    _links: {
      self: { href: "/s/1042" },
      "fx:transactions": {
        href: "/s/42/transactions",
        get: async () => ({
          ok: true,
          status: 200,
          json: async () => ({
            total_items: payments.length,
            _embedded: { "fx:transactions": payments },
          }),
        }),
      },
    },
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
    settings?: unknown;
  } = {},
) {
  screen = mountScreen(
    <SubscriptionPage
      subscription={(overrides.subscription ?? subscription()) as never}
      settings={(overrides.settings ?? null) as never}
      cartDisplayConfig={overrides.cartDisplayConfig as never}
      paymentMethodLink={overrides.paymentMethodLink as never}
      onBack={vi.fn()}
    />,
    {},
  );
}

/**
 * A subscription whose `_links` carry `fx:sub_token_url`, like the Edit-link
 * test's fixture below -- `self` and `fx:transactions` have to be repeated
 * alongside it since overriding `_links` replaces it wholesale.
 */
function subscriptionWithTokenUrl(overrides: Record<string, unknown> = {}) {
  return subscription({
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
    ...overrides,
  });
}

/**
 * Scoped to the rail's own `<aside>` -- see `billingSectionText`/
 * `itemsSectionText` above for why a whole-`document.body` match is the
 * vacuous-test trap on this page. `/Shipping/`, for instance, is also
 * satisfied by the Billing section's "Shipping address" label, so a rail
 * assertion has to be scoped here to actually exercise the rail.
 */
const railText = () => document.querySelector("aside")?.textContent ?? "";

/**
 * The next-payment date picker's trigger. Base UI's `Popover.Trigger` marks
 * itself `aria-haspopup="dialog"`, which no other control in the rail does.
 */
const nextDatePickerTrigger = () =>
  screen!.host.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="dialog"]',
  );

/**
 * The calendar sits inside the popover, so it is not in the DOM at all until
 * the trigger is clicked -- any test reaching for a `[data-day]` button has to
 * open it first.
 *
 * It also lands in `document.body`, not `screen.host`: the popup portals to
 * `container`, and `mountScreen` wraps nothing in `PortalContainerContext`, so
 * `usePortalContainer()` is null and Base UI falls back to the body. In the
 * element proper that context supplies the shadow root instead.
 */
async function openNextDatePicker() {
  act(() => nextDatePickerTrigger()?.click());
  await flush();
}

const calendarDays = () => [
  ...document.body.querySelectorAll<HTMLButtonElement>("button[data-day]"),
];

/** Settings that let both rail controls render, for the save-on-change tests. */
const EDITABLE_SETTINGS = {
  subscriptions: {
    allow_frequency_modification: [
      { jsonata_query: "*", values: ["1m", "1y"] },
    ],
    allow_next_date_modification: true,
  },
};

/** The frequency `Select`'s trigger -- Base UI marks it `aria-haspopup="listbox"`. */
const frequencyTrigger = () =>
  screen!.host.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="listbox"]',
  );

/**
 * Opens the frequency Select and clicks one option BY ITS RENDERED LABEL --
 * "Yearly", not the wire value "1y". The Select shows human-readable labels
 * while keeping the API's own strings as its values, so matching on the
 * label is what proves the customer-facing half.
 *
 * Like the date picker's popup, the listbox portals out of `screen.host`
 * (see `openNextDatePicker`), so the options are queried from `document.body`.
 */
async function pickFrequency(label: string) {
  act(() => frequencyTrigger()?.click());
  await flush();

  const option = [...document.body.querySelectorAll<HTMLElement>('[role="option"]')].find(
    (el) => (el.textContent ?? "").trim() === label,
  );
  expect(option, `no "${label}" option in the frequency Select`).toBeTruthy();

  act(() => option!.click());
  await flush();
}

/**
 * Scoped to the past-due `Alert` itself. `querySelectorAll("div")` returns
 * document order, so a `.find` over every div that *contains* "Payment
 * failed" hands back the OUTERMOST match -- the page layout wrapper, whose
 * text starts with the Back button. That made the positive assertions unable
 * to tell "this copy is in the alert" from "this copy is anywhere on the
 * page", and coupled the `$0.00` assertion to the fixture's unrelated
 * `total_shipping`/`total_tax`.
 *
 * Anchors on the leaf title div and takes its parent (the `Alert.Root`)
 * instead -- the same shape as `paymentHistoryHeaderRow`'s "Order" cell.
 */
/**
 * Scoped to the page header -- the flex column holding the title line and
 * the ended note. `document.body` would also match the rail's own date
 * rows, which is the whole point of the `show_sub_enddate` test below.
 */
const headerText = () =>
  document.querySelector("h1")?.parentElement?.parentElement?.textContent ??
  "";

const pastDueAlertText = () => {
  const title = [...document.querySelectorAll("div")].find(
    (el) =>
      el.children.length === 0 && el.textContent?.trim() === "Payment failed",
  );
  return title?.parentElement?.textContent ?? "";
};

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

    // `/42/` alone was satisfied by the fixture's `total_order: 42`
    // rendering as "$42.00", whatever the id turned out to be. The id is
    // the last segment of the self link (`/s/1042`).
    expect(screen.host.querySelector("h1")?.textContent).toMatch(/#1042/);
    const buttons = [...screen.host.querySelectorAll("button")];
    expect(buttons.some((b) => /^back$/i.test(b.textContent ?? ""))).toBe(true);
  });

  it("closes the main column with the payment history section", async () => {
    // Was "shows the payment history below the manage controls", asserting
    // `/payments/i` and `/no payments yet/i` against the whole host. The
    // heading is "Payment history" -- no "payments" in it -- so
    // `messages.paymentsEmpty` ("No payments yet.") satisfied both patterns
    // by itself and the entire heading could be deleted with the test still
    // green. The old name was also no longer true: the manage controls moved
    // into the rail, which follows the main column in DOM order.
    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription() as never}
        settings={null}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    const heading = [...screen.host.querySelectorAll("h2")].find(
      (h) => h.textContent?.trim() === "Payment history",
    );
    expect(heading).toBeDefined();

    const section = heading!.closest("section")!;
    expect(section.textContent).toMatch(/No payments yet/);

    // Spec §5's left column, in order, with this section last.
    const main = section.parentElement!;
    expect(main.lastElementChild).toBe(section);
    expect(
      [...main.querySelectorAll("h2")].map((h) => h.textContent?.trim()),
    ).toEqual(["Items (2)", "Billing & shipping", "Payment history"]);
  });

  // Locates the header row by its "Order" cell rather than
  // `document.body.textContent` -- the whole page (and, from Task 8 on, a
  // "Summary" rail beside this section) is not what this test is about. The
  // claim is narrower: the *table* has no Summary *column*.
  const paymentHistoryHeaderRow = () => {
    const orderCell = [...document.querySelectorAll("div")].find(
      (el) => el.children.length === 0 && el.textContent?.trim() === "Order",
    );
    return orderCell?.parentElement ?? null;
  };

  it("renders payment history without a summary column", async () => {
    render({ subscription: subscriptionWithPayments([payment()]) });
    await flush();

    const headerRow = paymentHistoryHeaderRow();
    expect(headerRow).not.toBeNull();
    // Column headings, minus Summary.
    expect(headerRow!.textContent).toMatch(/Order/);
    expect(headerRow!.textContent).toMatch(/Amount/);
    expect(headerRow!.textContent).not.toMatch(/Summary/);
  });

  it("asks for no item zoom on the payments it never summarises", async () => {
    // The table renders with `withSummary={false}`, and the `fx:items`
    // embed feeds only that cell -- so `zoom: "items"` fetched a
    // per-transaction item array on every page load that nothing rendered.
    // (`orders/list.test.tsx` pins the home page's own zoom, which does
    // render the Summary cell and must keep it.)
    const spy = vi.fn(async (_query?: Record<string, unknown>) => ({
      ok: true,
      status: 200,
      json: async () => ({ total_items: 0, _embedded: {} }),
    }));

    render({
      subscription: subscription({
        _links: {
          self: { href: "/s/1042" },
          "fx:transactions": { href: "/s/42/transactions", get: spy },
        },
      }),
    });
    await flush();

    expect(spy).toHaveBeenCalled();
    const [query] = spy.mock.calls.at(-1) ?? [];
    expect(query).not.toHaveProperty("zoom");
  });

  it("gives its payment rows no click target", async () => {
    // The page passes no `onOpen` -- there is nowhere for a click to go from
    // a subscription's own payment history. It used to pass a no-op handler,
    // which rendered a real focusable <button> per row that did nothing.
    render({ subscription: subscriptionWithPayments([payment()]) });
    await flush();

    const section =
      [...document.querySelectorAll("h2")]
        .find((h) => /^Payment history/.test(h.textContent ?? ""))
        ?.closest("section") ?? null;
    expect(section).not.toBeNull();

    // The row's own cells are there...
    expect(section!.textContent).toMatch(/9001/);
    // ...and nothing in the section is focusable (there is no pager either,
    // with a single payment).
    expect(section!.querySelectorAll("button")).toHaveLength(0);
  });

  it("lays out the payment history header on the narrow (no-Summary) column set", async () => {
    // Above 640px, matching row.test.tsx's own desktop-grid tests -- see the
    // top-of-file comment on why the viewport is set here and restored in
    // `afterEach`.
    await page.viewport(900, 900);
    render({ subscription: subscriptionWithPayments([payment()]) });
    await flush();

    const headerRow = paymentHistoryHeaderRow();
    expect(headerRow).not.toBeNull();
    // Order, Date, Amount, Status, Receipt -- five tracks, not the six the
    // home page's order table uses.
    expect(
      getComputedStyle(headerRow as Element).gridTemplateColumns.split(" "),
    ).toHaveLength(5);
  });

  it("saves a picked date immediately, without leaving the page", async () => {
    const patch = vi.fn(async (_body: unknown) => ({ ok: true, status: 200 }));
    const onBack = vi.fn();

    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription({}, patch) as never}
        settings={EDITABLE_SETTINGS as never}
        onBack={onBack}
      />,
      {},
    );
    await flush();

    await openNextDatePicker();

    act(() => {
      const day = calendarDays().find((button) => !button.disabled);
      day?.click();
    });
    await flush();

    // The write goes out on the pick itself -- there is no Save button left
    // to press, and the rail's note has always promised exactly this.
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch.mock.calls[0]?.[0]).toMatchObject({
      next_transaction_date: expect.any(String),
    });

    // Staying put is the half that used to be wrong: `handleSave` called
    // `onBack()` on success, which for a control the customer may adjust
    // twice would throw them off the page on the first change.
    expect(onBack).not.toHaveBeenCalled();
  });

  it("keeps showing a saved value instead of snapping back", async () => {
    // Mounted through the CONTAINER, not `SubscriptionPage` directly: the
    // container is what fetches, and the bug this pins only exists on that
    // path. Rendering the page with a ready-made `subscription` prop never
    // remounts, so the same assertions pass either way -- they did, and the
    // ablation caught it.
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));

    // A read that keeps answering with the ORIGINAL frequency, which is the
    // real situation here: nothing re-reads the subscriptions collection
    // while the customer is on this page.
    const link = {
      href: "/subs",
      get: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          total_items: 1,
          _embedded: { "fx:subscriptions": [subscription({}, patch)] },
        }),
      })),
    };

    screen = mountScreen(
      <SubscriptionPageContainer
        id="1042"
        subscriptionsLink={link as never}
        settings={EDITABLE_SETTINGS as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    await pickFrequency("Yearly");
    expect(patch).toHaveBeenCalled();

    // `saveChange` used to `cache.clear()` on success. That was harmless
    // only while the old flow cleared and immediately navigated home;
    // clearing while STAYING here drops this page's cached resources, so the
    // container unmounts the page to a skeleton and back, losing the local
    // `frequency` -- and the remounted page reads whatever the re-read
    // returns, which is the pre-write value. A save that worked looked like
    // a silent revert.
    expect(frequencyTrigger()?.textContent).toMatch(/Yearly/);
    expect(railText()).not.toMatch(/could not save/i);
  });

  it("refreshes the rest of the portal on the way out, but only after a save", async () => {
    const clear = vi.spyOn(RequestCache.prototype, "clear");
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));
    const onBack = vi.fn();

    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription({}, patch) as never}
        settings={EDITABLE_SETTINGS as never}
        onBack={onBack}
      />,
      {},
    );
    await flush();

    const back = [...screen.host.querySelectorAll("button")].find((b) =>
      /^back$/i.test((b.textContent ?? "").trim()),
    );

    // Leaving without touching anything must not throw away everyone else's
    // cached data for nothing.
    act(() => back!.click());
    expect(clear).not.toHaveBeenCalled();
    expect(onBack).toHaveBeenCalledTimes(1);

    await pickFrequency("Yearly");
    expect(patch).toHaveBeenCalled();

    // After a write it must clear: the home page's subscription card renders
    // this frequency from a cached collection, so it would otherwise still
    // show the old value.
    act(() => back!.click());
    expect(clear).toHaveBeenCalled();

    clear.mockRestore();
  });

  it("marks the frequency Select as a menu, not a text field", () => {
    // Without an affordance the trigger is a bordered box with a word in it
    // -- indistinguishable from the read-only frequency row it replaces, and
    // from the date field below it.
    render({ settings: EDITABLE_SETTINGS });

    const icon = frequencyTrigger()?.querySelector("svg");
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("opens the cancel link in a new tab, as its icon promises", () => {
    render({ subscription: subscriptionWithTokenUrl() });

    const cancel = [...document.querySelectorAll("aside a")].find((a) =>
      /cancel/i.test(a.textContent ?? ""),
    ) as HTMLAnchorElement | undefined;

    expect(cancel?.getAttribute("href")).toMatch(/sub_cancel=true/);
    expect(cancel?.querySelector("svg")).toBeTruthy();

    // The icon and the target have to agree. An external-link icon over a
    // same-tab navigation is a lie the customer only finds out by losing
    // the page they were on.
    expect(cancel?.target).toBe("_blank");
    expect(cancel?.rel).toBe("noreferrer");
  });

  it("puts no open-in-new icon on a cancel link that opens nothing", () => {
    // The already-scheduled case renders inert: `aria-disabled`, no href.
    // An icon there would promise a tab that never opens.
    render({ subscription: subscriptionWithTokenUrl({ end_date: future }) });

    const cancel = [...document.querySelectorAll("aside a")].find((a) =>
      /cancel/i.test(a.textContent ?? ""),
    );

    expect(cancel?.getAttribute("aria-disabled")).toBe("true");
    expect(cancel?.hasAttribute("href")).toBe(false);
    expect(cancel?.querySelector("svg")).toBeNull();
  });

  it("marks every hosted-cart link-out the same way", () => {
    // Modify items, the shipping Edit and Cancel subscription all leave the
    // portal for Foxy's hosted cart. They are the page's only external
    // destinations, so a customer who learns what the icon means on one
    // should not be surprised by another opening in place.
    render({
      subscription: subscriptionWithTokenUrl({
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
          "fx:sub_modification_url": { href: "https://example.com/modify" },
        },
      }),
    });

    const byLabel = (pattern: RegExp) =>
      [...document.querySelectorAll("a")].find((a) =>
        pattern.test((a.textContent ?? "").trim()),
      ) as HTMLAnchorElement | undefined;

    const linkOuts = [
      ["Modify items", byLabel(/^modify items$/i)],
      ["shipping Edit", byLabel(/^edit$/i)],
      ["Cancel subscription", byLabel(/cancel subscription/i)],
    ] as const;

    for (const [name, link] of linkOuts) {
      expect(link, `${name} did not render`).toBeTruthy();
      expect(link!.target, `${name} target`).toBe("_blank");
      expect(link!.rel, `${name} rel`).toBe("noreferrer");
      expect(link!.querySelector("svg"), `${name} icon`).toBeTruthy();
    }
  });

  it("saves a changed frequency immediately", async () => {
    const patch = vi.fn(async (_body: unknown) => ({ ok: true, status: 200 }));

    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription({}, patch) as never}
        settings={EDITABLE_SETTINGS as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    await pickFrequency("Yearly");

    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch.mock.calls[0]?.[0]).toEqual({ frequency: "1y" });
  });

  it("puts a control back and explains when the save fails", async () => {
    const patch = vi.fn(async () => {
      throw new Error("nope");
    });

    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription({}, patch) as never}
        settings={EDITABLE_SETTINGS as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    await pickFrequency("Yearly");

    expect(patch).toHaveBeenCalled();

    // With no Save button there is nothing left to signal "not saved yet",
    // so a control still showing the rejected value would be lying about
    // the subscription. It has to read the fixture's original "1m" again.
    expect(frequencyTrigger()?.textContent).toMatch(/Monthly/);
    expect(frequencyTrigger()?.textContent).not.toMatch(/Yearly/);
    expect(railText()).toMatch(/could not save/i);
  });

  it("reports a failed save in the rail, beside the control", async () => {
    const patch = vi.fn(async () => {
      throw new Error("nope");
    });

    screen = mountScreen(
      <SubscriptionPage
        subscription={subscription({}, patch) as never}
        settings={EDITABLE_SETTINGS as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    await pickFrequency("Yearly");

    // Scoped deliberately: this alert used to render at the top of the LEFT
    // column, which at 1080px is a whole column away from the control that
    // failed and is off screen entirely once the columns stack.
    const main = screen!.host.querySelector("main, div > section")?.parentElement;
    expect(railText()).toMatch(/could not save/i);
    expect(main?.textContent ?? "").not.toMatch(/could not save/i);
  });

  it("keeps the next payment calendar inside a popover", async () => {
    render({
      settings: {
        subscriptions: {
          allow_frequency_modification: [
            { jsonata_query: "*", values: ["1m", "1y"] },
          ],
          allow_next_date_modification: true,
        },
      },
    });
    await flush();

    // The point of the change: a month grid no longer sits open in a 320px
    // rail. Asserting on `calendarDays()` rather than the trigger, because a
    // trigger that renders while the calendar ALSO stays inline would still
    // satisfy a trigger-only assertion.
    expect(nextDatePickerTrigger()).not.toBeNull();
    expect(calendarDays()).toHaveLength(0);

    await openNextDatePicker();
    expect(calendarDays().length).toBeGreaterThan(0);
  });

  it("labels the date picker trigger with the current next payment date", async () => {
    render({
      settings: {
        subscriptions: {
          allow_frequency_modification: [
            { jsonata_query: "*", values: ["1m", "1y"] },
          ],
          allow_next_date_modification: true,
        },
      },
    });
    await flush();

    // The fixture's `next_transaction_date` is 2099-01-01. A closed picker
    // showing nothing would read as missing data, so the trigger states the
    // date the subscription already has -- without that counting as a pending
    // edit, which is why `nextDate` stays undefined until a day is clicked.
    expect(nextDatePickerTrigger()?.textContent).toMatch(/2099/);
    expect(nextDatePickerTrigger()?.textContent).not.toMatch(/Choose a date/);
  });

  it("closes the picker once a date is chosen", async () => {
    render({
      settings: {
        subscriptions: {
          allow_frequency_modification: [
            { jsonata_query: "*", values: ["1m", "1y"] },
          ],
          allow_next_date_modification: true,
        },
      },
    });
    await flush();

    await openNextDatePicker();
    expect(calendarDays().length).toBeGreaterThan(0);

    act(() => {
      calendarDays().find((button) => !button.disabled)?.click();
    });
    await flush();

    // Base UI keeps the popup mounted through its exit transition, so the
    // unmount has to be waited for rather than asserted synchronously. It
    // MUST actually unmount: a popup left mounted is 35 invisible but
    // focusable day buttons sitting in the tab order.
    await vi.waitFor(
      () => {
        expect(document.body.querySelector('[role="dialog"]')).toBeNull();
      },
      { timeout: 2000 },
    );
  });

  it("heads the page with the subscription's items and id", () => {
    render();
    expect(document.body.textContent).toMatch(/#1042/);
  });

  it("heads a bundle with the parent's name, like the card the customer clicked", () => {
    // `card.tsx` derives its title through `groupLineItems`, which
    // shows only the parent for a bundle. The page joined every raw
    // `item.name`, so a card headed "Coffee Subscription" opened a page
    // headed "Coffee Subscription, Extra Filters, Coffee Mugs". Both now go
    // through `lineItemsTitle`.
    render({
      subscription: subscription({
        items: [
          { name: "Coffee Subscription", quantity: 1, price: 30, code: "SUB" },
          {
            name: "Extra Filters",
            quantity: 1,
            price: 0,
            code: "F",
            parent_code: "SUB",
          },
          {
            name: "Coffee Mugs",
            quantity: 2,
            price: 0,
            code: "M",
            parent_code: "SUB",
          },
        ],
      }),
    });

    const heading = document.querySelector("h1")!;
    expect(heading.textContent).toMatch(/Coffee Subscription/);
    expect(heading.textContent).not.toMatch(/Extra Filters/);
    expect(heading.textContent).not.toMatch(/Coffee Mugs/);

    // The Items section still lists all three -- spec §6.3 counts and pages
    // the full array, and the children are items the customer pays for.
    expect(itemsSection()?.textContent).toMatch(/Items \(3\)/);
    expect(itemsSection()?.textContent).toMatch(/Extra Filters/);
  });

  it("heads a non-bundle with each item's quantity, like the card does", () => {
    render({
      subscription: subscription({
        items: [{ name: "Coffee", quantity: 3, price: 5 }],
      }),
    });

    expect(document.querySelector("h1")!.textContent).toMatch(/Coffee ×3/);
  });

  it("falls back to the id alone when the template has no items", () => {
    render({ subscription: subscription({ items: [] }) });

    // Not " (#1042)" with a leading space.
    expect(document.querySelector("h1")!.textContent).toBe("(#1042)");
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
    expect(headerText()).toMatch(/No further payments/);
    // The date shows by default -- the positive half of the
    // `show_sub_enddate` pair below. `past` is 2020-01-01.
    expect(headerText()).toMatch(/2020/);
  });

  it("keeps the date out of the ended note when the store hides end dates", () => {
    // The rail's Ends row and the cancel-scheduled note both gate on
    // `showEndDate`; this note named `endsAt` unconditionally. Before this
    // branch `failed_and_ended` never reached the note at all, so finding
    // 3's fix is what made the leak reachable.
    render({
      subscription: subscription({ is_active: false, end_date: past }),
      cartDisplayConfig: { show_sub_enddate: false },
    });

    // The substance survives: it ended, nothing more will be charged.
    expect(headerText()).toMatch(/has ended/i);
    expect(headerText()).toMatch(/No further payments/);
    // The hidden date does not.
    expect(headerText()).not.toMatch(/2020/);
    // And the rail agrees.
    expect(railText()).not.toMatch(/Ends/);
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

  it("names no amount in the past-due alert when there is none", () => {
    // A failure date with no `past_due_amount`. The alert must still appear
    // -- the payment genuinely failed -- but it must not state $0.00 as the
    // sum owed, which is what passing `past_due_amount ?? 0` straight to
    // `formatNumber` produced. The rail's own Past due row already hides
    // itself here, so the two used to contradict each other on one screen.
    render({ subscription: subscription({ first_failed_transaction_date: past }) });

    expect(pastDueAlertText()).toMatch(/Payment failed/);
    expect(pastDueAlertText()).toMatch(/A payment could not be taken/);
    expect(pastDueAlertText()).not.toMatch(/\$0\.00/);
    expect(railText()).not.toMatch(/Past due/);
  });

  it("drops the call to action from the alert once the subscription has ended", () => {
    // Spec §6.2's body ends "Update your payment method on the portal home
    // page to continue using this subscription." For `failed_and_ended`
    // there is nothing to continue -- the header says so four lines up --
    // so the customer was being told to go fix a payment method for a dead
    // subscription.
    render({
      subscription: subscription({
        is_active: false,
        end_date: past,
        first_failed_transaction_date: past,
        past_due_amount: 24,
      }),
    });

    // The alert still reports what happened, amount and all.
    expect(pastDueAlertText()).toMatch(/Payment failed/);
    expect(pastDueAlertText()).toMatch(/\$24\.00/);
    expect(pastDueAlertText()).toMatch(/before this subscription ended/);
    // ...but asks for nothing.
    expect(pastDueAlertText()).not.toMatch(/continue using this subscription/);
    expect(pastDueAlertText()).not.toMatch(/Update your payment method/);
  });

  it("keeps the call to action while the subscription is still live", () => {
    // The other half of the pair: spec §6.2's copy is right for a live
    // failed subscription and must survive the ended variant being added.
    render({
      subscription: subscription({
        first_failed_transaction_date: past,
        past_due_amount: 24,
      }),
    });

    expect(pastDueAlertText()).toMatch(/continue using this subscription/);
    expect(pastDueAlertText()).not.toMatch(/before this subscription ended/);
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
      // `closest("section")`, not `parentElement`: the Items heading now
      // sits inside a `SectionHeader` row alongside the "Modify items"
      // link-out, so `parentElement` would scope this to the heading row
      // and pass every "not present" assertion for the wrong reason.
      return heading?.closest("section")?.textContent ?? "";
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

  /**
   * A subscription carrying `fx:sub_modification_url`. Like
   * `subscriptionWithTokenUrl`, overriding `_links` replaces it wholesale,
   * so `self` and `fx:transactions` are repeated alongside it.
   */
  function subscriptionWithModifyUrl(overrides: Record<string, unknown> = {}) {
    return subscription({
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
        "fx:sub_modification_url": { href: "https://example.com/cart?mod=x" },
      },
      ...overrides,
    });
  }

  const itemsSection = () =>
    [...document.querySelectorAll("h2")]
      .find((h) => /^Items/.test(h.textContent ?? ""))
      ?.closest("section") ?? null;

  it("keeps the Modify items link-out in the Items section", () => {
    // Spec §3 lists this as one of the two hosted link-outs and §9 says it
    // stays one. It was dropped in the redesign; this pins it to the section
    // whose contents it modifies, not just to the page.
    render({ subscription: subscriptionWithModifyUrl() });

    const section = itemsSection();
    expect(section).not.toBeNull();

    const modify = [...section!.querySelectorAll("a")].find((a) =>
      /^modify items$/i.test(a.textContent?.trim() ?? ""),
    );
    expect(modify?.getAttribute("href")).toBe("https://example.com/cart?mod=x");
  });

  it("drops the Modify items link once the subscription has ended", () => {
    render({
      subscription: subscriptionWithModifyUrl({
        is_active: false,
        end_date: past,
      }),
    });

    expect(document.body.textContent).not.toMatch(/Modify items/);
  });

  // Scoped to the Billing & shipping section's own subtree -- see the
  // pager test above for why a whole-`document.body` match can pass for
  // the wrong reason on this page.
  const billingSectionText = () => {
    const heading = [...document.querySelectorAll("h2")].find((h) =>
      /^Billing & shipping/.test(h.textContent ?? ""),
    );
    return heading?.closest("section")?.textContent ?? "";
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

  it("hides the shipping row when the template carries no address", () => {
    // A digital-only subscription's template has no shipping fields. The row
    // used to render its heading and a live Edit link-out over two empty
    // lines -- an edit affordance for an address that does not exist.
    render({
      subscription: subscriptionWithTokenUrl({
        _embedded: {
          "fx:transaction_template": {
            currency_code: "USD",
            total_order: 42,
            _embedded: { "fx:items": DEFAULT_ITEMS },
          },
        },
      }),
    });

    // The panel itself is still there -- only the shipping row is gone.
    expect(billingSectionText()).toMatch(/Payment method/);
    expect(billingSectionText()).not.toMatch(/Shipping address/);
    expect(billingSectionText()).not.toMatch(/Edit/);
  });

  it("hides the save note when no editable control renders", () => {
    // `settings: null` (the default `render()`) leaves `frequencies` empty
    // and `dateRules` false, so neither the Select nor the Calendar renders.
    // The rail used to promise "Changes save immediately and apply to the
    // next payment." with nothing above it that could change.
    render();

    expect(railText()).not.toMatch(/Changes save immediately/);
  });

  it("keeps the save note when a control does render", () => {
    // The other half of the pair: the gate must not have taken the note away
    // from the case it exists for.
    render({ settings: EDITABLE_SETTINGS });

    expect(railText()).toMatch(/Changes save immediately/);
  });

  it("offers no Save button anywhere, now that changes write on change", () => {
    render({ settings: EDITABLE_SETTINGS });

    // Asserted across the whole page rather than the rail: a Save button
    // left anywhere would contradict the note the rail displays.
    expect(
      [...document.querySelectorAll("button")].some((b) =>
        /^(save|saving)/i.test((b.textContent ?? "").trim()),
      ),
    ).toBe(false);
  });

  it("renders exactly one summary rail", () => {
    render();
    expect(document.querySelectorAll("aside")).toHaveLength(1);
  });

  it("makes the rail's Summary title a real heading", async () => {
    // Spec §6.6 calls it a heading. As a styled `<div>` it was the one
    // section of this page a screen reader's heading list did not offer.
    render();

    const summary = [...document.querySelectorAll("aside h2")].find(
      (h) => h.textContent?.trim() === "Summary",
    );
    expect(summary).toBeDefined();

    // The styling is meant to be untouched by the element swap -- `font.h3`,
    // and no UA margin creeping in now that it is a heading.
    const style = getComputedStyle(summary!);
    expect(style.marginTop).toBe("0px");
    expect(style.marginBottom).toBe("0px");
  });

  it("summarises the recurring cost", () => {
    render();
    expect(railText()).toMatch(/Recurring total/);
    expect(railText()).toMatch(/\$42\.00/);
    expect(railText()).toMatch(/\$4\.50/);
    expect(railText()).toMatch(/\$2\.25/);
    expect(railText()).toMatch(/Shipping/);
    expect(railText()).toMatch(/Tax/);
  });

  it("shows a past-due line only when there is one", () => {
    render();
    expect(railText()).not.toMatch(/Past due/);

    screen!.unmount();
    render({ subscription: subscription({ past_due_amount: 24 }) });
    expect(railText()).toMatch(/Past due/);
  });

  it("offers cancellation while the subscription is live", () => {
    render({ subscription: subscriptionWithTokenUrl() });

    const cancel = [...document.querySelectorAll("a")].find((a) =>
      /cancel/i.test(a.textContent ?? ""),
    );
    expect(cancel?.getAttribute("href")).toMatch(/sub_cancel=true/);
    expect(railText()).toMatch(/Access continues until/);
  });

  it("offers no cancellation once it has ended", () => {
    render({
      subscription: subscriptionWithTokenUrl({
        is_active: false,
        end_date: past,
      }),
    });

    const cancel = [...document.querySelectorAll("a")].find((a) =>
      /cancel/i.test(a.textContent ?? ""),
    );
    expect(cancel).toBeUndefined();
    expect(document.body.textContent).not.toMatch(/Access continues until/);
  });

  it("disables (rather than activates) the cancel link once a cancellation is already scheduled", () => {
    // `is_active` stays true and `end_date` alone moves to the future --
    // `getSubscriptionStatus` reads this as "will_end", not "ended", so
    // `isEnded` is false and the old `!isEnded` gate alone would have let an
    // active link through. The link must still come out disabled because a
    // cancellation is already queued.
    render({
      subscription: subscriptionWithTokenUrl({ end_date: future }),
    });

    const cancel = [...document.querySelectorAll("aside a")].find((a) =>
      /cancel/i.test(a.textContent ?? ""),
    );
    expect(cancel).toBeDefined();
    expect(cancel?.getAttribute("href")).toBeNull();
    expect(cancel?.getAttribute("aria-disabled")).toBe("true");
  });

  it("says why the disabled cancel link is disabled", () => {
    // `aria-disabled` on its own announces "unavailable" and stops there.
    // The reason has to be text, and it has to be tied to the link.
    render({
      subscription: subscriptionWithTokenUrl({ end_date: future }),
    });

    const cancel = [...document.querySelectorAll("aside a")].find((a) =>
      /cancel/i.test(a.textContent ?? ""),
    );
    const describedBy = cancel?.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    const note = document.getElementById(describedBy!);
    expect(note?.textContent).toMatch(/already scheduled to end on/i);
    // Built from the end date, not the next payment date -- `future` is
    // 2027-01-01 and `next_transaction_date` is 2099-01-01.
    expect(note?.textContent).toMatch(/2027/);

    // Added, not swapped in: spec §6.7 keeps "Access continues until
    // {next payment}" for every live subscription, and one with a
    // scheduled end date is still live.
    expect(railText()).toMatch(/Access continues until/);
  });

  it("keeps the date out of the cancel note when the store hides end dates", () => {
    // The rail's own Ends row gates on `endsAt && showEndDate`, so a store
    // with `show_sub_enddate: false` gets that row suppressed. The cancel
    // note named `endsAt` unconditionally and printed the very same date
    // two blocks below.
    render({
      subscription: subscriptionWithTokenUrl({ end_date: future }),
      cartDisplayConfig: { show_sub_enddate: false },
    });

    const cancel = [...document.querySelectorAll("aside a")].find((a) =>
      /cancel/i.test(a.textContent ?? ""),
    );
    const note = document.getElementById(
      cancel!.getAttribute("aria-describedby")!,
    );

    // The note still explains why the link is inert -- that is its job.
    expect(note?.textContent).toMatch(/already scheduled to end/i);
    // It just does not name the date the store chose to hide.
    expect(note?.textContent).not.toMatch(/2027/);
    // And the rail agrees: no Ends row either.
    expect(railText()).not.toMatch(/Ends/);
  });

  it("shows no editable controls once the subscription has ended", () => {
    // Permissive settings, matching "saves a changed frequency and returns
    // home" above -- if the rail's own `!isEnded` gate were missing, these
    // settings are exactly the ones that would let the Select/Calendar
    // through on the strength of `frequencies`/`dateRules` alone.
    render({
      subscription: subscription({ is_active: false, end_date: past }),
      settings: {
        subscriptions: {
          allow_frequency_modification: [
            { jsonata_query: "*", values: ["1m", "1y"] },
          ],
          allow_next_date_modification: true,
        },
      },
    });

    expect(
      [...document.querySelectorAll("aside button")].some((b) =>
        /^save$/i.test(b.textContent ?? ""),
      ),
    ).toBe(false);
    expect(document.querySelector("aside button[data-day]")).toBeNull();
  });

  it("treats a failed subscription that has also ended as ended", () => {
    // `getSubscriptionStatus` returns the distinct string
    // "failed_and_ended" when a failure and a past end date coincide, and
    // the old `isEnded` (`"ended" || "inactive"`) missed it entirely -- so
    // this state kept every editing control, kept the Billing & shipping
    // panel with its *live* `cart=checkout&sub_restart=auto` Edit link, and
    // never told the customer the subscription had ended. The token URL is
    // supplied here on purpose: without it the Edit link would be absent for
    // the wrong reason.
    render({
      subscription: subscriptionWithTokenUrl({
        is_active: false,
        end_date: past,
        first_failed_transaction_date: past,
        past_due_amount: 24,
      }),
      settings: {
        subscriptions: {
          allow_frequency_modification: [
            { jsonata_query: "*", values: ["1m", "1y"] },
          ],
          allow_next_date_modification: true,
        },
      },
    });

    // No live editing controls in the rail.
    expect(
      [...document.querySelectorAll("aside button")].some((b) =>
        /^save$/i.test(b.textContent ?? ""),
      ),
    ).toBe(false);
    expect(document.querySelector("aside button[data-day]")).toBeNull();

    // Billing & shipping is hidden (spec §6.4), so its Edit link-out is gone
    // rather than merely inert.
    expect(billingSectionText()).toBe("");
    expect(
      [...document.querySelectorAll("a")].some((a) =>
        /cart=checkout/.test(a.getAttribute("href") ?? ""),
      ),
    ).toBe(false);

    // And the header says so.
    expect(document.body.textContent).toMatch(/No further payments/);

    // The badge still reads Past due, not Ended: spec §6.1 puts "any
    // failed state" above "ended / inactive", so `isFailed` is tested
    // first in the message chain. Such a subscription shows the Past due
    // badge, the past-due alert and the ended note together, which is the
    // whole truth about it.
    expect(document.querySelector("h1")?.parentElement?.textContent).toMatch(
      /Past due/,
    );
    expect(
      document.querySelector("h1")?.parentElement?.textContent,
    ).not.toMatch(/Ended/);
  });

  it("badges nothing when the subscription's status cannot be determined", () => {
    // `start_date: null` makes `getSubscriptionStatus` return null. The old
    // ternary chain fell through to "Active", asserting health about a
    // record it knows nothing about.
    render({ subscription: subscription({ start_date: null }) });

    const header = document.querySelector("h1")?.parentElement;
    expect(header).not.toBeNull();
    expect(header!.textContent).not.toMatch(/Active/);
    expect(header!.textContent).not.toMatch(/Scheduled/);
    // The title and id still render -- the badge is what is withheld.
    expect(header!.textContent).toMatch(/#1042/);
  });

  it("shows the read-only schedule rows once the subscription has ended", () => {
    render({
      subscription: subscription({ is_active: false, end_date: past }),
    });
    expect(railText()).toMatch(/Started/);
    expect(railText()).toMatch(/Ends/);
    expect(railText()).toMatch(/Frequency/);
    expect(railText()).toMatch(/Monthly/);
  });

  it("shows the frequency as read-only text while live if the store won't let it change", () => {
    // Default `render()` passes `settings: null`, so `frequencies` resolves
    // to `[]` and the editable Select never renders -- previously that left
    // the frequency showing nowhere at all for a live subscription. Now the
    // read-only row picks it up instead.
    render();
    expect(railText()).toMatch(/Frequency/);
    expect(railText()).toMatch(/Monthly/);
  });

  it("keeps the rail sticky on a wide viewport", async () => {
    await page.viewport(1200, 900);
    render();

    const aside = document.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(getComputedStyle(aside as Element).position).toBe("sticky");
  });

  it("drops the sticky rail once the columns stack on a narrow viewport", async () => {
    await page.viewport(500, 900);
    render();

    const aside = document.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(getComputedStyle(aside as Element).position).toBe("static");
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

    // Not `/42/`, which "$42.00" satisfies regardless of the id. `id="42"`
    // is what the container is asked for; `/s/1042` is what the fixture's
    // self link makes the page render.
    expect(screen.host.querySelector("h1")?.textContent).toMatch(/#1042/);
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
    expect(screen.host.querySelector("h1")?.textContent).toMatch(/#1042/);
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

    // The Calendar only mounts once the picker's popover is open, so the
    // matcher never runs until then.
    await openNextDatePicker();

    // The matcher has to have actually been invoked, or the assertion below
    // would pass vacuously because the loop never runs.
    expect(seenDates.length).toBeGreaterThan(0);

    for (const date of seenDates) {
      expect(Object.getPrototypeOf(date)).toBe(Date.prototype);
    }
  });
});
