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

function page(names: string[]) {
  return {
    total_items: names.length,
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

function customer(spy = vi.fn()) {
  return {
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
      <SubscriptionsSection customer={customer() as never} />,
      {},
    );
    await flush();

    expect(screen!.host.textContent).toMatch(/Coffee/);
  });

  it("asks the API for active subscriptions, not the whole set", async () => {
    const spy = vi.fn();
    screen = mountScreen(
      <SubscriptionsSection customer={customer(spy) as never} />,
      {},
    );
    await flush();

    const [query] = spy.mock.calls.at(-1) ?? [];
    expect(String(query?.filters)).toMatch(/is_active=true/);
    expect(String(query?.zoom)).toMatch(/transaction_template:items/);
  });

  it("switches to inactive subscriptions on demand", async () => {
    screen = mountScreen(
      <SubscriptionsSection customer={customer() as never} />,
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

  it("renders nothing at all when the customer has no subscriptions", async () => {
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
      <SubscriptionsSection customer={empty as never} />,
      {},
    );
    await flush();

    // The spec is explicit: a section with nothing to show renders nothing —
    // no empty heading. Only the toggle may remain, so the customer can look
    // at the other tab.
    expect(screen!.host.textContent).not.toMatch(/nothing here yet/i);
  });
});
