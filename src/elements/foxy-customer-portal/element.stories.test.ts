import { afterEach, describe, expect, it, vi } from "vitest";
import { stubStore } from "./element.stories";
import { loadHCaptcha, resetHCaptchaLoaderForTests } from "./hcaptcha";

const SUBSCRIPTIONS_HREF = "https://demo.foxycart.com/s/customer/subscriptions";

function subscriptionFixture(id: string, isActive: boolean) {
  return {
    frequency: "1m",
    start_date: "2020-01-01T00:00:00Z",
    next_transaction_date: "2099-01-01T00:00:00Z",
    end_date: null,
    is_active: isActive,
    error_message: "",
    first_failed_transaction_date: null,
    _links: { self: { href: `${SUBSCRIPTIONS_HREF}/${id}` } },
    _embedded: {
      "fx:transaction_template": {
        currency_code: "USD",
        total_order: 10,
        total_item_price: "10.00",
        total_tax: "0.00",
        total_shipping: "0.00",
        _embedded: { "fx:items": [{ name: "Item", quantity: 1 }] },
      },
    },
  };
}

afterEach(() => {
  resetHCaptchaLoaderForTests();
});

describe("stubStore", () => {
  it("blocks hCaptcha script injection instead of letting a story reach the network", async () => {
    // Canary, not the assertion: if `stubStore`'s hCaptcha guard is ever
    // missing, `loadHCaptcha()` falls through to the real script loader,
    // which appends a `<script src="https://js.hcaptcha.com/...">` to
    // `document.head` -- and the browser starts that request the instant the
    // node is inserted, before any `load`/`error` event fires. Spying on
    // `append` catches the attempt synchronously, before insertion, so
    // proving this test goes red (see the report) never actually dispatches
    // the request. Its error is deliberately a different message from the
    // guard's own, so a passing assertion below can only mean the guard
    // itself fired -- not that the canary quietly did its job instead.
    const realAppend = document.head.append.bind(document.head);
    const appendSpy = vi
      .spyOn(document.head, "append")
      .mockImplementation((...nodes: (Node | string)[]) => {
        for (const node of nodes) {
          if (
            node instanceof HTMLScriptElement &&
            node.src.startsWith("https://js.hcaptcha.com")
          ) {
            throw new Error("canary: a real hCaptcha script was appended");
          }
        }
        return realAppend(...nodes);
      });

    const restore = stubStore();

    try {
      await expect(loadHCaptcha()).rejects.toThrow(
        "A story tried to load hCaptcha.",
      );
    } finally {
      restore();
      appendSpy.mockRestore();
    }
  });

  it("answers an unfiltered fx:subscriptions request with both active and inactive fixtures", async () => {
    // Regression test for the bug a reviewer caught after Task 4:
    // `useSubscriptionById`'s fallback (see use-subscription-by-id.ts) queries
    // `fx:subscriptions` with no `is_active` filter at all -- it needs both
    // active and inactive subscriptions reachable by id, since it has no
    // per-tab context the way `list.tsx` does. Before this fix, the mock's
    // `is_active=true`/`is_active=false` checks were the only two branches
    // for this pathname, so an unfiltered request fell through to the bare
    // `json({})` at the end of the `if (url.startsWith(STORE_BASE))` block --
    // every cold subscription deep link in Storybook showed "something went
    // wrong", active or inactive alike, not just inactive ones.
    const active = [subscriptionFixture("active-0", true)];
    const inactive = [subscriptionFixture("inactive-0", false)];

    const restore = stubStore({
      activeSubscriptions: active,
      inactiveSubscriptions: inactive,
    });

    try {
      const response = await fetch(SUBSCRIPTIONS_HREF);
      const body = (await response.json()) as {
        total_items?: number;
        _embedded?: Record<string, { _links: { self: { href: string } } }[]>;
      };

      expect(body.total_items).toBe(2);

      const hrefs = (body._embedded?.["fx:subscriptions"] ?? []).map(
        (item) => item._links.self.href,
      );
      expect(hrefs).toEqual(
        expect.arrayContaining([
          `${SUBSCRIPTIONS_HREF}/active-0`,
          `${SUBSCRIPTIONS_HREF}/inactive-0`,
        ]),
      );
    } finally {
      restore();
    }
  });
});
