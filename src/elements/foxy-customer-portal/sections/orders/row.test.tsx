// src/elements/foxy-customer-portal/sections/orders/row.test.tsx
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { page } from "vitest/browser";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { OrderRow, SUBSCRIPTION_ORDER_COLUMNS } from "./row";

let screen: MountedScreen | null = null;

// This suite's default iframe is 414x896 (confirmed by probing
// `window.innerWidth`), which is under row.tsx's 640px MOBILE breakpoint --
// see pagination.test.tsx's "Their slots are hidden below 640px" comment for
// the same constraint elsewhere in this element. The desktop grid tests below
// widen the viewport for the duration of the test and this hook restores it
// unconditionally, so a thrown assertion never leaks a wide viewport into a
// later test.
afterEach(async () => {
  act(() => screen?.unmount());
  screen = null;
  await page.viewport(414, 896);
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

  it("shows a Receipt link when the order has a receipt link", () => {
    render({
      order: order({
        _links: {
          self: { href: "/s/1" },
          "fx:receipt": { href: "https://example.test/receipt/1" },
        },
      }) as never,
    });

    const receipt = [...document.querySelectorAll("a")].find((a) =>
      /receipt/i.test(a.textContent ?? ""),
    );
    expect(receipt).toBeDefined();
    expect(receipt?.getAttribute("href")).toBe("https://example.test/receipt/1");
  });

  it("shows no Receipt link when the order has none", () => {
    render({ order: order({ _links: { self: { href: "/s/1" } } }) as never });

    const receipt = [...document.querySelectorAll("a")].find((a) =>
      /receipt/i.test(a.textContent ?? ""),
    );
    expect(receipt).toBeUndefined();
  });

  it("lets the row's button actually receive keyboard focus", () => {
    // Regression guard for the bug the visible-focus fix below depends on:
    // `OpenButton` used to be `display: contents`, which in real Chromium
    // gives the button no layout box at all, so it silently could not
    // receive focus -- `button.focus()` was a no-op and
    // `document.activeElement` stayed on `<body>`, confirmed against this
    // repo's actual `@vitest/browser-playwright` Chromium instance (not
    // jsdom, which does not model this correctly). Keyboard users could not
    // reach the row at all, let alone see a focus ring. If a future edit
    // reintroduces `display: contents` here, this assertion catches it even
    // if the `:has()` rule below is left in place (which would otherwise
    // stay silently inert).
    render();

    const button = document.querySelector("button");
    expect(button).toBeInstanceOf(HTMLButtonElement);

    act(() => button?.focus());

    expect(document.activeElement).toBe(button);
  });

  it("shows a visible focus indicator on the row when its button has keyboard focus", () => {
    render();

    const button = document.querySelector("button");
    expect(button).toBeInstanceOf(HTMLButtonElement);
    // `Row` is the outer `styled.div` wrapping `OpenButton`; the focus style
    // lives on `Row`, keyed off `:has(button:focus-visible)`, since that's
    // the ancestor that still generates a real box to paint an outline on.
    const row = button?.parentElement;
    expect(row).toBeInstanceOf(HTMLDivElement);

    // Before focus: the `:has(button:focus-visible)` rule doesn't match,
    // and `Row` sets no other outline, so the resolved outline is "none".
    expect(row?.matches(":has(button:focus-visible)")).toBe(false);
    expect(getComputedStyle(row as Element).outlineStyle).toBe("none");

    act(() => button?.focus());

    // A real Chromium instance (this suite runs on `@vitest/browser-playwright`,
    // not jsdom) marks a script-focused button as focus-visible, so both the
    // selector match and the resolved `outline-style` flip once the fix is in
    // place.
    expect(document.activeElement).toBe(button);
    expect(row?.matches(":has(button:focus-visible)")).toBe(true);
    expect(getComputedStyle(row as Element).outlineStyle).toBe("solid");
  });

  it("lays out on the default columns", async () => {
    // Above 640px so `Row`'s MOBILE override (`grid-template-columns: 1fr
    // auto`, 2 tracks) doesn't win over `rowGrid` -- see the note by
    // `afterEach` above.
    await page.viewport(900, 800);
    render();
    const row = document.querySelector("button")!.parentElement!;
    // Six tracks: Order, Date, Summary, Amount, Status, Receipt.
    expect(
      getComputedStyle(row).gridTemplateColumns.split(" "),
    ).toHaveLength(6);

    // Receipt has to land in the final track in both configurations (see the
    // sibling test below for the five-column case).
    const receiptCell = row.lastElementChild!;
    expect(receiptCell.textContent).not.toMatch(/98213/);
    const openButton = document.querySelector("button")!;
    expect(getComputedStyle(openButton).gridColumn).toBe("1 / 6");
  });

  it("drops the summary cell and narrows to five columns when asked", async () => {
    await page.viewport(900, 800);
    screen = mountScreen(
      <OrderRow
        order={order() as never}
        onOpen={() => {}}
        columns={SUBSCRIPTION_ORDER_COLUMNS}
        withSummary={false}
      />,
      {},
    );

    const row = document.querySelector("button")!.parentElement!;
    expect(
      getComputedStyle(row).gridTemplateColumns.split(" "),
    ).toHaveLength(5);
    // The summary text is what the dropped cell carried.
    expect(document.body.textContent).not.toMatch(/Coffee/);
    // Everything else still renders.
    expect(document.body.textContent).toMatch(/98213/);
    expect(document.body.textContent).toMatch(/\$42\.50/);

    // Receipt still lands in the final (5th) track, not swallowed by
    // OpenButton's narrower span.
    const openButton = document.querySelector("button")!;
    expect(getComputedStyle(openButton).gridColumn).toBe("1 / 5");
    const receiptCell = row.lastElementChild!;
    expect(receiptCell).not.toBe(openButton);
    expect(receiptCell.contains(openButton)).toBe(false);
  });
});
