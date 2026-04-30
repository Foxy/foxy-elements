import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "@/elements/foxy-payment-method-selector/element";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  getShadcnInputMetrics,
  type ThemeAttributeMapEntry,
} from "../../lib/theme-attribute-sync";

const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_STRIPE_DEMO_PUBLISHABLE_KEY?.trim() ||
  "";

const SELECTOR_THEME_ATTRIBUTE_MAP: ThemeAttributeMapEntry[] = [
  {
    attribute: "theme-background",
    cssVariable: "--background",
    fallback: "oklch(1 0 0)",
  },
  {
    attribute: "theme-foreground",
    cssVariable: "--foreground",
    fallback: "oklch(0.145 0 0)",
  },
  {
    attribute: "theme-card",
    cssVariable: "--card",
    fallback: "oklch(1 0 0)",
  },
  {
    attribute: "theme-card-foreground",
    cssVariable: "--card-foreground",
    fallback: "oklch(0.145 0 0)",
  },
  {
    attribute: "theme-primary",
    cssVariable: "--primary",
    fallback: "oklch(0.205 0 0)",
  },
  {
    attribute: "theme-primary-foreground",
    cssVariable: "--primary-foreground",
    fallback: "oklch(0.985 0 0)",
  },
  {
    attribute: "theme-muted-foreground",
    cssVariable: "--muted-foreground",
    fallback: "oklch(0.556 0 0)",
  },
  {
    attribute: "theme-destructive",
    cssVariable: "--destructive",
    fallback: "oklch(0.577 0.245 27.325)",
  },
  {
    attribute: "theme-border",
    cssVariable: "--border",
    fallback: "oklch(0.922 0 0)",
  },
  {
    attribute: "theme-input",
    cssVariable: "--input",
    fallback: "oklch(0.922 0 0)",
  },
  {
    attribute: "theme-ring",
    cssVariable: "--ring",
    fallback: "oklch(0.708 0 0)",
  },
  {
    attribute: "theme-font-sans",
    cssVariable: "--font-sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
  },
  {
    attribute: "theme-radius",
    cssVariable: "--radius",
    fallback: "0.625rem",
  },
  {
    attribute: "theme-spacing",
    cssVariable: "--spacing",
    fallback: "0.25rem",
  },
];

function applySelectorThemeAttributes(element: HTMLElement): void {
  const metrics = getShadcnInputMetrics();
  const hostBorderTotalPx = 2;
  const hostedInputHeightPx = Math.max(
    metrics.outerHeightPx - hostBorderTotalPx,
    0,
  );

  element.setAttribute("theme-input-height", `${hostedInputHeightPx}px`);
  element.setAttribute(
    "theme-input-padding",
    `${metrics.paddingY} ${metrics.paddingX}`,
  );
  element.setAttribute("theme-input-padding-x", metrics.paddingX);
  element.setAttribute("theme-input-padding-y", metrics.paddingY);

  applyThemeAttributeMap(element, SELECTOR_THEME_ATTRIBUTE_MAP);
}

const baseApiState = {
  billing_address: {
    use_customer_shipping_address: true,
    first_name: "Taylor",
    last_name: "Morgan",
    company: "",
    address1: "123 Main Street",
    address2: "",
    city: "Minneapolis",
    region: "MN",
    postal_code: "55401",
    country: "US",
    phone: "6125550100",
  },
  shipments: [
    {
      country_options: ["US", "CA"],
      region_options: ["MN", "WI"],
    },
  ],
  template_set: {
    id: 123,
  },
  totals: [{ total_order: 22.04 }],
  format: {
    currency_code: "USD",
    maximum_fraction_digits: 2,
  },
  store: {
    name: "Foxy Demo Store",
  },
  payment_options: [{ type: "new-card", gateway: "authorize" }],
};

function createDemoApiState(paymentOptions: unknown[]) {
  return {
    ...structuredClone(baseApiState),
    payment_options: paymentOptions,
  };
}

type CheckoutClientLike = EventTarget & {
  hydrateJson: (
    nextJson: unknown,
    options?: { state?: "idle" | "busy" },
  ) => Promise<void>;
  updateBillingAddress?: (
    changes: Record<string, unknown>,
  ) => Promise<unknown> | void;
};

function seedCheckoutClientState(
  client: CheckoutClientLike,
  nextState: unknown,
): void {
  const seeded = structuredClone(nextState);
  void client.hydrateJson(seeded, { state: "idle" });
}

type PaymentMethodSelectorElementLike = HTMLElement & {
  optionIndex: number | undefined;
  tokenize(): Promise<Record<string, unknown>>;
};

type SelectorStoryArgs = {
  apiState: unknown;
  optionIndex?: number;
};

const meta = {
  title: "Elements/foxy-payment-method-selector",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Payment method selector element with configurable options, disabled states, and loading feedback.",
      },
    },
  },
  argTypes: {
    apiState: { control: "object" },
    optionIndex: { control: "number" },
  },
  args: {
    apiState: createDemoApiState([{ type: "new-card", gateway: "authorize" }]),
    optionIndex: 0,
  },
  render: ({ apiState, optionIndex }) => {
    const wrapper = document.createElement("div");
    wrapper.style.width = "420px";
    const client = checkoutClient as CheckoutClientLike;
    seedCheckoutClientState(client, apiState);

    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElementLike;

    bindThemeAttributes(element, applySelectorThemeAttributes);
    element.optionIndex = optionIndex;

    wrapper.append(element);
    return wrapper;
  },
} satisfies Meta<SelectorStoryArgs>;

export default meta;

type Story = StoryObj<SelectorStoryArgs>;

export const NewCard: Story = {
  args: {
    apiState: createDemoApiState([{ type: "new-card", gateway: "authorize" }]),
    optionIndex: 0,
  },
};

export const SavedCard: Story = {
  args: {
    apiState: createDemoApiState([
      {
        type: "saved-card",
        gateway: "authorize",
        payment_method: {
          brand: "Visa",
          last_4: "4242",
          expiry_month: "12",
          expiry_year: "2030",
          payment_method_id: "pt_saved_4242",
        },
      },
    ]),
    optionIndex: 0,
  },
};

export const StripeCardElement: Story = {
  args: {
    apiState: createDemoApiState([
      {
        type: "stripe-card-element",
        gateway: "stripe_connect",
        publishable_key: STRIPE_PUBLISHABLE_KEY,
      },
    ]),
    optionIndex: 0,
  },
};

export const StripePaymentElement: Story = {
  args: {
    apiState: createDemoApiState([
      {
        type: "stripe-payment-element",
        gateway: "stripe_v2",
        publishable_key: STRIPE_PUBLISHABLE_KEY,
        locale: "en",
      },
    ]),
    optionIndex: 0,
  },
};

export const Ach: Story = {
  args: {
    apiState: createDemoApiState([
      {
        type: "ach",
        gateway: "accept_blue_ach",
        fields: [
          "routing-number",
          "account-number",
          "account-type",
          "account-holder-name",
        ],
        account_types: ["checking", "savings"],
      },
    ]),
    optionIndex: 0,
  },
};

export const ApplePay: Story = {
  args: {
    apiState: createDemoApiState([
      {
        type: "apple-pay",
        gateway: "stripe_v2",
        merchant_id: "merchant.com.foxy.demo",
      },
    ]),
    optionIndex: 0,
  },
};

export const GooglePay: Story = {
  args: {
    apiState: createDemoApiState([
      {
        type: "google-pay",
        gateway: "stripe_v2",
        merchant_id: "merchant-123",
      },
    ]),
    optionIndex: 0,
  },
};

export const AllPaymentMethods: Story = {
  args: {
    apiState: createDemoApiState([
      {
        type: "saved-card",
        gateway: "authorize",
        payment_method: {
          brand: "Visa",
          last_4: "4242",
          expiry_month: "12",
          expiry_year: "2030",
          payment_method_id: "pt_saved_4242",
        },
      },
      {
        type: "new-card",
        gateway: "authorize",
      },
      {
        type: "stripe-card-element",
        gateway: "stripe_connect",
        publishable_key: STRIPE_PUBLISHABLE_KEY,
      },
      {
        type: "stripe-payment-element",
        gateway: "stripe_v2",
        publishable_key: STRIPE_PUBLISHABLE_KEY,
        locale: "en",
      },
      {
        type: "ach",
        gateway: "accept_blue_ach",
        fields: [
          "routing-number",
          "account-number",
          "account-type",
          "account-holder-name",
        ],
        account_types: ["checking", "savings"],
      },
      {
        type: "apple-pay",
        gateway: "stripe_v2",
        merchant_id: "merchant.com.foxy.demo",
      },
      {
        type: "google-pay",
        gateway: "stripe_v2",
        merchant_id: "merchant-123",
      },
    ]),
    optionIndex: 0,
  },
};
