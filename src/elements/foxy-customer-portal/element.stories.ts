import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, waitFor } from "storybook/test";
import { html } from "lit";
import "./element";
import {
  resetHCaptchaLoaderForTests,
  setHCaptchaScriptLoaderForTests,
} from "./hcaptcha";

const STORE_BASE = "https://demo.foxycart.com/s/customer/";
const SESSION_KEY = `foxy:${STORE_BASE}:session`;

const SETTINGS = {
  sign_up: {
    enabled: true,
    verification: {
      type: "hcaptcha",
      site_key: "10000000-ffff-ffff-ffff-000000000001",
    },
  },
};

const SUBSCRIPTIONS_HREF = `${STORE_BASE}subscriptions`;
const TRANSACTIONS_HREF = `${STORE_BASE}transactions`;

const CUSTOMER = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  tax_id: "GB123456789",
  _links: {
    self: { href: `${STORE_BASE}customer` },
    "fx:subscriptions": { href: SUBSCRIPTIONS_HREF },
    "fx:transactions": { href: TRANSACTIONS_HREF },
  },
};

const SUBSCRIPTIONS_PAGE = {
  total_items: 1,
  _embedded: {
    "fx:subscriptions": [
      {
        frequency: "1m",
        start_date: "2020-01-01T00:00:00-0800",
        next_transaction_date: "2099-01-01T00:00:00-0800",
        end_date: null,
        is_active: true,
        error_message: "",
        first_failed_transaction_date: null,
        _links: {
          self: { href: `${SUBSCRIPTIONS_HREF}/0` },
        },
        _embedded: {
          "fx:transaction_template": {
            currency_code: "USD",
            total_order: 42,
            _embedded: {
              "fx:items": [{ name: "Coffee", quantity: 1 }],
            },
          },
        },
      },
    ],
  },
};

const ORDERS_PAGE = {
  total_items: 1,
  _embedded: {
    "fx:transactions": [
      {
        id: 100,
        display_id: 100,
        transaction_date: "2024-01-01T00:00:00-0800",
        total_order: 25,
        total_item_price: "25.00",
        total_tax: "0.00",
        total_shipping: "0.00",
        currency_code: "USD",
        status: "approved",
        _links: {
          self: { href: `${TRANSACTIONS_HREF}/100` },
        },
        _embedded: {
          "fx:items": [{ name: "Widget", quantity: 1, price: 25 }],
        },
      },
    ],
  },
};

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Answers every request the element would otherwise send to a real store.
 *
 * Stories run in the same Chromium as the `unit` project, with no network
 * interception, so a story that reaches `demo.foxycart.com` makes a genuine
 * outbound request from CI. Anything aimed at this page's own origin (or a
 * relative URL, e.g. Storybook's manifest/HMR requests) is passed through
 * untouched; anything else now throws rather than going out silently — the
 * previous passthrough (`!url.startsWith(STORE_BASE)`) was exactly the hole
 * that let three stories reach `demo.foxycart.com` for real, unnoticed,
 * because `useResource` swallows rejections.
 */
export function stubStore(): () => void {
  const original = globalThis.fetch;

  // No story here reaches the sign-up screen today, but `SETTINGS.sign_up.enabled`
  // is already `true`, so a future one would call `loadHCaptcha()`, which
  // appends a real `<script src="https://js.hcaptcha.com/...">` to
  // `document.head` -- invisible to the fetch stub below, since it never goes
  // through `fetch`. Guard it the same way: throw loudly instead of letting a
  // story quietly load the real script.
  setHCaptchaScriptLoaderForTests(() =>
    Promise.reject(new Error("A story tried to load hCaptcha.")),
  );

  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (url.startsWith(STORE_BASE)) {
      if (url.endsWith("customer_portal_settings")) return json(SETTINGS);
      if (url === STORE_BASE) return json(CUSTOMER);
      // Matches only the active-subscriptions collection request, not e.g. a
      // subscription's `fx:transactions` sub-path (no story here opens the
      // Payments dialog) or the Inactive tab (no story here switches it).
      // `is_active=true` is checked literally against the URL, not decoded —
      // confirmed against what the real SDK sends for `filters: ["is_active=true"]`:
      // `?is_active=true&offset=0&limit=10&zoom=transaction_template%3Aitems`.
      if (
        new URL(url).pathname === new URL(SUBSCRIPTIONS_HREF).pathname &&
        url.includes("is_active=true")
      ) {
        return json(SUBSCRIPTIONS_PAGE);
      }

      // Matches the orders collection request. `OrdersSection` sends
      // `filters: ["type:in=transaction,subscription_modification,subscription_cancellation"]`,
      // which the SDK's `Node.get()` turns into a query param by splitting
      // the filter on its first `=` and appending the halves via
      // `URLSearchParams` -- `type:in` as the key, the comma-joined type
      // list as the value -- so the colon and commas come out percent-encoded
      // (confirmed against the SDK's actual request: `?type%3Ain=transaction%2C...`).
      // The substring below is checked literally against the URL, not decoded,
      // the same way `is_active=true` is above.
      if (
        new URL(url).pathname === new URL(TRANSACTIONS_HREF).pathname &&
        url.includes("type%3Ain=transaction")
      ) {
        return json(ORDERS_PAGE);
      }

      return json({});
    }

    const isLocal =
      url.startsWith("/") ||
      url.startsWith("blob:") ||
      url.startsWith("data:") ||
      url.startsWith(window.location.origin);

    if (isLocal) return original(input, init);

    throw new Error(`A story tried to reach the network: ${url}`);
  };

  return () => {
    globalThis.fetch = original;
    resetHCaptchaLoaderForTests();
  };
}

/**
 * Seeds a live session so the story opens on the account screen.
 *
 * Deliberately does not stub `fetch`: the meta-level `beforeEach` already did,
 * and nesting a second stub would make the restore order decide whether the
 * real `fetch` or the outer stub is left in place afterwards.
 */
function withSession(): () => void {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      session_token: "storybook",
      expires_in: 3600,
      date_created: new Date().toISOString(),
    }),
  );

  return () => {
    localStorage.removeItem(SESSION_KEY);
  };
}

const meta: Meta = {
  title: "Elements/foxy-customer-portal",
  parameters: { layout: "centered" },
  // `stubStore` is exported so `element.stories.test.ts` can guard its
  // hCaptcha-script hole directly -- without this, Storybook's CSF indexer
  // treats every named export as a candidate story and errors trying to
  // render it as one. Add any future non-story export here too.
  excludeStories: ["stubStore"],
  beforeEach: () => {
    // Clear the session on the way in, not just on the way out. Storybook runs
    // a story's `beforeEach` teardown under the test runner, but not when you
    // navigate between stories in the interactive UI — so the session seeded by
    // `WithSalutation` survives into `SignedOut`, which then renders an account
    // screen instead of the sign-in form. Tests never saw it because each story
    // runs isolated there; only the preview lied.
    localStorage.removeItem(SESSION_KEY);
    return stubStore();
  },
};

export default meta;

/** The element keeps its UI in a shadow root, so `within()` cannot see it. */
function portalText(canvasElement: HTMLElement): string {
  const portal = canvasElement.querySelector("foxy-customer-portal");
  return portal?.shadowRoot?.textContent ?? "";
}

export const SignedOut: StoryObj = {
  render: () =>
    html`<foxy-customer-portal store-domain="demo"></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(portalText(canvasElement)).toMatch(/sign in/i));
  },
};

export const WithSalutation: StoryObj = {
  beforeEach: () => withSession(),
  render: () => html`
    <foxy-customer-portal
      store-domain="demo"
      full-name-template="Dr. {first_name} {last_name}"
    ></foxy-customer-portal>
  `,
  // Also proves the stub answered: reaching the account screen needs both the
  // seeded session and a customer response, and neither comes from the network.
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(portalText(canvasElement)).toMatch(/Dr\. Ada Lovelace/),
    );
  },
};

export const WithSubscriptions: StoryObj = {
  beforeEach: () => withSession(),
  render: () =>
    html`<foxy-customer-portal store-domain="demo"></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(portalText(canvasElement)).toMatch(/Coffee/));
  },
};

export const WithOrders: StoryObj = {
  beforeEach: () => withSession(),
  render: () =>
    html`<foxy-customer-portal store-domain="demo"></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(portalText(canvasElement)).toMatch(/Widget/));
  },
};

export const MissingStoreDomain: StoryObj = {
  render: () => html`<foxy-customer-portal></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(portalText(canvasElement)).toMatch(/store-domain/i),
    );
  },
};
