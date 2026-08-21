import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CUSTOMER_PORTAL_ELEMENT_TAG, CustomerPortalElement } from "./element";

// React only allows `act` outside a test renderer when this is set, and warns
// on every update otherwise. Mounting the element renders React.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let fetchMock: ReturnType<typeof vi.fn>;

// Mounting the element renders `Portal`, which reads
// `<base>customer_portal_settings`. The `unit` project runs in real Chromium
// with no network interception, so without this the suite makes a genuine
// request to demo.foxycart.com — silently, because `useResource` swallows the
// rejection. Same rule as `hcaptcha.test.ts`: no test reaches an external URL.
beforeEach(() => {
  fetchMock = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
  }));

  vi.stubGlobal("fetch", fetchMock);
});

/** Lets pending promises settle and React apply what they changed. */
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

async function mount(attributes: Record<string, string> = {}) {
  const element = document.createElement(
    CUSTOMER_PORTAL_ELEMENT_TAG,
  ) as CustomerPortalElement;

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  // `connectedCallback` renders React synchronously, and that render starts the
  // portal-settings request. Both the render and the state update its response
  // causes have to happen inside `act`, or React warns about an un-acted update
  // once the promise settles — after the test body has already finished.
  await act(async () => {
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return element;
}

afterEach(async () => {
  act(() => {
    document.body
      .querySelectorAll(CUSTOMER_PORTAL_ELEMENT_TAG)
      .forEach((n) => n.remove());
  });

  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("foxy-customer-portal", () => {
  it("registers itself", async () => {
    expect(customElements.get(CUSTOMER_PORTAL_ELEMENT_TAG)).toBe(
      CustomerPortalElement,
    );
  });

  it("attaches an open shadow root", async () => {
    const element = await mount({ "store-domain": "demo" });
    expect(element.shadowRoot).not.toBeNull();
  });

  it("reflects store-domain between attribute and property", async () => {
    const element = await mount({ "store-domain": "demo" });
    expect(element.storeDomain).toBe("demo");

    act(() => {
      element.storeDomain = "other";
    });
    // A new store means a new API and a fresh settings request; let it settle
    // inside `act` rather than after the test.
    await flush();

    expect(element.getAttribute("store-domain")).toBe("other");
  });

  it("reflects skip-password-reset as a boolean", async () => {
    const element = await mount({
      "store-domain": "demo",
      "skip-password-reset": "",
    });
    expect(element.skipPasswordReset).toBe(true);

    act(() => {
      element.skipPasswordReset = false;
    });
    expect(element.hasAttribute("skip-password-reset")).toBe(false);
  });

  it("defaults fullNameTemplate", async () => {
    const element = await mount({ "store-domain": "demo" });
    expect(element.fullNameTemplate).toBe("{first_name} {last_name}");
  });

  it("renders an alert instead of throwing when store-domain is missing", async () => {
    const element = await mount();
    expect(element.shadowRoot?.textContent).toMatch(/store-domain/i);
  });

  it("threads the theme-font-body attribute into rendered shadow DOM", async () => {
    // The element observes every `theme-*` attribute (see
    // `observedAttributes`) but, before `#buildThemeTokens()`, never read
    // them back into the tokens handed to `ThemeProvider` -- so a store could
    // set `theme-color-primary` and see zero effect. This proves the
    // attribute actually reaches a rendered DS component, the same way
    // `foxy-payment-method-selector`'s equivalent test does for
    // `theme-font-body`: the sign-in form's email `Input` is styled from
    // `theme.tokens.font.body`, so its computed font picks up "Figtree"
    // instead of the design system's default ("Albert Sans") only if the
    // attribute is genuinely threaded through StyleSheetManager/ThemeProvider.
    const element = await mount({
      "store-domain": "demo",
      "theme-font-body": "400 1rem/1.25 Figtree, sans-serif",
    });

    const input = element.shadowRoot?.querySelector(
      'input[type="email"]',
    ) as HTMLElement | null;
    expect(input).not.toBeNull();

    const computed = getComputedStyle(input!);
    expect(computed.fontFamily).toBe("Figtree, sans-serif");
    expect(computed.fontWeight).toBe("400");
  });

  it("only ever asks for portal settings inside the store base path", async () => {
    await mount({ "store-domain": "demo" });

    for (const [input] of fetchMock.mock.calls as [unknown][]) {
      expect(String(input)).toBe(
        "https://demo.foxycart.com/s/customer/customer_portal_settings",
      );
    }
  });

  it("renders without a session rather than requesting the customer", async () => {
    const element = await mount({ "store-domain": "demo" });

    expect(element.shadowRoot?.textContent).toMatch(/sign in/i);
  });

  it("unmounts cleanly on disconnect", async () => {
    const element = await mount({ "store-domain": "demo" });
    expect(element.shadowRoot?.textContent).not.toBe("");

    act(() => {
      element.remove();
    });
    expect(element.shadowRoot?.textContent).toBe("");
  });
});

/**
 * `calendar-date.ts` documents that the fix for three shipped UTC/local date
 * bugs holds only as long as nothing gives `IntlProvider` (or a
 * `FormattedDate`/`intl.formatDate` call) an explicit `timeZone`. This is the
 * only test in the suite that renders a date through the production
 * `<IntlProvider>` in `#render()` below (`test-utils.test.ts` guards the
 * separate, structurally identical provider `mountScreen` sets up for every
 * other screen test) -- it drives the real custom element through sign-in
 * state all the way to a rendered subscription, the same fixture shapes
 * `element.stories.ts`'s `WithSubscriptions` story already proves reach the
 * DOM.
 */
describe("foxy-customer-portal timezone precondition", () => {
  const STORE_BASE = "https://demo.foxycart.com/s/customer/";
  const SESSION_KEY = `foxy:${STORE_BASE}:session`;
  const SUBSCRIPTIONS_HREF = `${STORE_BASE}subscriptions`;

  const CUSTOMER = {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    _links: {
      self: { href: `${STORE_BASE}customer` },
      "fx:subscriptions": { href: SUBSCRIPTIONS_HREF },
    },
  };

  function subscriptionsPage(nextTransactionDate: string) {
    return {
      total_items: 1,
      _embedded: {
        "fx:subscriptions": [
          {
            frequency: "1m",
            start_date: "2020-01-01T00:00:00-0800",
            next_transaction_date: nextTransactionDate,
            end_date: null,
            is_active: true,
            error_message: "",
            first_failed_transaction_date: null,
            _links: { self: { href: `${SUBSCRIPTIONS_HREF}/0` } },
            _embedded: {
              "fx:transaction_template": {
                currency_code: "USD",
                total_order: 42,
                _embedded: { "fx:items": [{ name: "Coffee", quantity: 1 }] },
              },
            },
          },
        ],
      },
    };
  }

  // A real `Response`, not a plain `{ ok, status, json }` literal: the SDK's
  // own `API.get()` (unlike the fake `FollowableLink`s screen tests hand
  // `useResource` directly) is a real HTTP client and expects a real
  // `Response` back from `fetch`. Matches `element.stories.ts`'s `json()`.
  function json(body: unknown): Response {
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  /** Polls instead of a fixed flush count -- settings, customer and
   * subscriptions each resolve as a separate round trip. */
  async function waitForShadowText(
    element: CustomerPortalElement,
    pattern: RegExp,
    timeoutMs = 2000,
  ): Promise<string> {
    const start = Date.now();
    let text = "";
    while (Date.now() - start < timeoutMs) {
      text = element.shadowRoot?.textContent ?? "";
      if (pattern.test(text)) return text;
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    }
    throw new Error(
      `Timed out waiting for ${pattern} in: ${JSON.stringify(text)}`,
    );
  }

  async function mountSignedIn(nextTransactionDate: string) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        session_token: "t",
        expires_in: 3600,
        date_created: new Date().toISOString(),
      }),
    );

    fetchMock.mockImplementation(async (input: unknown) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : (input as { url: string }).url;

      if (url.endsWith("customer_portal_settings")) return json({});
      if (url === STORE_BASE) return json(CUSTOMER);
      if (
        new URL(url).pathname === new URL(SUBSCRIPTIONS_HREF).pathname &&
        url.includes("is_active=true")
      ) {
        return json(subscriptionsPage(nextTransactionDate));
      }

      return json({});
    });

    return mount({ "store-domain": "demo" });
  }

  it("shows the store's calendar day for a subscription's next payment date", async () => {
    // '2023-02-11T22:45:01-0700' is 05:45:01Z on Feb 12 -- naively parsing
    // and formatting in a viewer timezone at or east of the store's rolls
    // the displayed date forward to Feb 12. The status badge is the only
    // place this date renders in the card (there is no separate next-payment
    // description line -- see card.tsx / FX-275's final review, item 1), so
    // this is exercising the badge's calendar-day derivation end to end.
    const element = await mountSignedIn("2023-02-11T22:45:01-0700");
    // Wait on something the date's own value can't affect -- "Coffee" proves
    // the subscription card actually rendered. Waiting on the date pattern
    // itself would turn a wrong-day mutation into a 2-second timeout instead
    // of a clean assertion failure naming the actual mismatch.
    const text = await waitForShadowText(element, /Coffee/);

    expect(text).toMatch(/Feb 11, 2023/);
    expect(text).not.toMatch(/Feb 12, 2023/);
  });
});

/**
 * `calendar-date.ts` fixes the third of three shipped UTC/local date bugs by
 * building dates from local components, which renders the store's calendar day
 * back out only while nothing hands `Intl` an explicit `timeZone`. Two earlier
 * date bugs survived their first review because a comment asserted a mechanism
 * nobody had verified, so this is a test rather than another comment.
 *
 * It is a source scan, deliberately. The behavioural alternative -- asserting
 * rendered digits -- cannot cover this: `toCalendarDate` always builds local
 * midnight, and formatting local midnight in zone Z yields the same calendar
 * day for every Z at or east of the runner's own zone. So a digits test goes
 * red only for an explicit zone *west* of wherever it happens to run, and is
 * blind to `timeZone="UTC"` on a UTC or UTC-3 runner -- both likely, and "UTC"
 * being the likeliest value anyone would add. A scan is direction-agnostic.
 *
 * Scoped to the element's own non-test sources so it also covers every
 * `FormattedDate`/`formatDate` call site, not just the two `IntlProvider`s.
 */
describe("timezone precondition", () => {
  const sources = import.meta.glob("./**/*.{ts,tsx}", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;

  // Comments discuss `timeZone` on purpose (`date-constraints.ts` documents
  // that DayPicker must never be given one), so only real code is scanned.
  const stripComments = (source: string) =>
    source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

  it("sets no explicit timeZone in any source file", () => {
    const offenders = Object.entries(sources)
      .filter(([path]) => !/\.(test|stories)\.[tj]sx?$/.test(path))
      .filter(([, source]) => stripComments(source).includes("timeZone"))
      .map(([path]) => path);

    // Guard the guard: a glob that silently matched nothing would pass.
    expect(Object.keys(sources).length).toBeGreaterThan(5);
    expect(offenders).toEqual([]);
  });
});
