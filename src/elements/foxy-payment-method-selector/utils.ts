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
  /** Buyer market. Drives the address, locale and currency in the fixture. */
  country?: StoryCountry;
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
 * Buyer markets, transcribed from the per-country example pages.
 *
 * Those pages differed only by address, locale and currency, which is why they
 * collapse into one parameterised story instead of one story per country.
 */
export const STORY_COUNTRIES = {
  AT: {
    locale: "de-AT",
    currency: "EUR",
    address1: "Kärntner Straße 123",
    city: "Vienna",
    region: "Vienna",
    postalCode: "1010",
    phone: "+43 1 123 4567",
  },
  AU: {
    locale: "en-AU",
    currency: "AUD",
    address1: "123 George Street",
    city: "Sydney",
    region: "NSW",
    postalCode: "2000",
    phone: "+61 2 1234 5678",
  },
  BE: {
    locale: "nl-BE",
    currency: "EUR",
    address1: "Rue de la Loi 123",
    city: "Brussels",
    region: "Brussels",
    postalCode: "1000",
    phone: "+32 2 123 45 67",
  },
  CA: {
    locale: "en-CA",
    currency: "CAD",
    address1: "123 Main St",
    city: "Toronto",
    region: "Ontario",
    postalCode: "M5H 2N2",
    phone: "+1 416-555-1234",
  },
  CH: {
    locale: "de-CH",
    currency: "CHF",
    address1: "Bahnhofstrasse 123",
    city: "Zurich",
    region: "Zurich",
    postalCode: "8001",
    phone: "+41 44 123 45 67",
  },
  CZ: {
    locale: "cs-CZ",
    currency: "CZK",
    address1: "Václavské náměstí 123",
    city: "Prague",
    region: "Prague",
    postalCode: "110 00",
    phone: "+420 222 123 456",
  },
  DE: {
    locale: "de-DE",
    currency: "EUR",
    address1: "Hauptstraße 123",
    city: "Berlin",
    region: "Berlin",
    postalCode: "10115",
    phone: "+49 30 12345678",
  },
  ES: {
    locale: "es-ES",
    currency: "EUR",
    address1: "Calle de Alcalá 123",
    city: "Madrid",
    region: "Madrid",
    postalCode: "28001",
    phone: "+34 91 123 45 67",
  },
  FR: {
    locale: "fr-FR",
    currency: "EUR",
    address1: "123 Rue de Rivoli",
    city: "Paris",
    region: "Île-de-France",
    postalCode: "75001",
    phone: "+33 1 23 45 67 89",
  },
  GB: {
    locale: "en-GB",
    currency: "GBP",
    address1: "123 High Street",
    city: "London",
    region: "ENG",
    postalCode: "EC1A 1BB",
    phone: "+44 20 7946 0958",
  },
  IE: {
    locale: "en-IE",
    currency: "EUR",
    address1: "123 O'Connell Street",
    city: "Dublin",
    region: "Leinster",
    postalCode: "D01 T6F0",
    phone: "+353 1 234 5678",
  },
  IT: {
    locale: "it-IT",
    currency: "EUR",
    address1: "Via del Corso 123",
    city: "Rome",
    region: "Lazio",
    postalCode: "00100",
    phone: "+39 06 1234 5678",
  },
  NL: {
    locale: "nl-NL",
    currency: "EUR",
    address1: "Damrak 123",
    city: "Amsterdam",
    region: "Noord-Holland",
    postalCode: "1012 AB",
    phone: "+31 20 123 4567",
  },
  NO: {
    locale: "nb-NO",
    currency: "NOK",
    address1: "Karl Johans gate 123",
    city: "Oslo",
    region: "Oslo",
    postalCode: "0150",
    phone: "+47 22 12 34 56",
  },
  NZ: {
    locale: "en-NZ",
    currency: "NZD",
    address1: "123 Queen Street",
    city: "Auckland",
    region: "Auckland",
    postalCode: "1010",
    phone: "+64 9 123 4567",
  },
  PL: {
    locale: "pl-PL",
    currency: "PLN",
    address1: "ul. Nowy Świat 123",
    city: "Warsaw",
    region: "Masovian",
    postalCode: "00-001",
    phone: "+48 22 123 45 67",
  },
  RS: {
    locale: "sr-RS",
    currency: "RSD",
    address1: "Knez Mihailova 123",
    city: "Belgrade",
    region: "Belgrade",
    postalCode: "11000",
    phone: "+381 11 123 4567",
  },
  SE: {
    locale: "sv-SE",
    currency: "SEK",
    address1: "Drottninggatan 123",
    city: "Stockholm",
    region: "Stockholm",
    postalCode: "111 51",
    phone: "+46 8 123 456 78",
  },
  US: {
    locale: "en-US",
    currency: "USD",
    address1: "123 Main St",
    city: "New York",
    region: "NY",
    postalCode: "10001",
    phone: "+1 555-123-4567",
  },
} as const;

export type StoryCountry = keyof typeof STORY_COUNTRIES;

export const STORY_COUNTRY_CODES = Object.keys(
  STORY_COUNTRIES,
) as StoryCountry[];

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
    country = "US",
  } = options;

  const market = STORY_COUNTRIES[country];
  const address = {
    ...DEMO_ADDRESS,
    phone: market.phone,
    address1: market.address1,
    address2: "",
    city: market.city,
    region: market.region,
    postal_code: market.postalCode,
    country,
  };

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
        ...address,
        shipping_service_id: null,
        has_shippable_items: true,
        has_live_rate_shippable_items: false,
        region_options: [market.region],
        country_options: [country],
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
      ...address,
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
      locale_code: market.locale,
      currency_code: market.currency,
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
 * Replaces properties on the shared checkout client and returns a cleanup
 * function that restores every previous descriptor.
 *
 * Gateway-backed options do not come from `json` alone: the element also reads
 * resolved SDK handles off the client (`klarna`, `adyenEmbedded`, `paypal`,
 * `square`). Every one of them has to be restored, or a gateway story leaks its
 * stub into whatever renders next and the following story passes for the wrong
 * reason.
 */
export function overrideCheckoutClient(
  properties: Record<string, unknown>,
): () => void {
  const descriptors = new Map<string, PropertyDescriptor | undefined>();

  for (const [key, value] of Object.entries(properties)) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(checkoutClient, key));
    Object.defineProperty(checkoutClient, key, {
      configurable: true,
      value,
    });
  }

  checkoutClient.dispatchEvent(new Event("update"));

  return () => {
    for (const [key, descriptor] of descriptors.entries()) {
      if (descriptor) {
        Object.defineProperty(checkoutClient, key, descriptor);
      } else {
        delete (checkoutClient as unknown as Record<string, unknown>)[key];
      }
    }

    checkoutClient.dispatchEvent(new Event("update"));
  };
}

/**
 * Points the shared checkout client at a story fixture and returns a cleanup
 * function.
 *
 * The example pages called `client.hydrateJson(...)`, which resolves PayPal
 * eligibility over the network and leaves the singleton hydrated for whatever
 * renders next. Stories run in one page, so they instead swap the properties
 * the element reads. That keeps every story independent of network
 * reachability and of the story that ran before it.
 *
 * Pass `sdk` for gateways whose options come from a resolved SDK handle rather
 * than from checkout state alone.
 */
export function applyStoryApiState(
  json: Record<string, unknown> | null,
  sdk: Record<string, unknown> = {},
): () => void {
  return overrideCheckoutClient({ json, ...sdk });
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

// ---------------------------------------------------------------------------
// Gateway fixtures
//
// These gateways resolve their options through an SDK handle on the checkout
// client rather than from checkout state alone. The example pages got those
// handles by opening real sandbox sessions, which is why the pages needed
// credentials and went stale. The stubs below expose the same surface the
// element calls, so the stories render the identical option list offline.
// Shapes follow the fixtures element.test.ts already exercises.
// ---------------------------------------------------------------------------

function createSvgLogoDataUri(text: string, fill: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="24" viewBox="0 0 80 24" fill="none"><rect width="80" height="24" rx="12" fill="${fill}"/><text x="40" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#111">${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const KLARNA_PAY_IN_FOUR_LOGO = createSvgLogoDataUri("Pay in 4", "#ffb3c7");
const KLARNA_PAY_IN_30_DAYS_LOGO = createSvgLogoDataUri("30 days", "#ffd8e4");

export function createKlarnaGateway(): StoryGateway {
  return {
    type: "klarna",
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
}

/**
 * Stubs `Klarna.Payments`. `load` reports every category as available and
 * paints the container so the mounted widget is visible in the story.
 */
export function createKlarnaSdk(): Record<string, unknown> {
  return {
    Payments: {
      load: (
        options: { container?: string; payment_method_category?: string },
        _data: unknown,
        callback?: (response: { show_form: boolean }) => void,
      ) => {
        const container =
          typeof options?.container === "string"
            ? document.querySelector(options.container)
            : null;

        if (container instanceof HTMLElement) {
          container.textContent = `Klarna widget: ${
            options.payment_method_category ?? "unknown"
          }`;
        }

        callback?.({ show_form: true });
      },
      authorize: (
        _options: unknown,
        _data: unknown,
        callback?: (response: Record<string, unknown>) => void,
      ) => callback?.({ approved: true, authorization_token: "klarna-token" }),
      finalize: () => undefined,
      on: () => undefined,
      off: () => undefined,
    },
  };
}

export const ADYEN_EMBEDDED_GATEWAY: StoryGateway = {
  type: "adyen_embedded",
  payment_methods_response: {
    paymentMethods: [{ type: "scheme", name: "Cards" }],
  },
  environment: "test",
  client_key: "adyen-client-key",
};

/**
 * Stubs the Adyen `Dropin` constructor. `mount` writes into the host element,
 * which is what the story asserts on: the Drop-in is mounted by the element
 * rather than rendered as a plain radio option.
 */
export function createAdyenSdk(): Record<string, unknown> {
  function Dropin(
    this: Record<string, unknown>,
    _checkout: unknown,
    props?: Record<string, unknown>,
  ) {
    const componentProps = props ?? {};
    this.props = componentProps;
    this.mount = (container: HTMLElement) => {
      container.textContent = `Adyen ${componentProps.type ?? "dropin"}`;
      return this;
    };
    this.unmount = () => undefined;
    this.isAvailable = () => Promise.resolve();
    this.submit = () => undefined;
  }

  return { Dropin };
}

export const PAYPAL_PLATFORM_GATEWAY: StoryGateway = {
  type: "paypal_platform",
  client_id: "paypal-client-id",
};

/**
 * Session creator per eligibility key. An option needs both: the SDK reporting
 * the funding source eligible, and a matching create*Session function. Listing
 * a funding source without its creator silently drops the option.
 */
const PAYPAL_SESSION_CREATOR_BY_FUNDING_SOURCE: Record<string, string> = {
  advanced_cards: "createCardFieldsOneTimePaymentSession",
  applepay: "createApplePayOneTimePaymentSession",
  googlepay: "createGooglePayOneTimePaymentSession",
  paylater: "createPayLaterOneTimePaymentSession",
  credit: "createPayPalCreditOneTimePaymentSession",
  venmo: "createVenmoOneTimePaymentSession",
  sepa: "createSepaOneTimePaymentSession",
  bancontact: "createBancontactOneTimePaymentSession",
  eps: "createEpsOneTimePaymentSession",
  blik: "createBlikOneTimePaymentSession",
  ideal: "createIdealOneTimePaymentSession",
  p24: "createP24OneTimePaymentSession",
};

export const PAYPAL_DEFAULT_FUNDING_SOURCES = ["paylater", "venmo"];

/**
 * Stubs the PayPal SDK. The selector renders the base PayPal entry plus one
 * option per eligible funding source, so the list is driven by this set.
 */
export function createPayPalSdk(
  fundingSources: string[] = PAYPAL_DEFAULT_FUNDING_SOURCES,
): Record<string, unknown> {
  const eligible = new Set(fundingSources);
  const createSession = async () => ({ id: "paypal-session-id" });

  const paypal: Record<string, unknown> = {
    findEligibleMethods: async () => ({
      isEligible: (fundingSource: string) => eligible.has(fundingSource),
      getDetails: () => null,
    }),
    // The base PayPal entry is always offered when the gateway is configured.
    createPayPalOneTimePaymentSession: createSession,
  };

  for (const fundingSource of eligible) {
    const creator = PAYPAL_SESSION_CREATOR_BY_FUNDING_SOURCE[fundingSource];
    if (creator) {
      paypal[creator] = createSession;
    }
  }

  return paypal;
}

export const SEZZLE_GATEWAY: StoryGateway = { type: "sezzle" };

/**
 * Square resolves nothing through an SDK handle to build its option list: the
 * element derives the buyer country from `format.locale_code` and looks the
 * available methods up in a static table. So this fixture needs no stub — but
 * `application_id`, `location_id` and a valid `environment` are all mandatory,
 * and the option is dropped silently if any is missing.
 */
export const SQUARE_UP_GATEWAY: StoryGateway = {
  type: "square_up",
  application_id: "sandbox-sq0idb-story-fixture",
  location_id: "square-location-id",
  environment: "sandbox",
};

/**
 * Expected Square methods per market, mirroring the table the element uses.
 * Markets absent here fall back to card-only. Kept beside the story so it can
 * assert the market-dependent list rather than a fixed count.
 */
export const SQUARE_UP_STORY_METHODS_BY_COUNTRY: Partial<
  Record<StoryCountry, string[]>
> = {
  US: ["new-card", "ach", "apple-pay", "google-pay", "cash-app", "afterpay"],
  CA: ["new-card", "apple-pay", "google-pay", "afterpay"],
  AU: ["new-card", "apple-pay", "google-pay", "afterpay"],
  GB: ["new-card", "apple-pay", "google-pay", "afterpay"],
  FR: ["new-card", "apple-pay", "google-pay"],
  IE: ["new-card", "apple-pay", "google-pay"],
  ES: ["new-card", "apple-pay", "google-pay"],
};

export const SQUARE_UP_STORY_DEFAULT_METHODS = ["new-card"];

export function expectedSquareMethods(country: StoryCountry): string[] {
  return (
    SQUARE_UP_STORY_METHODS_BY_COUNTRY[country] ??
    SQUARE_UP_STORY_DEFAULT_METHODS
  );
}

/**
 * Stubs Square's Web Payments SDK.
 *
 * Unlike the other gateways this shape is derived from the embed's own type
 * definitions in `embeds/square-web-payments.tsx` rather than from an existing
 * test fixture, because nothing in the suite mounts a Square component. Each
 * factory resolves to a component whose `attach` paints the container, so the
 * story shows where the real widget would render.
 *
 * It also keeps the story fast. The embed polls for `checkoutClient.square`
 * rather than failing when it is absent, and without the stub the US option
 * list took over three seconds to appear (it did still appear — this is a
 * delay, not a deadlock).
 */
export function createSquareSdk(): Record<string, unknown> {
  const createComponent = (label: string) => ({
    attach: async (target: string | HTMLElement) => {
      const container =
        typeof target === "string" ? document.querySelector(target) : target;

      if (container instanceof HTMLElement) {
        container.textContent = `Square ${label}`;
      }
    },
    destroy: async () => undefined,
    tokenize: async () => ({ status: "OK", token: `square-token-${label}` }),
  });

  return {
    card: async () => createComponent("card"),
    ach: async () => createComponent("ach"),
    paymentRequest: () => ({}),
    applePay: async () => createComponent("apple-pay"),
    googlePay: async () => createComponent("google-pay"),
    cashApp: async () => createComponent("cash-app"),
    afterpayClearpay: async () => createComponent("afterpay"),
  };
}
