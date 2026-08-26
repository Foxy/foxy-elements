import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { SubscriptionsSection } from "./list";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

function page(names: string[], totalItems = names.length) {
  return {
    total_items: totalItems,
    _embedded: {
      "fx:subscriptions": names.map((name) => ({
        frequency: "1m",
        start_date: "2026-01-01T00:00:00Z",
        next_transaction_date: "2099-01-01T00:00:00Z",
        end_date: null,
        is_active: true,
        error_message: "",
        first_failed_transaction_date: null,
        _links: { self: { href: `/s/${name}` } },
        _embedded: {
          "fx:transaction_template": {
            currency_code: "USD",
            total_order: 10,
            _embedded: { "fx:items": [{ name, quantity: 1 }] },
          },
        },
      })),
    },
  };
}

// `spy` may just record calls (the default `vi.fn()`, which returns
// `undefined`) or, per the "shows a count on each tab" test below, also
// supply the response page itself -- whichever the caller's mock
// implementation returns is used verbatim when truthy, falling back to the
// fixed Coffee/Old Tea pages otherwise.
function customer(
  spy: (query?: Record<string, unknown>) => unknown = vi.fn(),
) {
  return {
    _links: {
      "fx:subscriptions": {
        href: "https://demo.foxycart.com/s/customer/subscriptions",
        get: async (query?: Record<string, unknown>) => {
          const result = await spy(query);
          if (result) {
            return { ok: true, status: 200, json: async () => result };
          }
          const active = String(query?.filters ?? "").includes(
            "is_active=true",
          );
          return {
            ok: true,
            status: 200,
            json: async () => page(active ? ["Coffee"] : ["Old Tea"]),
          };
        },
      },
    },
  };
}

describe("SubscriptionsSection", () => {
  it("lists active subscriptions by default", async () => {
    screen = mountScreen(
      <SubscriptionsSection customer={customer() as never} onNavigate={vi.fn()} />,
      {},
    );
    await flush();

    expect(screen!.host.textContent).toMatch(/Coffee/);
  });

  it("asks the API for active subscriptions, not the whole set", async () => {
    const spy = vi.fn();
    screen = mountScreen(
      <SubscriptionsSection customer={customer(spy) as never} onNavigate={vi.fn()} />,
      {},
    );
    await flush();

    // The section also fires two lightweight `limit: 1` count queries (one
    // per tab) alongside the main paginated one -- only the main query
    // carries `zoom`, so filter to it rather than assuming call order.
    const calls = spy.mock.calls.filter(([q]) => q?.zoom !== undefined);
    const [query] = calls.at(-1) ?? [];
    expect(String(query?.filters)).toMatch(/is_active=true/);
    expect(String(query?.zoom)).toMatch(/transaction_template:items/);
  });

  it("zooms three levels deep, so the Manage page gets each item's options", async () => {
    // Pins the exact zoom string rather than a prefix. This request is what
    // supplies `subscription-page.tsx` when the customer clicks Manage, and
    // that page reads `item._embedded["fx:item_options"]` (item-details.ts)
    // for its option rows. Every fixture in this repo hand-builds that embed,
    // so dropping `:item_options` here breaks nothing locally and silently
    // empties the option rows against the real API. Hence an equality
    // assertion, not a `toMatch` a two-level zoom would also satisfy.
    const spy = vi.fn();
    screen = mountScreen(
      <SubscriptionsSection customer={customer(spy) as never} onNavigate={vi.fn()} />,
      {},
    );
    await flush();

    const calls = spy.mock.calls.filter(([q]) => q?.zoom !== undefined);
    expect(calls.length).toBeGreaterThan(0);
    for (const [query] of calls) {
      expect(query?.zoom).toBe("transaction_template:items:item_options");
    }
  });

  it("switches to inactive subscriptions on demand", async () => {
    screen = mountScreen(
      <SubscriptionsSection customer={customer() as never} onNavigate={vi.fn()} />,
      {},
    );
    await flush();

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /inactive/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    expect(screen!.host.textContent).toMatch(/Old Tea/);
    expect(screen!.host.textContent).not.toMatch(/Coffee/);
  });

  it("still shows the heading and the toggle when the customer has no subscriptions on either tab", async () => {
    const empty = {
      _links: {
        "fx:subscriptions": {
          href: "/subs",
          get: async () => ({
            ok: true,
            status: 200,
            json: async () => ({ total_items: 0, _embedded: {} }),
          }),
        },
      },
    };

    screen = mountScreen(
      <SubscriptionsSection customer={empty as never} onNavigate={vi.fn()} />,
      {},
    );
    await flush();

    expect(screen!.host.querySelector("h2")).not.toBeNull();
    const buttons = [...screen!.host.querySelectorAll("button")];
    expect(buttons.some((b) => /active/i.test(b.textContent ?? ""))).toBe(
      true,
    );
    expect(buttons.some((b) => /inactive/i.test(b.textContent ?? ""))).toBe(
      true,
    );
  });

  it("shows a count on each tab", async () => {
    const spy = vi.fn(async (query?: Record<string, unknown>) => {
      const isActive = String(query?.filters).includes("is_active=true");
      return page([], isActive ? 4 : 2);
    });

    screen = mountScreen(
      <SubscriptionsSection customer={customer(spy) as never} onNavigate={vi.fn()} />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/Active \(4\)/);
    expect(document.body.textContent).toMatch(/Inactive \(2\)/);
  });

  it("navigates to the subscription page with its resource when Manage is clicked", async () => {
    const onNavigate = vi.fn();
    screen = mountScreen(
      <SubscriptionsSection customer={customer() as never} onNavigate={onNavigate} />,
      {},
    );
    await flush();

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      // Not anchored with a trailing `$`: the redesigned card's Manage
      // button carries a trailing arrow icon after the text (see
      // `card.tsx`), so `textContent` is "Manage " (a real space before the
      // icon's empty text), not the exact string "Manage".
      buttons.find((b) => /^manage/i.test(b.textContent ?? ""))!.click();
    });

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ type: "subscription", id: "Coffee" }),
    );
  });

  it("resets to offset 0 when the toggle changes the collection mid-page", async () => {
    function subscriptionsPage(count: number, active: boolean) {
      return {
        total_items: active ? 15 : count,
        _embedded: {
          "fx:subscriptions": Array.from({ length: count }, (_, i) => ({
            frequency: "1m",
            start_date: "2026-01-01T00:00:00Z",
            next_transaction_date: "2099-01-01T00:00:00Z",
            end_date: null,
            is_active: active,
            error_message: "",
            first_failed_transaction_date: null,
            _links: { self: { href: `/s/${active ? "a" : "i"}${i}` } },
            _embedded: {
              "fx:transaction_template": {
                currency_code: "USD",
                total_order: 10,
                _embedded: {
                  "fx:items": [{ name: `Item${i}`, quantity: 1 }],
                },
              },
            },
          })),
        },
      };
    }

    const spy = vi.fn();
    const c = {
      _links: {
        "fx:subscriptions": {
          href: "https://demo.foxycart.com/s/customer/subscriptions",
          get: async (query?: Record<string, unknown>) => {
            spy(query);
            const active = String(query?.filters ?? "").includes(
              "is_active=true",
            );
            return {
              ok: true,
              status: 200,
              json: async () => subscriptionsPage(active ? 10 : 3, active),
            };
          },
        },
      },
    };

    screen = mountScreen(
      <SubscriptionsSection customer={c as never} onNavigate={vi.fn()} />,
      {},
    );
    await flush();

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      // Not anchored with a trailing `$`: the shared `Pagination`
      // component's Next button carries a trailing arrow icon after the
      // text (see `pagination.tsx`), so `textContent` is "Next " (a real
      // space before the icon's empty text), not the exact string "Next".
      buttons.find((b) => /^next/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /inactive/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    const inactiveCalls = spy.mock.calls.filter(([q]) =>
      String(q?.filters ?? "").includes("is_active=false"),
    );

    expect(inactiveCalls.length).toBeGreaterThan(0);
    for (const [query] of inactiveCalls) {
      expect(query).toMatchObject({ offset: 0 });
    }
  });
});
