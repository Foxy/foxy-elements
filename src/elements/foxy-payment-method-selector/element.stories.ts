import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import "./element";
import type { StoryCountry } from "./utils";
import {
  ADYEN_EMBEDDED_GATEWAY,
  AUTHORIZE_ACH_GATEWAY,
  AUTHORIZE_GATEWAY,
  AUTHORIZE_SAVED_CARD,
  PAYPAL_PLATFORM_GATEWAY,
  PURCHASE_ORDER_GATEWAY,
  REDIRECT_GATEWAY,
  SEZZLE_GATEWAY,
  STORY_COUNTRY_CODES,
  STRIPE_CONNECT_SAVED_CARD,
  STRIPE_SAVED_CARD,
  appendTokenizeControls,
  applyStoryApiState,
  attachActionLogging,
  createAdyenSdk,
  createApiState,
  createKlarnaGateway,
  createKlarnaSdk,
  createPayPalSdk,
  createSelector,
  createSelectorSurface,
  createStoryNote,
  createStripeConnectGateway,
  createStripeV2Gateway,
  getPrimarySelector,
  readSelectorText,
  waitForOptionCount,
  waitForSelectorText,
} from "./utils";

type SelectorStoryArgs = {
  lang: string;
  optionIndex: number;
  country: StoryCountry;
};

const meta = {
  // Keeps the element in the sidebar section its docs page already used. The
  // two hosted-field elements are Universal; this one is checkout-specific.
  title: "Checkout/foxy-payment-method-selector",
  parameters: {
    layout: "centered",
    actions: {
      handles: [
        "tokenizationstart",
        "tokenizationsuccess",
        "tokenizationerror",
        "optionindexchange",
      ],
    },
    docs: {
      description: {
        component:
          "Gateway scenario stories for the payment method selector. Each story hydrates the checkout state one of the standalone example pages used, so the rendered option list, the tokenize() entry point, and locale propagation can be exercised without a live checkout session.",
      },
    },
  },
  args: {
    lang: "en-US",
    optionIndex: 0,
    country: "US",
  },
} satisfies Meta<SelectorStoryArgs>;

export default meta;

type Story = StoryObj<SelectorStoryArgs>;

/**
 * Builds the story body every gateway scenario shares: a surface, the selector,
 * the Tokenize button, and the result panel the example pages rendered.
 */
function renderScenario(options: {
  id: string;
  lang: string;
  note: string;
  optionIndex?: number;
}): HTMLDivElement {
  const surface = createSelectorSurface();
  const selector = createSelector({
    id: options.id,
    lang: options.lang,
    optionIndex: options.optionIndex,
  });

  attachActionLogging(selector, options.id);
  surface.append(selector, createStoryNote(options.note));
  appendTokenizeControls(surface, selector);

  return surface;
}

export const StandardCard: Story = {
  parameters: {
    controls: { include: ["lang", "optionIndex"] },
    docs: {
      description: {
        story:
          "Port of the standard_card example page: a card gateway with one saved card, so the option list renders both the saved card and the new-card entry.",
      },
    },
  },
  argTypes: {
    lang: { control: "text" },
    optionIndex: { control: "number" },
  },
  beforeEach: () =>
    applyStoryApiState(
      createApiState({
        gateways: [AUTHORIZE_GATEWAY],
        savedPaymentMethods: [AUTHORIZE_SAVED_CARD],
      }),
    ),
  render: ({ lang, optionIndex }) =>
    renderScenario({
      id: "selector-standard-card",
      lang,
      optionIndex,
      note: "Authorize.NET gateway with a saved Visa. Click Tokenize to run tokenize() against the selected option.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    // Saved card plus new card: the saved method must not replace the option to
    // enter a different card.
    await waitForOptionCount(selector, 2);
    await waitForSelectorText(selector, "4242");

    expect(readSelectorText(selector)).toContain("New Card");
  },
};

export const StandardAch: Story = {
  parameters: {
    controls: { include: ["lang"] },
    docs: {
      description: {
        story:
          "Port of the standard_ach example page: an ACH gateway for a guest customer, with the routing, account, account-type, and account-holder fields the gateway advertises.",
      },
    },
  },
  argTypes: {
    lang: { control: "text" },
  },
  beforeEach: () =>
    applyStoryApiState(
      createApiState({
        gateways: [AUTHORIZE_ACH_GATEWAY],
        customerType: "guest",
      }),
    ),
  render: ({ lang }) =>
    renderScenario({
      id: "selector-standard-ach",
      lang,
      note: "Authorize.NET ACH gateway for a guest customer.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    await waitForOptionCount(selector, 1);
    await waitForSelectorText(selector, "Bank Account (ACH)");
  },
};

export const PurchaseOrder: Story = {
  parameters: {
    controls: { include: ["lang"] },
    docs: {
      description: {
        story:
          "Port of the purchase_order example page: the purchase order gateway, which collects a PO number instead of payment credentials.",
      },
    },
  },
  argTypes: {
    lang: { control: "text" },
  },
  beforeEach: () =>
    applyStoryApiState(
      createApiState({
        gateways: [PURCHASE_ORDER_GATEWAY],
        customerType: "guest",
      }),
    ),
  render: ({ lang }) =>
    renderScenario({
      id: "selector-purchase-order",
      lang,
      note: "Purchase order gateway. Tokenizing with an empty PO number surfaces the required-field message.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    await waitForOptionCount(selector, 1);
    await waitForSelectorText(selector, "Purchase order number");
  },
};

export const StandardRedirect: Story = {
  parameters: {
    controls: { include: ["lang"] },
    docs: {
      description: {
        story:
          "Port of the standard_redirect example page: a redirect-style gateway that hands the buyer off to the provider instead of collecting details inline.",
      },
    },
  },
  argTypes: {
    lang: { control: "text" },
  },
  beforeEach: () =>
    applyStoryApiState(createApiState({ gateways: [REDIRECT_GATEWAY] })),
  render: ({ lang }) =>
    renderScenario({
      id: "selector-standard-redirect",
      lang,
      note: "Mollie OmniPay gateway, rendered as a single redirect option.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    await waitForOptionCount(selector, 1);
    await waitForSelectorText(selector, "Mollie");
  },
};

export const StripeV2: Story = {
  parameters: {
    controls: { include: ["lang"] },
    docs: {
      description: {
        story:
          "Port of the stripe_v2 example page: the Stripe gateway with a saved payment token. Stripe.js is loaded by the embed at runtime, so the assertions here cover the option list rather than the mounted Stripe element.",
      },
    },
  },
  argTypes: {
    lang: { control: "text" },
  },
  beforeEach: () =>
    applyStoryApiState(
      createApiState({
        gateways: [createStripeV2Gateway()],
        savedPaymentMethods: [STRIPE_SAVED_CARD],
      }),
    ),
  render: ({ lang }) =>
    renderScenario({
      id: "selector-stripe-v2",
      lang,
      note: "Stripe gateway with a saved card. Set VITE_STRIPE_PUBLISHABLE_KEY to mount against your own Stripe account.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    await waitForOptionCount(selector, 2);
    await waitForSelectorText(selector, "4242");
  },
};

export const StripeConnectOrCharge: Story = {
  parameters: {
    controls: { include: ["lang"] },
    docs: {
      description: {
        story:
          "Port of the stripe_connect_or_charge example page: the Stripe Connect gateway, whose saved methods are scoped to the connected account.",
      },
    },
  },
  argTypes: {
    lang: { control: "text" },
  },
  beforeEach: () =>
    applyStoryApiState(
      createApiState({
        gateways: [createStripeConnectGateway()],
        savedPaymentMethods: [STRIPE_CONNECT_SAVED_CARD],
      }),
    ),
  render: ({ lang }) =>
    renderScenario({
      id: "selector-stripe-connect",
      lang,
      note: "Stripe Connect gateway with a saved card scoped to the connected account.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    await waitForOptionCount(selector, 2);
    await waitForSelectorText(selector, "4242");
  },
};

export const Uninitialized: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          "Port of the uninitialized example page: the selector renders a destructive alert when no checkout client state is available. The alert appears only after a short grace period, so a slow-loading client does not flash an error.",
      },
    },
  },
  beforeEach: () => applyStoryApiState(null),
  render: () =>
    renderScenario({
      id: "selector-uninitialized",
      lang: "en-US",
      note: "No checkout state hydrated. Tokenizing rejects because the client is not initialized.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    await waitForSelectorText(
      selector,
      "Checkout API client is not initialized",
    );

    await expect(selector.tokenize()).rejects.toThrow(
      "Checkout client is not initialized.",
    );
  },
};

export const OptionSelection: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          "Play-driven option selection that verifies optionIndex reflects to the option-index attribute and that selecting an option emits optionindexchange.",
      },
    },
  },
  beforeEach: () =>
    applyStoryApiState(
      createApiState({
        gateways: [AUTHORIZE_GATEWAY],
        savedPaymentMethods: [AUTHORIZE_SAVED_CARD],
      }),
    ),
  render: () =>
    renderScenario({
      id: "selector-option-selection",
      lang: "en-US",
      note: "Play function moves the selection to verify attribute reflection and the optionindexchange event.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);
    const radios = await waitForOptionCount(selector, 2);

    let changedTo: number | undefined;
    selector.addEventListener(
      "optionindexchange",
      (event) => {
        changedTo = (event as CustomEvent<{ optionIndex: number }>).detail
          .optionIndex;
      },
      { once: true },
    );

    await userEvent.click(radios[1]);

    await waitFor(() => {
      expect(selector.optionIndex).toBe(1);
      expect(selector.getAttribute("option-index")).toBe("1");
    });

    expect(changedTo).toBe(1);
  },
};

export const TokenizeFromButton: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          "Exercises the Tokenize button the example pages shipped. The purchase order gateway is used because it tokenizes from its own input rather than a hosted embed, so the result panel is deterministic.",
      },
    },
  },
  beforeEach: () =>
    applyStoryApiState(
      createApiState({
        gateways: [PURCHASE_ORDER_GATEWAY],
        customerType: "guest",
      }),
    ),
  render: () =>
    renderScenario({
      id: "selector-tokenize-button",
      lang: "en-US",
      note: "Click Tokenize with an empty PO number to see the validation path reported in the result panel.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);
    const canvas = within(canvasElement);

    await waitForOptionCount(selector, 1);

    const button = canvas.getByRole("button", { name: "Tokenize" });
    await userEvent.click(button);

    const panel = canvasElement.querySelector(
      "[data-story-role='tokenize-result']",
    );

    // An empty purchase order number must not tokenize silently: the panel has
    // to report either the resolved payload or the rejection reason.
    await waitFor(() => {
      expect(panel?.textContent?.trim()).not.toBe("");
    });
  },
};

export const Klarna: Story = {
  parameters: {
    controls: { include: ["country"] },
    docs: {
      description: {
        story:
          "Klarna, parameterised by buyer market. The standalone examples shipped one page per country that differed only by address, locale and currency, so the Country control replaces all of them. Klarna returns different method categories per market in production; the fixture keeps them fixed so the story stays deterministic.",
      },
    },
  },
  argTypes: {
    country: {
      control: "select",
      options: STORY_COUNTRY_CODES,
      description: "Buyer market seeded into the address, locale and currency.",
    },
  },
  args: { country: "US" },
  beforeEach: ({ args }) =>
    applyStoryApiState(
      createApiState({
        gateways: [createKlarnaGateway()],
        country: args.country as StoryCountry,
      }),
      { klarna: createKlarnaSdk() },
    ),
  render: ({ lang, country }) =>
    renderScenario({
      id: "selector-klarna",
      lang,
      note: `Klarna for ${country}. One option per payment method category returned by the session.`,
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    // One option per category the session advertises.
    await waitForOptionCount(selector, 2);
    await waitForSelectorText(selector, "Pay in 4");

    expect(readSelectorText(selector)).toContain("Pay in 30 Days");
  },
};

export const AdyenEmbedded: Story = {
  parameters: {
    controls: { include: ["country"] },
    docs: {
      description: {
        story:
          "Adyen Embedded mounts its own Drop-in rather than rendering a radio option, so this story asserts the Drop-in is constructed and mounted into the host element the selector creates.",
      },
    },
  },
  argTypes: {
    country: { control: "select", options: STORY_COUNTRY_CODES },
  },
  args: { country: "NL" },
  beforeEach: ({ args }) =>
    applyStoryApiState(
      createApiState({
        gateways: [ADYEN_EMBEDDED_GATEWAY],
        country: args.country as StoryCountry,
      }),
      { adyenEmbedded: createAdyenSdk() },
    ),
  render: ({ lang, country }) =>
    renderScenario({
      id: "selector-adyen-embedded",
      lang,
      note: `Adyen Embedded for ${country}. The Drop-in replaces the option list when it is the only gateway.`,
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    // The Drop-in host lives in the light DOM so Adyen can reach it.
    const host = await waitFor(
      () => {
        const found = selector.querySelector("[data-foxy-adyen-host]");
        if (!found) throw new Error("Adyen host not rendered yet.");
        return found;
      },
      { timeout: 3000 },
    );

    await waitFor(() => {
      expect(host.textContent).toContain("Adyen");
    });
  },
};

export const PayPalPlatform: Story = {
  parameters: {
    controls: { include: ["country"] },
    docs: {
      description: {
        story:
          "PayPal Platform renders one entry per funding source the SDK reports as eligible, instead of collapsing them into a single PayPal button. Eligibility is fixed here; in production it varies by buyer country and account.",
      },
    },
  },
  argTypes: {
    country: { control: "select", options: STORY_COUNTRY_CODES },
  },
  args: { country: "US" },
  beforeEach: ({ args }) =>
    applyStoryApiState(
      createApiState({
        gateways: [PAYPAL_PLATFORM_GATEWAY],
        country: args.country as StoryCountry,
      }),
      { paypal: createPayPalSdk() },
    ),
  render: ({ lang, country }) =>
    renderScenario({
      id: "selector-paypal-platform",
      lang,
      note: `PayPal Platform for ${country}, with Pay Later and Venmo reported eligible alongside the base PayPal entry.`,
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    await waitForOptionCount(selector, 2);
    await waitForSelectorText(selector, "PayPal");
  },
};

export const Sezzle: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          "Sezzle needs no gateway configuration beyond its type, so it renders as a single buy-now-pay-later option.",
      },
    },
  },
  beforeEach: () =>
    applyStoryApiState(createApiState({ gateways: [SEZZLE_GATEWAY] })),
  render: ({ lang }) =>
    renderScenario({
      id: "selector-sezzle",
      lang,
      note: "Sezzle as the only configured gateway.",
    }),
  play: async ({ canvasElement }) => {
    const selector = getPrimarySelector(canvasElement);

    await waitForOptionCount(selector, 1);
    await waitForSelectorText(selector, "Sezzle");
  },
};
