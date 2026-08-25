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

  it("shows the frequency line by default", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/every/i);
  });

  it("hides the frequency line when the store turned show_sub_frequency off", () => {
    render(subscription(), {
      cartDisplayConfig: { show_sub_frequency: false },
    });
    expect(screen!.host.textContent).not.toMatch(/every/i);
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
