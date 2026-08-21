import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, waitFor } from "storybook/test";
import { html } from "lit";
import "./element";

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

const CUSTOMER = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  tax_id: "GB123456789",
  _links: {
    self: { href: `${STORE_BASE}customer` },
    "fx:subscriptions": { href: SUBSCRIPTIONS_HREF },
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
function stubStore(): () => void {
  const original = globalThis.fetch;

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

export const MissingStoreDomain: StoryObj = {
  render: () => html`<foxy-customer-portal></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(portalText(canvasElement)).toMatch(/store-domain/i),
    );
  },
};
