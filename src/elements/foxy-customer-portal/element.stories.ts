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

const CUSTOMER = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  tax_id: "GB123456789",
  _links: { self: { href: `${STORE_BASE}customer` } },
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
 * outbound request from CI. Anything not aimed at the store is passed through
 * untouched, so Storybook's own requests keep working.
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

    if (!url.startsWith(STORE_BASE)) return original(input, init);
    if (url.endsWith("customer_portal_settings")) return json(SETTINGS);
    if (url === STORE_BASE) return json(CUSTOMER);

    return json({});
  };

  return () => {
    globalThis.fetch = original;
  };
}

/** Seeds a live session so the story opens on the account screen. */
function withSession(): () => void {
  const restoreFetch = stubStore();

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
    restoreFetch();
  };
}

const meta: Meta = {
  title: "Elements/foxy-customer-portal",
  parameters: { layout: "centered" },
  beforeEach: () => stubStore(),
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

export const MissingStoreDomain: StoryObj = {
  render: () => html`<foxy-customer-portal></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(portalText(canvasElement)).toMatch(/store-domain/i),
    );
  },
};
