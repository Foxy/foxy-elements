import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "@/elements/payment-method-selector-element";

const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_STRIPE_DEMO_PUBLISHABLE_KEY?.trim() ||
  "";

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

type PaymentMethodSelectorApiLike = EventTarget & {
  state: unknown;
  updateBillingAddress?: (
    changes: Record<string, unknown>,
  ) => Promise<unknown> | void;
};

type PaymentMethodSelectorElementLike = HTMLElement & {
  api: PaymentMethodSelectorApiLike | null;
  optionIndex: number | undefined;
  tokenize(): Promise<Record<string, unknown>>;
};

class DemoPaymentApi
  extends EventTarget
  implements PaymentMethodSelectorApiLike
{
  state = structuredClone(
    baseApiState,
  ) as PaymentMethodSelectorApiLike["state"];

  updateBillingAddress(changes: Record<string, unknown>) {
    const currentState = this.state as Record<string, unknown>;
    const currentBillingAddress =
      currentState.billing_address &&
      typeof currentState.billing_address === "object"
        ? (currentState.billing_address as Record<string, unknown>)
        : {};

    this.state = {
      ...currentState,
      billing_address: {
        ...currentBillingAddress,
        ...changes,
      },
    };

    this.dispatchEvent(new CustomEvent("afterStateChange"));
  }
}

type SelectorStoryArgs = {
  apiState: unknown;
  optionIndex?: number;
};

const meta = {
  title: "Elements/Payment Method Selector",
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
    const api = new DemoPaymentApi();
    api.state = structuredClone(
      apiState,
    ) as PaymentMethodSelectorApiLike["state"];

    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElementLike;

    element.api = api;
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
          "routing_number",
          "account_number",
          "account_type",
          "account_holder_name",
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
          "routing_number",
          "account_number",
          "account_type",
          "account_holder_name",
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
