import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { SubscriptionsSection } from "./list";

/**
 * Split out of `list.test.tsx`, which is off-limits for this change: it
 * covers the routing this section must do when a subscriptions read comes
 * back 401/403, which `list.test.tsx` predates. See `hooks.tsx`'s
 * `useEntry` for where the `onUnauthenticated` effect actually lives --
 * this only proves the consumer wires the signal through and stays quiet
 * on the way out.
 */

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

function expiredCustomer() {
  return {
    _links: {
      "fx:subscriptions": {
        href: "/subs",
        get: async () => ({
          ok: false,
          status: 401,
          json: async () => ({}),
        }),
      },
    },
  };
}

describe("SubscriptionsSection unauthenticated read", () => {
  it("routes to sign-in instead of flashing an error when the session has expired", async () => {
    const onUnauthenticated = vi.fn();

    screen = mountScreen(
      <SubscriptionsSection customer={expiredCustomer() as never} />,
      {},
      onUnauthenticated,
    );
    await flush();

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    // The generic "something went wrong" alert would flash false
    // information for the instant before the screen routes away.
    expect(screen!.host.textContent).not.toMatch(/something went wrong/i);
  });
});
