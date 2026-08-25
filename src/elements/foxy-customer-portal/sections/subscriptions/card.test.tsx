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

// A store-timezone date `days` from now, in the shape the API really sends.
// See the original file's comment (preserved in spirit): a late fixed
// time-of-day with an explicit non-UTC offset, wide enough day-count
// offsets that the few hours' shift never flips which side of "now" a date
// lands on.
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
      onNavigate={vi.fn()}
      {...props}
    />,
    {},
  );
  return screen;
}

describe("SubscriptionCard", () => {
  it("summarises flat items with their quantities as the title", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/Coffee/);
    expect(screen!.host.textContent).toMatch(/×2/);
    expect(screen!.host.textContent).toMatch(/Grinder/);
  });

  it("shows the price in the transaction template's currency", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/\$42/);
  });

  it("titles a bundled subscription with the parent item's name and lists children separately", () => {
    render(
      subscription({
        _embedded: {
          "fx:transaction_template": {
            currency_code: "USD",
            total_order: 38.5,
            _embedded: {
              "fx:items": [
                {
                  name: "Coffee Subscription — Dark Roast",
                  quantity: 1,
                  code: "COFFEE",
                },
                {
                  name: "Extra Filters",
                  quantity: 2,
                  parent_code: "COFFEE",
                },
              ],
            },
          },
        },
      }),
    );

    expect(screen!.host.textContent).toMatch(/Coffee Subscription — Dark Roast/);
    expect(screen!.host.textContent).toMatch(/Extra Filters/);
    expect(screen!.host.textContent).toMatch(/×2/);
  });

  it("shows an error alert when the subscription has one", () => {
    render(subscription({ error_message: "Card declined." }));
    expect(screen!.host.textContent).toMatch(/Card declined\./);
  });

  it("shows no error text when there is none", () => {
    render(subscription());
    expect(screen!.host.textContent).not.toMatch(/declined/i);
  });

  // The billing period is a suffix on the price ("$42.00/mo") rather than a
  // line of its own, so these assert the composed string, not the presence of
  // a separate sentence.
  it("suffixes the price with the billing period by default", () => {
    render(subscription({ frequency: "1m" }));
    expect(screen!.host.textContent).toMatch(/\$42\.00\/mo/);
  });

  it("pluralises a multi-unit billing period", () => {
    render(subscription({ frequency: "3m" }));
    expect(screen!.host.textContent).toMatch(/\$42\.00\/3 months/);
  });

  it("shows the bare price when the store turned show_sub_frequency off", () => {
    render(subscription({ frequency: "1m" }), {
      cartDisplayConfig: { show_sub_frequency: false },
    });
    expect(screen!.host.textContent).toMatch(/\$42\.00/);
    expect(screen!.host.textContent).not.toMatch(/\$42\.00\//);
  });

  // A frequency the parser cannot read must not invent a period.
  it("shows the bare price for an unreadable frequency", () => {
    render(subscription({ frequency: "wat" }));
    expect(screen!.host.textContent).toMatch(/\$42\.00/);
    expect(screen!.host.textContent).not.toMatch(/\$42\.00\//);
  });

  it("shows a Start date cell for a subscription that already started", () => {
    render(subscription({ start_date: storeDate(-30) }));
    expect(screen!.host.textContent).toMatch(/start date/i);
  });

  it("hides the Start date cell when the store turned show_sub_startdate off", () => {
    render(subscription(), {
      cartDisplayConfig: { show_sub_startdate: false },
    });
    expect(screen!.host.textContent).not.toMatch(/start date/i);
  });

  it("shows a Next payment cell for an active subscription with a future payment", () => {
    render(subscription({ next_transaction_date: storeDate(14) }));
    expect(screen!.host.textContent).toMatch(/next payment/i);
  });

  it("hides the Next payment cell when the store turned show_sub_nextdate off", () => {
    render(subscription(), {
      cartDisplayConfig: { show_sub_nextdate: false },
    });
    expect(screen!.host.textContent).not.toMatch(/next payment/i);
  });

  it("hides the Next payment cell for an inactive subscription", () => {
    render(subscription({ is_active: false }));
    expect(screen!.host.textContent).not.toMatch(/next payment/i);
  });

  it("shows a Cancels cell for an active subscription with a future end date", () => {
    render(subscription({ end_date: storeDate(30) }));
    expect(screen!.host.textContent).toMatch(/cancels/i);
  });

  it("shows an Ended cell for an inactive subscription with a past end date", () => {
    render(subscription({ is_active: false, end_date: storeDate(-1) }));
    expect(screen!.host.textContent).toMatch(/ended/i);
  });

  it("shows Ended, not Cancels, for an inactive subscription with a future end date", () => {
    // A cancelled subscription isn't going to cancel again in the future --
    // `is_active` must gate the label, not just whether `end_date` is future.
    render(subscription({ is_active: false, end_date: storeDate(30) }));
    expect(screen!.host.textContent).toMatch(/ended/i);
    expect(screen!.host.textContent).not.toMatch(/cancels/i);
  });

  it("hides the Start/Next/Cancels cells when the corresponding date is the API's unset sentinel", () => {
    render(
      subscription({
        start_date: "0000-00-00",
        next_transaction_date: "0000-00-00",
        end_date: "0000-00-00",
      }),
    );
    expect(screen!.host.textContent).not.toMatch(/start date/i);
    expect(screen!.host.textContent).not.toMatch(/next payment/i);
    expect(screen!.host.textContent).not.toMatch(/cancels/i);
  });

  it("always shows the Subscription ID cell", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/subscription id/i);
  });

  it("shows the store's calendar day for Next payment, not the viewer's UTC-shifted one", () => {
    // '2023-02-11T22:45:01-0700' is 05:45:01Z on Feb 12 -- naively parsing
    // and formatting in a viewer timezone at or east of the store's rolls
    // the displayed day forward to Feb 12, a day after what the store (and
    // the customer's receipt) considers the payment date.
    render(
      subscription({
        is_active: true,
        next_transaction_date: "2023-02-11T22:45:01-0700",
      }),
    );
    expect(screen!.host.textContent).toMatch(/Feb 11, 2023/);
    expect(screen!.host.textContent).not.toMatch(/Feb 12, 2023/);
  });

  // A deliberately wide, short image: the tile has to stay square regardless
  // of what shape the store's own artwork is.
  const WIDE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50">' +
      '<rect width="200" height="50" fill="red"/></svg>',
  )}`;

  it("lays the thumbnails out as a square grid of square tiles", async () => {
    render(
      subscription({
        _embedded: {
          "fx:transaction_template": {
            currency_code: "USD",
            total_order: 42,
            _embedded: {
              "fx:items": [
                { name: "A", quantity: 1, image: WIDE_IMAGE },
                { name: "B", quantity: 1, image: WIDE_IMAGE },
                // No image, so the empty swatch has to hold its shape too.
                { name: "C", quantity: 1 },
              ],
            },
          },
        },
      } as never),
    );

    const image = screen!.host.querySelector("img")!;
    const grid = image.parentElement!.parentElement!;

    // Measure only once the images carry their intrinsic size. Before they
    // decode the tiles are square by accident, which would let this pass
    // against the very layout it exists to catch.
    await Promise.all(
      [...screen!.host.querySelectorAll("img")].map((img) =>
        img.decode().catch(() => undefined),
      ),
    );

    const gridBox = grid.getBoundingClientRect();
    expect(Math.abs(gridBox.width - gridBox.height)).toBeLessThanOrEqual(1);

    // An odd item count is what broke this: three tiles in two columns means
    // a second row, which used to size itself to the image instead of to
    // half the square.
    const tiles = [...grid.children];
    expect(tiles).toHaveLength(3);
    for (const tile of tiles) {
      const box = tile.getBoundingClientRect();
      expect(box.width).toBeGreaterThan(0);
      expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(1);
    }

    expect(getComputedStyle(image).objectFit).toBe("cover");
  });

  // The info captions sit in an auto-fit grid, so the number of columns moves
  // with both the viewport and how many captions a subscription has. Left to
  // auto-placement, Manage lands in whatever cell follows the last caption --
  // the middle of the card on any width where they wrap.
  it("keeps Manage at the card's right edge once the captions wrap", () => {
    render(subscription());
    // Wide enough for several caption columns, narrow enough that five items
    // cannot sit on one row. A width that collapses the grid to a single
    // column would pass whatever Manage does, since every item is then
    // full-width.
    screen!.host.style.width = "600px";

    const manage = [...screen!.host.querySelectorAll("button")].find((b) =>
      /^Manage/.test(b.textContent ?? ""),
    )!;
    const slot = manage.parentElement!;
    const grid = slot.parentElement!;

    // Guard both halves of the premise: more than one column, and Manage
    // pushed onto a row below the first.
    const columns = getComputedStyle(grid)
      .gridTemplateColumns.split(" ")
      .filter((width) => parseFloat(width) > 0);
    expect(columns.length).toBeGreaterThan(1);
    expect(slot.getBoundingClientRect().top).toBeGreaterThan(
      grid.getBoundingClientRect().top,
    );

    expect(
      grid.getBoundingClientRect().right - manage.getBoundingClientRect().right,
    ).toBeLessThanOrEqual(1);
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

  it("uses the default Manage button for an active subscription and outline for an inactive one", () => {
    render(subscription({ is_active: true }));
    const activeManage = [...screen!.host.querySelectorAll("button")].find((b) =>
      /manage/i.test(b.textContent ?? ""),
    )!;

    screen!.unmount();
    render(subscription({ is_active: false }));
    const inactiveManage = [...screen!.host.querySelectorAll("button")].find(
      (b) => /manage/i.test(b.textContent ?? ""),
    )!;

    // The two buttons must render with visibly different styling -- the
    // simplest reliable check without depending on styled-components'
    // generated class names is that their computed background differs.
    expect(getComputedStyle(activeManage).backgroundColor).not.toBe(
      getComputedStyle(inactiveManage).backgroundColor,
    );
  });

  it("shows the Last payment cell and a working View link once the fetch resolves", async () => {
    const sub = subscription({
      _links: {
        self: { href: "/s/1" },
        "fx:last_transaction": {
          href: "/t/900",
          get: async () => ({
            ok: true,
            status: 200,
            json: async () => ({
              id: 900,
              display_id: 900,
              transaction_date: storeDate(-10),
              total_order: 42,
              total_item_price: "42.00",
              total_tax: "0.00",
              total_shipping: "0.00",
              currency_code: "USD",
              status: "captured",
              _links: { self: { href: "/t/900" } },
            }),
          }),
        },
      } as never,
    });

    const onNavigate = vi.fn();
    render(sub, { onNavigate });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen!.host.textContent).toMatch(/last payment/i);

    act(() => {
      const view = [...screen!.host.querySelectorAll("button, a")].find((el) =>
        /view/i.test(el.textContent ?? ""),
      );
      (view as HTMLElement)?.click();
    });

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ type: "order", id: "900" }),
    );
  });

  it("hides the Last payment cell when the subscription has no fx:last_transaction link", () => {
    render(subscription());
    expect(screen!.host.textContent).not.toMatch(/last payment/i);
  });
});
