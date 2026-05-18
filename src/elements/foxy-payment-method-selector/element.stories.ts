import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "@/elements/foxy-payment-method-selector/element";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  createThemeAttributeMap,
  getShadcnInputMetrics,
} from "../../lib/theme-attribute-sync";
import { getKlarnaInitPaymentOptionFromEnv } from "@/lib/klarna-init-response";

const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_STRIPE_DEMO_PUBLISHABLE_KEY?.trim() ||
  "";

const PAYPAL_PLATFORM_CLIENT_ID =
  import.meta.env.VITE_PAYPAL_SANDBOX_CLIENT_ID?.trim() || "paypal-client-id";

function createSvgLogoDataUri(text: string, fill: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="24" viewBox="0 0 80 24" fill="none"><rect width="80" height="24" rx="12" fill="${fill}"/><text x="40" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#111">${text}</text></svg>`)}`;
}

const KLARNA_PAY_IN_FOUR_LOGO = createSvgLogoDataUri("Pay in 4", "#ffb3c7");
const KLARNA_PAY_IN_30_DAYS_LOGO = createSvgLogoDataUri("30 days", "#ffd8e4");

const SELECTOR_THEME_ATTRIBUTE_MAP = createThemeAttributeMap([
  {
    attribute: "theme-background",
    fallback: "oklch(1 0 0)",
  },
  {
    attribute: "theme-foreground",
    fallback: "oklch(0.145 0 0)",
  },
  {
    attribute: "theme-card",
    fallback: "oklch(1 0 0)",
  },
  {
    attribute: "theme-card-foreground",
    fallback: "oklch(0.145 0 0)",
  },
  {
    attribute: "theme-primary",
    fallback: "oklch(0.205 0 0)",
  },
  {
    attribute: "theme-primary-foreground",
    fallback: "oklch(0.985 0 0)",
  },
  {
    attribute: "theme-muted-foreground",
    fallback: "oklch(0.556 0 0)",
  },
  {
    attribute: "theme-destructive",
    fallback: "oklch(0.577 0.245 27.325)",
  },
  {
    attribute: "theme-border",
    fallback: "oklch(0.922 0 0)",
  },
  {
    attribute: "theme-input",
    fallback: "oklch(0.922 0 0)",
  },
  {
    attribute: "theme-ring",
    fallback: "oklch(0.708 0 0)",
  },
  {
    attribute: "theme-font-sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
  },
  {
    attribute: "theme-radius",
    fallback: "0.625rem",
  },
  {
    attribute: "theme-spacing",
    fallback: "0.25rem",
  },
] as const);

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
    locale_code: "en-US",
  },
  store: {
    name: "Foxy Demo Store",
  },
  payment_options: [{ type: "new-card", gateway: "authorize" }],
};

const PAYPAL_PLATFORM_PAYMENT_OPTIONS = [
  {
    type: "paypal",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "new-card",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "apple-pay",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "google-pay",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "paypal-pay-later",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "paypal-credit",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "venmo",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "sepa",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "bancontact",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "eps",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "blik",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "ideal",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
  {
    type: "przelewy24",
    gateway: "paypal_platform",
    client_id: PAYPAL_PLATFORM_CLIENT_ID,
  },
];

const DEFAULT_KLARNA_PAYMENT_OPTION = {
  type: "klarna",
  gateway: "klarna",
  session_id: "klarna-session-id",
  client_token: "klarna-client-token",
  payment_method_categories: [
    {
      identifier: "pay_in_4",
      name: "Pay in 4",
      asset_urls: {
        descriptive: KLARNA_PAY_IN_FOUR_LOGO,
        standard: KLARNA_PAY_IN_FOUR_LOGO,
      },
    },
    {
      identifier: "pay_in_30_days",
      name: "Pay in 30 Days",
      asset_urls: {
        descriptive: KLARNA_PAY_IN_30_DAYS_LOGO,
        standard: KLARNA_PAY_IN_30_DAYS_LOGO,
      },
    },
  ],
};

const LIVE_KLARNA_PAYMENT_OPTION = getKlarnaInitPaymentOptionFromEnv();
const KLARNA_PAYMENT_OPTIONS = [
  LIVE_KLARNA_PAYMENT_OPTION ?? DEFAULT_KLARNA_PAYMENT_OPTION,
];

function createDemoApiState(paymentOptions: unknown[]) {
  return {
    ...structuredClone(baseApiState),
    payment_options: paymentOptions,
  };
}

function createPayPalPlatformMethodApiState(type: string) {
  const paymentOption = PAYPAL_PLATFORM_PAYMENT_OPTIONS.find(
    (option) => option.type === type,
  );

  if (!paymentOption) {
    throw new Error(`Unknown PayPal Platform payment option type: ${type}`);
  }

  return createDemoApiState([structuredClone(paymentOption)]);
}

function createPayPalPlatformMethodStory(type: string): Story {
  return {
    args: {
      apiState: createPayPalPlatformMethodApiState(type),
      optionIndex: 0,
    },
  };
}

type CheckoutClientLike = EventTarget & {
  state?: unknown;
  json?: unknown;
  klarna?: unknown;
  hydrateJson?: (
    nextState: unknown,
    options?: { state?: "idle" | "busy"; emitUpdate?: boolean },
  ) => Promise<void>;
  updateBillingAddress?: (
    changes: Record<string, unknown>,
  ) => Promise<unknown> | void;
};

function seedCheckoutClientSnapshot(
  client: CheckoutClientLike,
  nextState: unknown,
): void {
  Object.defineProperty(client, "state", {
    configurable: true,
    value: undefined,
    writable: true,
  });
  Object.defineProperty(client, "json", {
    configurable: true,
    value: nextState === undefined ? undefined : structuredClone(nextState),
    writable: true,
  });
}

function clearCheckoutClientOverrides(client: CheckoutClientLike): void {
  for (const key of ["state", "json", "klarna"] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(client, key);

    if (descriptor?.configurable) {
      delete (client as unknown as Record<string, unknown>)[key];
    }
  }
}

function getKlarnaOption(apiState: unknown): Record<string, unknown> | null {
  if (!apiState || typeof apiState !== "object") {
    return null;
  }

  const paymentOptions = Array.isArray(
    (apiState as { payment_options?: unknown[] }).payment_options,
  )
    ? (apiState as { payment_options: unknown[] }).payment_options
    : [];

  for (const entry of paymentOptions) {
    if (!entry || typeof entry !== "object") continue;

    const option = entry as Record<string, unknown>;
    if (option.type === "klarna" && option.gateway === "klarna") {
      return option;
    }
  }

  return null;
}

function seedCheckoutClientKlarna(
  client: CheckoutClientLike,
  apiState: unknown,
): void {
  const klarnaOption = getKlarnaOption(apiState);

  Object.defineProperty(client, "klarna", {
    configurable: true,
    value: klarnaOption
      ? {
          Payments: {
            load: (
              options: {
                container: HTMLElement | string;
                payment_method_category?: string;
              },
              _data: Record<string, unknown>,
              callback: (result: { show_form: boolean }) => void,
            ) => {
              const container =
                typeof options.container === "string"
                  ? document.querySelector(options.container)
                  : options.container;

              if (container instanceof HTMLElement) {
                container.innerHTML = `<div data-storybook-klarna-widget="true">Klarna widget: ${options.payment_method_category ?? "unknown"}</div>`;
              }

              callback({ show_form: true });
            },
            authorize: (
              options: { payment_method_category?: string },
              _data: Record<string, unknown>,
              callback: (result: {
                approved: boolean;
                show_form: boolean;
                authorization_token?: string;
              }) => void,
            ) => {
              callback({
                approved: true,
                show_form: true,
                authorization_token: `klarna-auth-${options.payment_method_category ?? "unknown"}`,
              });
            },
            finalize: (
              options: { payment_method_category?: string },
              _data: Record<string, unknown>,
              callback: (result: {
                approved: boolean;
                show_form: boolean;
                authorization_token?: string;
              }) => void,
            ) => {
              callback({
                approved: true,
                show_form: true,
                authorization_token: `klarna-final-${options.payment_method_category ?? "unknown"}`,
              });
            },
            on: () => undefined,
            off: () => undefined,
          },
        }
      : null,
    writable: true,
  });
}

function isLiveKlarnaOption(option: Record<string, unknown> | null): boolean {
  if (!LIVE_KLARNA_PAYMENT_OPTION || !option) {
    return false;
  }

  return (
    option.session_id === LIVE_KLARNA_PAYMENT_OPTION.session_id &&
    option.client_token === LIVE_KLARNA_PAYMENT_OPTION.client_token
  );
}

function shouldUseLiveKlarnaHydration(apiState: unknown): boolean {
  return isLiveKlarnaOption(getKlarnaOption(apiState));
}

function createSelectorElement(
  optionIndex: number | undefined,
): PaymentMethodSelectorElementLike {
  const element = document.createElement(
    "foxy-payment-method-selector",
  ) as PaymentMethodSelectorElementLike;

  bindThemeAttributes(element, applySelectorThemeAttributes);
  element.optionIndex = optionIndex;

  return element;
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
  title: "Checkout/foxy-payment-method-selector",
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
    wrapper.style.width = "640px";
    const client = checkoutClient as CheckoutClientLike;

    if (shouldUseLiveKlarnaHydration(apiState) && client.hydrateJson) {
      clearCheckoutClientOverrides(client);

      void client
        .hydrateJson(structuredClone(apiState), { state: "idle" })
        .then(() => {
          wrapper.replaceChildren(createSelectorElement(optionIndex));
        })
        .catch((error) => {
          console.warn(
            "Failed to hydrate Storybook checkout client with the live Klarna session.",
            error,
          );

          seedCheckoutClientSnapshot(client, apiState);
          seedCheckoutClientKlarna(client, apiState);
          wrapper.replaceChildren(createSelectorElement(optionIndex));
        });

      return wrapper;
    }

    seedCheckoutClientSnapshot(client, apiState);
    seedCheckoutClientKlarna(client, apiState);
    wrapper.append(createSelectorElement(optionIndex));
    return wrapper;
  },
} satisfies Meta<SelectorStoryArgs>;

export default meta;

type Story = StoryObj<SelectorStoryArgs>;

export const Uninitialized: Story = {
  args: {
    apiState: undefined,
    optionIndex: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the fallback status message when the shared checkout client has not been initialized.",
      },
    },
  },
};

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

export const PurchaseOrder: Story = {
  args: {
    apiState: createDemoApiState([
      {
        type: "purchase_order",
      },
    ]),
    optionIndex: 0,
  },
};

export const Klarna: Story = {
  args: {
    apiState: createDemoApiState(KLARNA_PAYMENT_OPTIONS),
    optionIndex: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows Klarna categories flattened into separate selector entries, each using the shared SDK instance exposed by Foxy SDK.",
      },
    },
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

export const PayPal = createPayPalPlatformMethodStory("paypal");

export const PayPalPayLater =
  createPayPalPlatformMethodStory("paypal-pay-later");

export const PayPalCredit = createPayPalPlatformMethodStory("paypal-credit");

export const Venmo = createPayPalPlatformMethodStory("venmo");

export const Sepa = createPayPalPlatformMethodStory("sepa");

export const Bancontact = createPayPalPlatformMethodStory("bancontact");

export const Eps = createPayPalPlatformMethodStory("eps");

export const Blik = createPayPalPlatformMethodStory("blik");

export const Ideal = createPayPalPlatformMethodStory("ideal");

export const Przelewy24 = createPayPalPlatformMethodStory("przelewy24");

export const PayPalPlatform: Story = {
  args: {
    apiState: createDemoApiState(PAYPAL_PLATFORM_PAYMENT_OPTIONS),
    optionIndex: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the PayPal Platform payment methods discovered by Foxy SDK, including PayPal, Pay Later, wallets, and alternative payment methods.",
      },
    },
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
        type: "purchase_order",
      },
      ...KLARNA_PAYMENT_OPTIONS,
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
      ...PAYPAL_PLATFORM_PAYMENT_OPTIONS,
    ]),
    optionIndex: 0,
  },
};
