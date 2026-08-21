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

/**
 * A customer whose one subscription's self link is patchable, so the Manage
 * dialog's Save actually resolves instead of throwing `WriteError` on a
 * missing `patch`. `getSpy` records every collection read (initial load and
 * any refetch); `patch` records every write.
 */
function customerWithPatchableSubscription(
  getSpy: (query?: Record<string, unknown>) => void,
  patch: (body: unknown) => Promise<{ ok: boolean; status: number }>,
) {
  return {
    _links: {
      "fx:subscriptions": {
        href: "https://demo.foxycart.com/s/customer/subscriptions",
        get: async (query?: Record<string, unknown>) => {
          getSpy(query);
          return {
            ok: true,
            status: 200,
            json: async () => ({
              total_items: 1,
              _embedded: {
                "fx:subscriptions": [
                  {
                    frequency: "1m",
                    start_date: "2026-01-01T00:00:00Z",
                    next_transaction_date: "2099-01-01T00:00:00Z",
                    end_date: null,
                    is_active: true,
                    error_message: "",
                    first_failed_transaction_date: null,
                    _links: { self: { href: "/s/1", patch } },
                    _embedded: {
                      "fx:transaction_template": {
                        currency_code: "USD",
                        total_order: 10,
                        _embedded: {
                          "fx:items": [{ name: "Coffee", quantity: 1 }],
                        },
                      },
                    },
                  },
                ],
              },
            }),
          };
        },
      },
    },
  };
}

const SETTINGS = {
  subscriptions: {
    allow_frequency_modification: [
      { jsonata_query: "*", values: ["1m", "1y"] },
    ],
    allow_next_date_modification: true,
  },
};

function openManageDialog(screen: MountedScreen) {
  act(() => {
    const buttons = [...screen.host.querySelectorAll("button")];
    buttons.find((b) => /^manage$/i.test(b.textContent ?? ""))!.click();
  });
}

// ManageDialog's PortalDialog has no `portal-container` provider in these
// tests, so Base UI falls back to `document.body` -- outside `screen.host`.
// Buttons inside the dialog have to be queried from `document`, the same way
// manage-dialog.test.tsx does.
function clickDialogButton(pattern: RegExp) {
  act(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((b) => pattern.test(b.textContent ?? ""))!.click();
  });
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

  it("opens the payments dialog for a card without disturbing the manage dialog", async () => {
    // The stubbed subscriptions here carry no `fx:transactions` link, so this
    // also proves the missing-link path degrades to the empty state instead
    // of throwing.
    screen = mountScreen(
      <SubscriptionsSection customer={customer() as never} />,
      {},
    );
    await flush();

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /^payments$/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    expect(document.body.textContent).toMatch(/no payments yet/i);
  });

  it("resets to offset 0 when the toggle changes the collection mid-page", async () => {
    // 15 active subscriptions (more than the page size of 10, so paging
    // forward is possible) and 3 inactive ones. The customer pages forward on
    // Active, then switches to Inactive — a tab they have never paged, which
    // must start at the first page even though the Active tab was left at
    // offset 10.
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

    screen = mountScreen(<SubscriptionsSection customer={c as never} />, {});
    await flush();

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => b.textContent === ">")!.click();
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

    // The displayed offset is not enough: assert on what was actually
    // requested, so a fix that only corrects the rendered number after the
    // fact still fails here.
    expect(inactiveCalls.length).toBeGreaterThan(0);
    for (const [query] of inactiveCalls) {
      expect(query).toMatchObject({ offset: 0 });
    }
  });

  it("refreshes the collection after a successful save", async () => {
    const getSpy = vi.fn();
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));

    screen = mountScreen(
      <SubscriptionsSection
        customer={customerWithPatchableSubscription(getSpy, patch) as never}
        settings={SETTINGS as never}
      />,
      {},
    );
    await flush();

    const callsBeforeSave = getSpy.mock.calls.length;

    openManageDialog(screen);

    // Change the next payment date -- a control that renders regardless of
    // how Item 2 ends up shaping which fields Save actually sends, so this
    // test keeps discriminating after that fix lands too.
    act(() => {
      const day = document.querySelector<HTMLButtonElement>(
        "button[data-day]:not([disabled])",
      );
      day?.click();
    });

    clickDialogButton(/^save$/i);
    await flush();

    expect(patch).toHaveBeenCalled();
    // A successful write must invalidate the cached page so the reopened
    // dialog and the card both reflect what was actually saved, instead of
    // replaying the stale resource from before the PATCH.
    expect(getSpy.mock.calls.length).toBeGreaterThan(callsBeforeSave);
  });

  it("does not refetch when the manage dialog is dismissed without saving", async () => {
    const getSpy = vi.fn();
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));

    screen = mountScreen(
      <SubscriptionsSection
        customer={customerWithPatchableSubscription(getSpy, patch) as never}
        settings={SETTINGS as never}
      />,
      {},
    );
    await flush();

    const callsBeforeDismiss = getSpy.mock.calls.length;

    openManageDialog(screen);
    clickDialogButton(/^close$/i);
    await flush();

    expect(patch).not.toHaveBeenCalled();
    expect(getSpy.mock.calls.length).toBe(callsBeforeDismiss);
  });
});
