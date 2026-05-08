import type { Meta, StoryObj } from "@storybook/web-components-vite";
import type { StripeExpressCheckoutElementOptions } from "@stripe/stripe-js";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import { expect, waitFor } from "storybook/test";
import type { ExpressCheckoutElement } from "@/elements/foxy-express-checkout/element";

import "@/elements/foxy-express-checkout/element";

const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_STRIPE_DEMO_PUBLISHABLE_KEY?.trim() ||
  "";

type ExpressCheckoutStoryArgs = {
  expressCheckoutOptions: StripeExpressCheckoutElementOptions;
  includeStripeOption: boolean;
  lang: string;
  publishableKey: string;
};

function setCheckoutClientApiState(apiState: unknown) {
  Object.defineProperty(checkoutClient, "state", {
    configurable: true,
    value: undefined,
    writable: true,
  });
  Object.defineProperty(checkoutClient, "json", {
    configurable: true,
    value: apiState,
    writable: true,
  });
}

function createCheckoutApiState(
  args: ExpressCheckoutStoryArgs,
): Record<string, unknown> {
  return {
    express_checkout_options: args.includeStripeOption
      ? [
          {
            type: "stripe-express-checkout-element",
            gateway: "stripe_v2",
            config: {
              publishable_key: args.publishableKey,
              express_checkout_options: structuredClone(
                args.expressCheckoutOptions,
              ),
            },
          },
        ]
      : [{ type: "apple-pay" }, { type: "google-pay" }],
    format: {
      currency_code: "USD",
      maximum_fraction_digits: 2,
    },
    totals: [{ total_order: 24.49 }],
  };
}

function createStorySurface(note: string): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.style.width = "640px";
  wrapper.style.display = "grid";
  wrapper.style.gap = "12px";

  const callout = document.createElement("div");
  callout.className =
    "rounded-md border border-dashed border-border bg-card/60 px-3 py-2 text-sm text-muted-foreground";
  callout.textContent = note;

  wrapper.append(callout);
  return wrapper;
}

function renderElement(
  args: ExpressCheckoutStoryArgs,
  note: string,
): HTMLDivElement {
  const wrapper = createStorySurface(note);
  const element = document.createElement(
    "foxy-express-checkout",
  ) as ExpressCheckoutElement;

  setCheckoutClientApiState(createCheckoutApiState(args));
  element.lang = args.lang;

  wrapper.append(element);
  return wrapper;
}

const meta = {
  title: "Checkout/foxy-express-checkout",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Custom element that renders express checkout buttons from the checkout SDK client's API JSON. Story controls below mutate mock checkout client data, not element props.",
      },
    },
  },
  argTypes: {
    includeStripeOption: {
      control: "boolean",
      description:
        "Whether the mock checkout client JSON includes a supported stripe-express-checkout-element option.",
    },
    lang: { control: "text" },
    publishableKey: {
      control: "text",
      description:
        "Mock checkout client publishable key stored under express_checkout_options[].config.publishable_key.",
    },
    expressCheckoutOptions: {
      control: "object",
      description:
        "Mock checkout client payload stored under express_checkout_options[].config.express_checkout_options.",
    },
  },
  args: {
    expressCheckoutOptions: {
      buttonHeight: 48,
      buttonType: {
        applePay: "buy",
        googlePay: "buy",
        paypal: "checkout",
      },
      layout: {
        maxColumns: 3,
        maxRows: 2,
        overflow: "auto",
      },
      paymentMethods: {
        amazonPay: "auto",
        applePay: "always",
        googlePay: "always",
        klarna: "auto",
        link: "auto",
        paypal: "auto",
      },
    },
    includeStripeOption: true,
    lang: "en-US",
    publishableKey: STRIPE_PUBLISHABLE_KEY,
  },
  render: (args) =>
    renderElement(
      args,
      "Controls below rewrite mock checkout client JSON used by the element. The only direct element input remains the lang attribute.",
    ),
} satisfies Meta<ExpressCheckoutStoryArgs>;

export default meta;

type Story = StoryObj<ExpressCheckoutStoryArgs>;

export const ConfigurationPlayground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Interactive control surface for the mock checkout client payload that drives express checkout rendering.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const element = canvasElement.querySelector(
      "foxy-express-checkout",
    ) as ExpressCheckoutElement | null;

    await waitFor(() => {
      expect(element).toBeTruthy();
      expect(element?.lang).toBe(args.lang);
    });
  },
};

export const MissingConfigFallback: Story = {
  args: {
    includeStripeOption: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fallback state shown when the checkout client does not expose a supported express checkout configuration for the element.",
      },
    },
  },
  render: (args) =>
    renderElement(
      args,
      "This story verifies the client-backed missing-config guard without relying on any live wallet availability.",
    ),
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector(
      "foxy-express-checkout",
    ) as ExpressCheckoutElement | null;

    await waitFor(() => {
      expect(element?.shadowRoot?.textContent).toContain(
        "Express checkout is not configured yet.",
      );
    });
  },
};

export const Uninitialized: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Fallback state shown when the shared checkout client has not been initialized yet and exposes neither state nor JSON.",
      },
    },
  },
  render: ({ lang }) => {
    const wrapper = createStorySurface(
      "This story clears checkout client state before render so the element exercises its no-client-data fallback.",
    );
    const element = document.createElement(
      "foxy-express-checkout",
    ) as ExpressCheckoutElement;

    setCheckoutClientApiState(undefined);
    element.lang = lang;

    wrapper.append(element);
    return wrapper;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector(
      "foxy-express-checkout",
    ) as ExpressCheckoutElement | null;

    await waitFor(() => {
      expect(element?.shadowRoot?.textContent).toContain(
        "Express checkout is not configured yet.",
      );
    });
  },
};

export const LangFallbackLocale: Story = {
  args: {
    lang: "fr-CA",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uses only the inherited lang attribute. There is no separate locale prop on the element API.",
      },
    },
  },
  render: (args) =>
    renderElement(
      args,
      "Wallet availability still depends on the browser and Stripe account setup. If no buttons appear, Stripe reported no available wallets for this environment.",
    ),
};
