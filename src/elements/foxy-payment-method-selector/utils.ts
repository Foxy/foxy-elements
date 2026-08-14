import { action } from "storybook/actions";
import { waitFor } from "storybook/test";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import { defaultTheme } from "@foxy.io/design-system/theme";
import { paymentMethodSelectorEvents } from "./events";
import type { PaymentMethodSelectorElement } from "./element";

export const PAYMENT_METHOD_SELECTOR_ELEMENT_TAG =
  "foxy-payment-method-selector";

// The story fixtures below mirror the standalone example pages: every page
// hydrated the same base checkout state and varied only payment_gateways,
// saved_payment_methods, and customer. Keeping that split here means a story is
// a gateway fixture plus a one-line override, the way the pages were.

export type StoryGateway = Record<string, unknown>;

export type StorySavedPaymentMethod = {
  gateway: string;
  brand: string;
  last_4: string;
  expiry_month: string;
  expiry_year: string;
  id: string;
};

export const AUTHORIZE_GATEWAY: StoryGateway = { type: "authorize" };

export const AUTHORIZE_ACH_GATEWAY: StoryGateway = {
  type: "authorize_ach",
  fields: [
    "routing-number",
    "account-number",
    "account-type",
    "account-holder-name",
  ],
  account_types: ["checking", "savings"],
};

export const PURCHASE_ORDER_GATEWAY: StoryGateway = { type: "purchase_order" };

export const REDIRECT_GATEWAY: StoryGateway = { type: "mollie_omnipay" };

export const AUTHORIZE_SAVED_CARD: StorySavedPaymentMethod = {
  gateway: "authorize",
  brand: "Visa",
  last_4: "4242",
  expiry_month: "12",
  expiry_year: "2030",
  id: "pm_authorize_saved_4242",
};

// The Stripe example pages read VITE_STRIPE_PUBLISHABLE_KEY first and fall back
// to VITE_STRIPE_DEMO_PUBLISHABLE_KEY. Stories keep that order so a developer
// with either variable set sees their own account, and add a syntactically
// valid last resort so the option list still renders with no env at all.
const STRIPE_STORY_FALLBACK_PUBLISHABLE_KEY = "pk_test_storybook_fixture";

export function resolveStripePublishableKey(): string {
  const env = import.meta.env as Record<string, string | undefined>;

  return (
    env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ||
    env.VITE_STRIPE_DEMO_PUBLISHABLE_KEY?.trim() ||
    STRIPE_STORY_FALLBACK_PUBLISHABLE_KEY
  );
}

export function createStripeV2Gateway(): StoryGateway {
  return {
    type: "stripe_v2",
    publishable_key: resolveStripePublishableKey(),
    account_id: "",
    return_url: "https://example.com/checkout/return",
    auth_only: false,
    locale: "en",
  };
}

export function createStripeConnectGateway(): StoryGateway {
  return {
    type: "stripe_connect",
    publishable_key: resolveStripePublishableKey(),
  };
}

export const STRIPE_SAVED_CARD: StorySavedPaymentMethod = {
  gateway: "stripe_v2",
  brand: "Visa",
  last_4: "4242",
  expiry_month: "12",
  expiry_year: "2030",
  id: "pt_saved_4242",
};

export const STRIPE_CONNECT_SAVED_CARD: StorySavedPaymentMethod = {
  ...STRIPE_SAVED_CARD,
  gateway: "stripe_connect",
};

type StoryCustomerType = "registered" | "guest";

export type StoryApiStateOptions = {
  gateways?: StoryGateway[];
  savedPaymentMethods?: StorySavedPaymentMethod[];
  customerType?: StoryCustomerType;
};

const REGISTERED_CUSTOMER = {
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  type: "registered",
  id: 123456,
  token: "jwt_demo_customer_token",
};

const GUEST_CUSTOMER = {
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  type: "guest",
  id: null,
  token: null,
};

const DEMO_ADDRESS = {
  first_name: "John",
  last_name: "Doe",
  company: "",
  phone: "+1 555-123-4567",
  address1: "123 Main St",
  address2: "Apt 4B",
  city: "New York",
  region: "NY",
  postal_code: "10001",
  country: "US",
};

/**
 * Builds the checkout state the example pages hydrated. Returns a fresh object
 * every call so one story cannot mutate the fixture another story reads.
 */
export function createApiState(
  options: StoryApiStateOptions = {},
): Record<string, unknown> {
  const {
    gateways = [AUTHORIZE_GATEWAY],
    savedPaymentMethods = [],
    customerType = "registered",
  } = options;

  return {
    template_set: { code: "checkout", id: 100 },
    session: { name: "fcsid", id: "session_123" },
    debug: false,
    customer:
      customerType === "guest"
        ? { ...GUEST_CUSTOMER }
        : { ...REGISTERED_CUSTOMER },
    shipments: [
      {
        address_id: null,
        address_name: "Home",
        ...DEMO_ADDRESS,
        shipping_service_id: null,
        has_shippable_items: true,
        has_live_rate_shippable_items: false,
        region_options: ["NY", "CA", "TX"],
        country_options: ["US", "CA"],
        shipping_service_options: [],
      },
    ],
    items: [
      {
        id: 186197199,
        name: "Margherita Pizza",
        code: "pizza-margherita",
        parent_code: null,
        image: "",
        url: "",
        length: null,
        length_unit: "inch",
        width: null,
        height: null,
        weight: 1,
        weight_unit: "pound",
        quantity: 1,
        quantity_min: 1,
        quantity_max: 10,
        base_price: 17.49,
        price_each: 17.49,
        price_each_with_tax: 19.04,
        price: 17.49,
        price_with_tax: 19.04,
        item_category_code: "DEFAULT",
        item_delivery_type: "shipped",
        delivery_type: "physical",
        downloadable_id: null,
        downloadable_url: null,
        subscription_frequency: null,
        subscription_start_date: null,
        subscription_next_transaction_date: null,
        subscription_end_date: null,
        expires: null,
      },
    ],
    totals: [
      {
        date: null,
        taxes: [],
        coupons: [],
        gift_cards: [],
        total_line_item_discount: 0,
        total_shipping: 0,
        total_shipping_with_tax: 0,
        total_shipping_value: 0,
        total_tax: 0,
        total_item_price: 17.49,
        total_item_price_with_tax: 17.49,
        total_weight: 1,
        total_weight_shippable: 1,
        total_order: 17.49,
      },
    ],
    billing_address: {
      use_customer_shipping_address: true,
      address_id: null,
      address_name: "",
      ...DEMO_ADDRESS,
    },
    store: {
      id: 1,
      name: "Demo Store",
      domain: "example.com",
      logo_url: "",
      website_url: "https://example.com",
      checkout_url: "https://example.com/checkout",
      cancel_and_continue_url: "https://example.com",
      has_location_dependent_taxes: true,
      has_eligible_gift_cards: true,
      has_eligible_coupons: true,
      supported_payment_cards: ["visa", "mastercard", "amex"],
    },
    saved_payment_methods: savedPaymentMethods.map((method) => ({ ...method })),
    payment_gateways: gateways.map((gateway) => ({ ...gateway })),
    messages: [],
    language_strings: {},
    custom_fields: {},
    format: {
      weight_unit: "pound",
      locale_code: "en-US",
      currency_code: "USD",
      currency_display: "symbol",
      maximum_fraction_digits: 2,
    },
    display: {
      hidden_product_options: [],
      required_form_fields: [],
      hidden_form_fields: [],
      use_readonly_cart_on_checkout: false,
      use_tax_inclusive_pricing: false,
      secure_data_transfer_consent: "optional",
      checkout_flow: "default",
      registration: "optional",
    },
    custom_config: {},
    express_checkout_options: [],
  };
}

/**
 * Points the shared checkout client at a story fixture and returns a cleanup
 * function that restores the previous descriptor.
 *
 * The example pages called `client.hydrateJson(...)`, which resolves PayPal
 * eligibility over the network and leaves the singleton hydrated for whatever
 * renders next. Stories run in one page, so they instead swap the `json`
 * property the element reads. That keeps every story independent of network
 * reachability and of the story that ran before it.
 */
export function applyStoryApiState(
  json: Record<string, unknown> | null,
): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(checkoutClient, "json");

  Object.defineProperty(checkoutClient, "json", {
    configurable: true,
    value: json,
  });

  checkoutClient.dispatchEvent(new Event("update"));

  return () => {
    if (descriptor) {
      Object.defineProperty(checkoutClient, "json", descriptor);
    } else {
      delete (checkoutClient as unknown as Record<string, unknown>).json;
    }

    checkoutClient.dispatchEvent(new Event("update"));
  };
}

export function createSelectorSurface(width = "600px"): HTMLDivElement {
  const element = document.createElement("div");
  element.style.width = width;
  element.style.display = "grid";
  element.style.gap = "0.75rem";
  element.style.padding = "1rem";
  element.style.background = defaultTheme.background.surface;
  element.style.color = defaultTheme.color.body;
  return element;
}

export function createStoryNote(text: string): HTMLParagraphElement {
  const note = document.createElement("p");
  note.textContent = text;
  note.style.margin = "0";
  note.style.fontSize = "0.8125rem";
  note.style.color = defaultTheme.color.secondary;
  return note;
}

export function createButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.height = "40px";
  button.style.width = "fit-content";
  button.style.border = defaultTheme.border.field;
  button.style.borderRadius = defaultTheme.borderRadius.sm;
  button.style.background = defaultTheme.background.buttonPrimary;
  button.style.color = defaultTheme.color.onButtonPrimary;
  button.style.fontSize = "0.875rem";
  button.style.fontWeight = "500";
  button.style.padding = "0 0.875rem";
  button.style.cursor = "pointer";
  return button;
}

/**
 * Mirrors the `<pre>` result panel every example page rendered next to its
 * Tokenize button.
 */
export function createResultPanel(): HTMLPreElement {
  const panel = document.createElement("pre");
  panel.setAttribute("data-story-role", "tokenize-result");
  panel.style.margin = "0";
  panel.style.whiteSpace = "pre-wrap";
  panel.style.wordBreak = "break-all";
  panel.style.fontSize = "12px";
  panel.style.color = defaultTheme.color.body;
  return panel;
}

export function createSelector(options: {
  id: string;
  lang?: string;
  optionIndex?: number;
  role?: string;
}): PaymentMethodSelectorElement {
  const selector = document.createElement(
    PAYMENT_METHOD_SELECTOR_ELEMENT_TAG,
  ) as PaymentMethodSelectorElement;

  selector.id = options.id;
  selector.setAttribute("data-story-role", options.role ?? "primary");

  if (options.lang) {
    selector.lang = options.lang;
  }

  if (options.optionIndex !== undefined) {
    selector.optionIndex = options.optionIndex;
  }

  return selector;
}

export function getPrimarySelector(
  canvasElement: HTMLElement,
): PaymentMethodSelectorElement {
  return canvasElement.querySelector(
    "[data-story-role='primary']",
  ) as PaymentMethodSelectorElement;
}

export function attachActionLogging(
  selector: PaymentMethodSelectorElement,
  label: string,
): void {
  const eventNames = Object.values(paymentMethodSelectorEvents);

  for (const eventName of eventNames) {
    const log = action(`${label}:${eventName}`);
    selector.addEventListener(eventName, (event) => {
      if (event instanceof CustomEvent) {
        log(event.detail);
        return;
      }

      log({ type: event.type });
    });
  }
}

/**
 * Wires the Tokenize button and result panel the example pages shipped, so the
 * story exercises the same `tokenize()` entry point a developer would.
 */
export function appendTokenizeControls(
  surface: HTMLElement,
  selector: PaymentMethodSelectorElement,
): { button: HTMLButtonElement; panel: HTMLPreElement } {
  const button = createButton("Tokenize");
  const panel = createResultPanel();

  button.addEventListener("click", async () => {
    panel.textContent = "";

    try {
      const result = await selector.tokenize();
      panel.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
      panel.textContent = String(error);
    }
  });

  surface.append(button, panel);
  return { button, panel };
}

// The selector renders its uninitialized alert only after a grace period, so
// waits here have to be measured in wall-clock time rather than frames.
const SELECTOR_WAIT_TIMEOUT_MS = 3000;

/**
 * Resolves once the selector has rendered its option list. The element loads
 * options asynchronously, so stories must wait rather than assert on the first
 * frame.
 */
export async function waitForOptionCount(
  selector: PaymentMethodSelectorElement,
  minimum = 1,
): Promise<HTMLElement[]> {
  await waitFor(
    () => {
      const found = readOptionRadios(selector).length;

      if (found < minimum) {
        throw new Error(
          `Expected at least ${minimum} payment option(s); found ${found}.`,
        );
      }
    },
    { timeout: SELECTOR_WAIT_TIMEOUT_MS },
  );

  return readOptionRadios(selector);
}

/**
 * Returns one element per rendered option.
 *
 * The design system's radio renders a `button[role="radio"]` alongside a hidden
 * native input, so matching `input[type="radio"]` as well would return two
 * nodes per option and make index-based selection point at the wrong option.
 */
export function readOptionRadios(
  selector: PaymentMethodSelectorElement,
): HTMLElement[] {
  return Array.from(
    selector.shadowRoot?.querySelectorAll<HTMLElement>("[role='radio']") ?? [],
  );
}

export function readSelectorText(
  selector: PaymentMethodSelectorElement,
): string {
  return selector.shadowRoot?.textContent ?? "";
}

export async function waitForSelectorText(
  selector: PaymentMethodSelectorElement,
  expected: string,
): Promise<void> {
  await waitFor(
    () => {
      if (!readSelectorText(selector).includes(expected)) {
        throw new Error(
          `Expected selector text to contain "${expected}". Rendered: ${readSelectorText(
            selector,
          ).slice(0, 400)}`,
        );
      }
    },
    { timeout: SELECTOR_WAIT_TIMEOUT_MS },
  );
}
