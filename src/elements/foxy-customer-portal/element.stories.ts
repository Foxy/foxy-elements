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
  // `allow_frequency_modification`'s `jsonata_query` deliberately excludes
  // one frequency ("1y") rather than allowing everything: that is what gives
  // the rail's two frequency states both a fixture, from one shared settings
  // object -- a subscription on any other frequency gets the editable
  // Select, while the annual one (`future-end`, below) gets zero allowed
  // frequencies and falls through to the read-only row instead, live rather
  // than only once ended.
  subscriptions: {
    allow_frequency_modification: [
      {
        jsonata_query: 'frequency != "1y"',
        values: ["1w", "1m", "3m", "6m", "1y"],
      },
    ],
    allow_next_date_modification: true,
  },
  cart_display_config: {
    show_product_options: true,
    show_product_weight: true,
    show_product_code: true,
  },
};

const SUBSCRIPTIONS_HREF = `${STORE_BASE}subscriptions`;
const TRANSACTIONS_HREF = `${STORE_BASE}transactions`;
const ADDRESSES_HREF = `${STORE_BASE}customer_addresses`;
const PAYMENT_METHOD_HREF = `${STORE_BASE}default_payment_method`;
const COUNTRIES_HREF = `${STORE_BASE}property_helpers/countries`;
const REGIONS_HREF = `${STORE_BASE}property_helpers/regions`;

/**
 * The store's country and region lists, in the v1 property-helper shape the
 * API returns (see FX-367).
 *
 * A deliberately small subset rather than every country: the point of these
 * endpoints is that the form offers what the STORE sells to, and a fixture
 * carrying all 254 would look identical to the hardcoded table this replaced.
 * The store here ships to fewer countries than it bills to, so the two
 * `address_type` values actually differ.
 */
const COUNTRY_VALUES: Record<string, Record<string, unknown>> = {
  US: { default: "United States", cc2: "US", cc3: "USA", has_regions: true, regions_required: true, regions_type: "state", active: true },
  CA: { default: "Canada", cc2: "CA", cc3: "CAN", has_regions: true, regions_required: true, regions_type: "province", active: true },
  JP: { default: "Japan", cc2: "JP", cc3: "JPN", has_regions: true, regions_required: true, regions_type: "prefecture", active: true },
  GB: { default: "United Kingdom", cc2: "GB", cc3: "GBR", has_regions: false, regions_required: false, regions_type: null, active: true },
  DE: { default: "Germany", cc2: "DE", cc3: "DEU", has_regions: false, regions_required: false, regions_type: null, active: true },
};

/** Billing reaches further than shipping, which is the common real shape. */
const SHIPPING_ONLY = new Set(["US", "CA", "GB"]);

const REGION_VALUES: Record<string, Record<string, Record<string, unknown>>> = {
  US: {
    IL: { default: "Illinois", code: "IL", active: true },
    CA: { default: "California", code: "CA", active: true },
    NY: { default: "New York", code: "NY", active: true },
  },
  CA: {
    ON: { default: "Ontario", code: "ON", active: true },
    QC: { default: "Quebec", code: "QC", active: true },
  },
  JP: {
    "13": { default: "Tokyo", code: "13", active: true },
    "27": { default: "Osaka", code: "27", active: true },
  },
};

function customerLinks() {
  return {
    self: { href: `${STORE_BASE}customer` },
    "fx:subscriptions": { href: SUBSCRIPTIONS_HREF },
    "fx:transactions": { href: TRANSACTIONS_HREF },
    "fx:customer_addresses": { href: ADDRESSES_HREF },
    "fx:default_payment_method": { href: PAYMENT_METHOD_HREF },
    "fx:countries": { href: COUNTRIES_HREF },
    "fx:regions": { href: REGIONS_HREF },
  };
}

/**
 * A saved card, in the shape `fx:default_payment_method` really returns:
 * `cc_number_masked` carries the full masked string, not just the last four,
 * so the UI has to slice it (see `payment-method.tsx`).
 */
const DEFAULT_PAYMENT_METHOD = {
  cc_type: "visa",
  cc_number_masked: "************4242",
  cc_exp_month: "08",
  cc_exp_year: "2028",
};

/** A customer who has never saved a card: the API answers with blank fields. */
const NO_PAYMENT_METHOD = {
  cc_type: "",
  cc_number_masked: "",
  cc_exp_month: "",
  cc_exp_year: "",
};

const DEFAULT_CUSTOMER = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  tax_id: "GB123456789",
  _links: customerLinks(),
};

/** Minimal profile: a name and an email, nothing else — no tax ID. */
const EMPTY_CUSTOMER = {
  first_name: "Sam",
  last_name: "Taylor",
  email: "sam.taylor@example.com",
  tax_id: "",
  _links: customerLinks(),
};

/**
 * Deliberately long on every field a layout could fail to wrap or truncate:
 * a hyphenated surname, a long domain, and a real tax ID.
 */
const LONG_TIME_CUSTOMER = {
  first_name: "Bartholomew",
  last_name: "Featherstonehaugh-Worthington",
  email: "bartholomew.featherstonehaugh-worthington@a-rather-long-company-example.com",
  tax_id: "GB999888777",
  _links: customerLinks(),
};

/**
 * A stand-in for `fx:item.image`. Inline SVG rather than a hosted URL so the
 * thumbnail renders identically with no network — these stories run in a real
 * Chromium with `fetch` stubbed, so any remote image would silently 404 and
 * every card would fall back to the empty swatch, hiding the very state this
 * fixture exists to show.
 */
function itemImage(hue: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">` +
    `<rect width="96" height="96" fill="hsl(${hue} 42% 72%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

type SubscriptionItemFixture = {
  name: string;
  quantity: number;
  image?: string;
  code?: string;
  parent_code?: string;
  price?: number;
  weight?: number;
  _embedded?: { "fx:item_options"?: { name: string; value: string }[] };
};

type SubscriptionFixture = {
  frequency: string;
  start_date: string;
  next_transaction_date: string;
  end_date: string | null;
  is_active: boolean;
  error_message: string;
  first_failed_transaction_date: string | null;
  past_due_amount?: number;
  _links: {
    self: { href: string };
    "fx:last_transaction"?: { href: string };
    "fx:transactions"?: { href: string };
    "fx:sub_token_url"?: { href: string };
    "fx:sub_modification_url"?: { href: string };
  };
  _embedded: {
    "fx:transaction_template": {
      currency_code: string;
      total_order: number;
      // Unlike `total_order`, the real API sends these as decimal STRINGS --
      // see `card.tsx`'s own note on the same trap. A number here would
      // typecheck but hide a real bug the rail's `Number()` coercion exists
      // to guard against.
      total_item_price: string;
      total_tax: string;
      total_shipping: string;
      shipping_address1?: string;
      shipping_address2?: string;
      shipping_city?: string;
      shipping_state?: string;
      shipping_postal_code?: string;
      shipping_country?: string;
      _embedded: { "fx:items": SubscriptionItemFixture[] };
    };
  };
};

/** A hosted-cart token link -- just enough of a real URL for `tokenLink()`'s `new URL()` to accept. */
function subTokenLink(id: string): { href: string } {
  return { href: `${STORE_BASE}cart?sub_token=tok-${id}` };
}

/**
 * A subscription's own `fx:transactions` link -- a per-subscription payment
 * history, distinct from the customer-wide orders collection at
 * `TRANSACTIONS_HREF` (see `subscriptionPaymentsFor`/the stub branch below).
 * `subscription-page.tsx` reads this rel to fill the Payment history table.
 */
function subTransactionsLink(id: string): { href: string } {
  return { href: `${SUBSCRIPTIONS_HREF}/${id}/transactions` };
}

const DEFAULT_ACTIVE_SUBSCRIPTIONS: SubscriptionFixture[] = [
  /**
   * The feature-complete fixture: four items (one past the three-per-page
   * limit, so the pager renders), and the first item carries a weight, a
   * code, and item options all at once -- without at least one item like
   * this, the weight row has nothing to render in any story (see
   * `item-details.ts`: it's gated on `item.weight`, and no fixture ever set
   * one before). Live with no end date, so its Cancel link renders active
   * rather than inert.
   */
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
      "fx:last_transaction": { href: `${TRANSACTIONS_HREF}/100` },
      "fx:transactions": subTransactionsLink("0"),
      "fx:sub_token_url": subTokenLink("0"),
      // The Items section's "Modify items" link-out (spec §3). Only this
      // fixture carries it, so the subscription page's story shows the link
      // while the others cover the store-has-no-rel case.
      "fx:sub_modification_url": {
        href: "https://demo.foxycart.com/cart?sub_modify=0",
      },
    },
    _embedded: {
      "fx:transaction_template": {
        currency_code: "USD",
        total_order: 42,
        total_item_price: "36.50",
        total_tax: "1.50",
        total_shipping: "4.00",
        shipping_address1: "12 Analytical Engine Way",
        shipping_address2: "",
        shipping_city: "London",
        shipping_state: "",
        shipping_postal_code: "SW1A 1AA",
        shipping_country: "GB",
        _embedded: {
          "fx:items": [
            {
              name: "Coffee",
              quantity: 1,
              price: 18,
              code: "COFFEE-DARK-12OZ",
              weight: 12,
              image: itemImage(24),
              _embedded: {
                "fx:item_options": [
                  { name: "Roast", value: "Dark" },
                  { name: "Grind", value: "Whole bean" },
                ],
              },
            },
            { name: "Filters", quantity: 2, price: 6, image: itemImage(96) },
            { name: "Travel Mug", quantity: 1, price: 8.5 },
            { name: "Reusable Pods", quantity: 3, price: 3 },
          ],
        },
      },
    },
  },
  /**
   * Past due: a failed transaction with no end date reads as `failed` (see
   * `status.ts`), which is what puts the page's Alert up top and the rail's
   * error-styled Past due row on screen at once.
   */
  {
    frequency: "3m",
    start_date: "2019-06-01T00:00:00-0800",
    next_transaction_date: "2026-09-15T00:00:00-0800",
    end_date: null,
    is_active: true,
    error_message: "The card on file was declined.",
    first_failed_transaction_date: "2026-08-01T00:00:00-0800",
    past_due_amount: 24.99,
    _links: {
      self: { href: `${SUBSCRIPTIONS_HREF}/past-due` },
      "fx:last_transaction": { href: `${TRANSACTIONS_HREF}/101` },
      "fx:transactions": subTransactionsLink("past-due"),
      "fx:sub_token_url": subTokenLink("past-due"),
    },
    _embedded: {
      "fx:transaction_template": {
        currency_code: "USD",
        total_order: 30,
        total_item_price: "28.00",
        total_tax: "2.00",
        total_shipping: "0.00",
        _embedded: {
          "fx:items": [{ name: "Tea Sampler", quantity: 1, price: 28 }],
        },
      },
    },
  },
  /**
   * Live, but with a future end date already queued (`next_transaction_date`
   * lands before it, so `status.ts` reads `will_end_after_payment`) -- the
   * Cancel link must render inert rather than let a second cancellation
   * queue. Its frequency ("1y") is the one `SETTINGS`'s jsonata rule above
   * excludes, so this is also the fixture that exercises the *live*
   * read-only Frequency row, not just the ended one.
   */
  {
    frequency: "1y",
    start_date: "2021-01-01T00:00:00-0800",
    next_transaction_date: "2099-02-01T00:00:00-0800",
    end_date: "2099-06-01T00:00:00-0800",
    is_active: true,
    error_message: "",
    first_failed_transaction_date: null,
    _links: {
      self: { href: `${SUBSCRIPTIONS_HREF}/future-end` },
      "fx:last_transaction": { href: `${TRANSACTIONS_HREF}/102` },
      "fx:transactions": subTransactionsLink("future-end"),
      "fx:sub_token_url": subTokenLink("future-end"),
    },
    _embedded: {
      "fx:transaction_template": {
        currency_code: "USD",
        total_order: 60,
        total_item_price: "55.00",
        total_tax: "5.00",
        total_shipping: "0.00",
        _embedded: {
          "fx:items": [{ name: "Annual Bean Box", quantity: 1, price: 55 }],
        },
      },
    },
  },
];

const DEFAULT_INACTIVE_SUBSCRIPTIONS: SubscriptionFixture[] = [];

/** `count` synthetic subscriptions, split three ways across frequency/price for visual variety. */
function buildSubscriptions(
  count: number,
  isActive: boolean,
): SubscriptionFixture[] {
  const frequencies = ["1m", "3m", "1y"];

  return Array.from({ length: count }, (_, i) => {
    const code = `BUNDLE-${isActive ? "a" : "i"}-${i}`;

    // Every third subscription is a bundle: one parent item with two children
    // hanging off its `code`. That is what drives the card's parent/child
    // breakdown and its 2x2 thumbnail grid, so both that layout and the
    // single-item one appear in the same story rather than only the latter.
    const items: SubscriptionItemFixture[] =
      i % 3 === 1
        ? [
            {
              name: "Coffee Subscription — Dark Roast",
              quantity: 1,
              code,
              price: 16,
              // Carries a weight, a code (already set above) and options
              // too, so the item-detail rows have something to render for
              // the bundle layout specifically, not only the single-item one.
              weight: 14,
              image: itemImage(18),
              _embedded: {
                "fx:item_options": [{ name: "Roast", value: "Medium" }],
              },
            },
            {
              name: "Extra Filters",
              quantity: 2,
              parent_code: code,
              price: 4,
              image: itemImage(96),
            },
            { name: "Coffee Mugs", quantity: 1, parent_code: code, price: 9 },
          ]
        : [
            {
              name: `Subscription item ${i + 1}`,
              quantity: 1 + (i % 3),
              price: 5 + i,
              // Every fourth one carries no image, so the empty fallback
              // swatch is on screen next to real thumbnails.
              ...(i % 4 === 3 ? {} : { image: itemImage((i * 47) % 360) }),
            },
          ];

    const totalOrder = 10 + i * 3;

    return {
      frequency: frequencies[i % frequencies.length],
      // One that has not started yet, so the Start date caption -- which only
      // shows while the date is still ahead -- appears somewhere in the story.
      start_date:
        isActive && i === 2 ? "2099-06-01T00:00:00-0800" : "2018-01-01T00:00:00-0800",
      next_transaction_date: isActive
        ? "2099-01-01T00:00:00-0800"
        : "2021-06-01T00:00:00-0800",
      end_date: isActive ? null : "2021-06-01T00:00:00-0800",
      is_active: isActive,
      error_message:
        !isActive && i % 6 === 0 ? "The card on file was declined." : "",
      first_failed_transaction_date: null,
      _links: {
        self: {
          href: `${SUBSCRIPTIONS_HREF}/${isActive ? "active" : "inactive"}-${i}`,
        },
        "fx:last_transaction": { href: `${TRANSACTIONS_HREF}/${200 + i}` },
        "fx:transactions": subTransactionsLink(
          `${isActive ? "active" : "inactive"}-${i}`,
        ),
        "fx:sub_token_url": subTokenLink(`${isActive ? "active" : "inactive"}-${i}`),
      },
      _embedded: {
        "fx:transaction_template": {
          currency_code: "USD",
          total_order: totalOrder,
          total_item_price: (totalOrder - 2).toFixed(2),
          total_tax: "0.50",
          total_shipping: "1.50",
          shipping_address1: "100 Main Street",
          shipping_city: "Springfield",
          shipping_state: "IL",
          shipping_postal_code: "62704",
          shipping_country: "US",
          _embedded: { "fx:items": items },
        },
      },
    };
  });
}

const LONG_TIME_ACTIVE_SUBSCRIPTIONS = buildSubscriptions(15, true);
const LONG_TIME_INACTIVE_SUBSCRIPTIONS = buildSubscriptions(12, false);

type OrderFixture = {
  id: number;
  display_id: number;
  transaction_date: string;
  total_order: number;
  total_item_price: string;
  total_tax: string;
  total_shipping: string;
  currency_code: string;
  status: string;
  _links: {
    self: { href: string };
    "fx:receipt"?: { href: string };
  };
  _embedded: {
    "fx:items": { name: string; quantity: number; price: number }[];
  };
};

const DEFAULT_ORDERS: OrderFixture[] = [
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
      "fx:receipt": { href: `${TRANSACTIONS_HREF}/100/receipt` },
    },
    _embedded: {
      "fx:items": [{ name: "Widget", quantity: 1, price: 25 }],
    },
  },
];

/** `count` synthetic orders spread across a year, cycling through a few statuses. */
function buildOrders(count: number): OrderFixture[] {
  const statuses = ["approved", "approved", "approved", "refunded", "pending_fraud_review"];

  return Array.from({ length: count }, (_, i) => {
    const month = String((i % 12) + 1).padStart(2, "0");
    const day = String((i % 28) + 1).padStart(2, "0");
    const price = 15 + i * 4;

    return {
      id: 200 + i,
      display_id: 200 + i,
      transaction_date: `2024-${month}-${day}T12:00:00-0800`,
      total_order: price,
      total_item_price: price.toFixed(2),
      total_tax: "0.00",
      total_shipping: "0.00",
      currency_code: "USD",
      status: statuses[i % statuses.length],
      _links: {
        self: { href: `${TRANSACTIONS_HREF}/${200 + i}` },
        // Every fifth order has no receipt, so the column shows both the
        // link and the blank it leaves behind.
        ...(i % 5 === 4
          ? {}
          : {
              "fx:receipt": { href: `${TRANSACTIONS_HREF}/${200 + i}/receipt` },
            }),
      },
      _embedded: {
        "fx:items": [{ name: `Order item ${i + 1}`, quantity: 1, price }],
      },
    };
  });
}

const LONG_TIME_ORDERS = buildOrders(25);

/**
 * `count` synthetic payments for one subscription's own `fx:transactions`
 * link. Separate from `buildOrders` above: that seeds the customer-wide
 * orders collection at `TRANSACTIONS_HREF`, while this seeds the
 * per-subscription resource `subTransactionsLink` points at -- a different
 * href namespace, so the two need their own id space to stay distinct in
 * the stub below (`9000 + subscriptionSeed` keeps every subscription's
 * payments numbered apart from one another and from `buildOrders`' `200+`).
 */
function buildSubscriptionPayments(
  subscriptionId: string,
  count: number,
): OrderFixture[] {
  const statuses = ["approved", "approved", "refunded"];
  // A short, stable hash of the id -- so the same subscription always shows
  // the same payments across a re-render, rather than colliding on id 0 with
  // every other subscription's own transactions.
  let seed = 0;
  for (const ch of subscriptionId) seed = (seed * 31 + ch.charCodeAt(0)) % 5000;

  return Array.from({ length: count }, (_, i) => {
    const month = String((i % 12) + 1).padStart(2, "0");
    const price = 12 + i * 4;
    const id = 9000 + seed * 10 + i;
    const href = `${SUBSCRIPTIONS_HREF}/${subscriptionId}/transactions/${i}`;

    return {
      id,
      display_id: id,
      transaction_date: `2025-${month}-01T12:00:00-0800`,
      total_order: price,
      total_item_price: price.toFixed(2),
      total_tax: "0.00",
      total_shipping: "0.00",
      currency_code: "USD",
      status: statuses[i % statuses.length],
      _links: {
        self: { href },
        ...(i % 3 === 2 ? {} : { "fx:receipt": { href: `${href}/receipt` } }),
      },
      _embedded: {
        "fx:items": [{ name: `Payment ${i + 1}`, quantity: 1, price }],
      },
    };
  });
}

/**
 * Deterministic 2-5 payments per subscription id, so every subscription's
 * Payment history table has something to show -- without every fixture
 * array above having to build its own list by hand.
 */
function subscriptionPaymentsFor(id: string): OrderFixture[] {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return buildSubscriptionPayments(id, (hash % 4) + 2);
}

const DEFAULT_ADDRESSES = [
  {
    address_name: "Home",
    first_name: "Ada",
    last_name: "Lovelace",
    company: "",
    phone: "",
    address1: "12 Analytical Engine Way",
    address2: "",
    city: "London",
    region: "",
    postal_code: "SW1A 1AA",
    country: "GB",
    is_default_billing: true,
    is_default_shipping: true,
    date_created: "2020-01-01T00:00:00-0800",
    date_modified: "2020-01-01T00:00:00-0800",
    _links: {
      self: { href: `${ADDRESSES_HREF}/0` },
    },
  },
];

/**
 * The one default address plus two ordinary ones, so the section shows both
 * of its halves at once: the billing/shipping summaries, and the Saved
 * addresses list below them -- which excludes the defaults, because they are
 * already summarised above.
 */
const MIXED_ADDRESSES = [
  DEFAULT_ADDRESSES[0],
  {
    ...DEFAULT_ADDRESSES[0],
    address_name: "Office",
    address1: "47 Difference Engine Road",
    city: "Cambridge",
    postal_code: "CB2 1TN",
    is_default_billing: false,
    is_default_shipping: false,
    _links: { self: { href: `${ADDRESSES_HREF}/1` } },
  },
  {
    ...DEFAULT_ADDRESSES[0],
    address_name: "Workshop",
    address1: "9 Loom Street",
    city: "Manchester",
    postal_code: "M1 2AB",
    is_default_billing: false,
    is_default_shipping: false,
    _links: { self: { href: `${ADDRESSES_HREF}/2` } },
  },
];

/**
 * `count` synthetic addresses. Billing and shipping defaults land on two
 * *different* entries (indices 0 and 1) to show the badges are independent,
 * not a single "the default address" flag. Mixes a region-list country
 * (`US`, alternating with `CA`) with one free-text-region country (`AF`, the
 * last entry) so both `AddressCard`/`AddressPage` region paths are
 * visible in the same story.
 */
function buildAddresses(count: number): typeof DEFAULT_ADDRESSES {
  return Array.from({ length: count }, (_, i) => {
    const isLast = i === count - 1;
    const isUS = i % 2 === 0;

    return {
      address_name: `Address ${i + 1}`,
      first_name: LONG_TIME_CUSTOMER.first_name,
      last_name: LONG_TIME_CUSTOMER.last_name,
      company: i % 4 === 0 ? "Acme Corp" : "",
      phone: i % 3 === 0 ? "+1 555 0100" : "",
      address1: `${100 + i} Main Street`,
      address2: i % 5 === 0 ? `Suite ${i}` : "",
      city: isLast ? "Kabul" : isUS ? "Springfield" : "Toronto",
      region: isLast ? "Kabul Province" : isUS ? "IL" : "ON",
      postal_code: isLast ? "1001" : isUS ? "62704" : "M5H 2N2",
      country: isLast ? "AF" : isUS ? "US" : "CA",
      is_default_billing: i === 0,
      is_default_shipping: i === 1,
      date_created: "2020-01-01T00:00:00-0800",
      date_modified: "2020-01-01T00:00:00-0800",
      _links: {
        self: { href: `${ADDRESSES_HREF}/${i}` },
      },
    };
  });
}

const LONG_TIME_ADDRESSES = buildAddresses(12);

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Slices `items` by the `offset`/`limit` query params the real SDK sends,
 * and reports the *unsliced* length as `total_items` — the same contract a
 * real store's paginated collection response has. Lets a story with more
 * than one page (`items.length > limit`) actually page through the data if
 * a person clicks Next/Prev in the live preview, rather than only looking
 * paginated on the first render.
 */
function paginate(items: unknown[], url: string, curie: string): Response {
  const params = new URL(url).searchParams;
  const limit = Number(params.get("limit") ?? items.length) || items.length;
  const offset = Number(params.get("offset") ?? 0) || 0;

  return json({
    total_items: items.length,
    _embedded: { [curie]: items.slice(offset, offset + limit) },
  });
}

type StoreFixtures = {
  customer?: typeof DEFAULT_CUSTOMER;
  /**
   * Answers sign-in with a session flagged `force_password_reset`, which is
   * what puts the portal on the password-reset screen. The screen is only
   * reachable through an actual sign-in -- a seeded session opens straight on
   * the account -- so a story that wants it has to go through the form.
   */
  forcePasswordReset?: boolean;
  activeSubscriptions?: SubscriptionFixture[];
  inactiveSubscriptions?: SubscriptionFixture[];
  orders?: OrderFixture[];
  addresses?: typeof DEFAULT_ADDRESSES;
  paymentMethod?: typeof DEFAULT_PAYMENT_METHOD;
};

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
 *
 * `fixtures` lets a story swap in its own customer/collections (see `Empty`
 * and `LongTimeUser`) without touching the six stories that rely on the
 * defaults — every field is optional and falls back independently.
 */
export function stubStore(fixtures: StoreFixtures = {}): () => void {
  const original = globalThis.fetch;
  const customer = fixtures.customer ?? DEFAULT_CUSTOMER;
  const activeSubscriptions =
    fixtures.activeSubscriptions ?? DEFAULT_ACTIVE_SUBSCRIPTIONS;
  const inactiveSubscriptions =
    fixtures.inactiveSubscriptions ?? DEFAULT_INACTIVE_SUBSCRIPTIONS;
  const orders = fixtures.orders ?? DEFAULT_ORDERS;
  const addresses = fixtures.addresses ?? DEFAULT_ADDRESSES;
  const paymentMethod = fixtures.paymentMethod ?? DEFAULT_PAYMENT_METHOD;

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
      // Sign-in. The SDK stores this response body as the session, so
      // `force_password_reset` here is what `usesTemporaryPassword` reads
      // back a moment later.
      if (new URL(url).pathname.endsWith("/authenticate")) {
        return json({
          session_token: "storybook",
          expires_in: 3600,
          force_password_reset: fixtures.forcePasswordReset ?? false,
        });
      }

      if (url.endsWith("customer_portal_settings")) return json(SETTINGS);

      // The store's country/region lists, filtered the way FX-367 specifies:
      // `address_type` narrows the countries, `country_code` picks a region
      // list. Without the filtering the stub would answer every call
      // identically and the address form's whole point would be invisible.
      if (new URL(url).pathname === new URL(COUNTRIES_HREF).pathname) {
        const addressType = new URL(url).searchParams.get("address_type");
        const values = Object.fromEntries(
          Object.entries(COUNTRY_VALUES).filter(
            ([code]) => addressType !== "shipping" || SHIPPING_ONLY.has(code),
          ),
        );

        return json({
          message: `These are the values available for the ${addressType ?? "store"} country field.`,
          values,
        });
      }

      if (new URL(url).pathname === new URL(REGIONS_HREF).pathname) {
        const code = new URL(url).searchParams.get("country_code") ?? "";
        return json({
          message: `These are the values available for the region field when ${code} is the country_code.`,
          values: REGION_VALUES[code] ?? {},
        });
      }
      if (url === STORE_BASE) return json(customer);

      // A single subscription, by id -- the URL `subscription._links.self`
      // points at, which is what the detail page PATCHes.
      //
      // This branch exists because the page now saves on change rather than
      // on a Save button. Without it the stub answered a PATCH exactly like
      // a GET and persisted nothing, so `cache.clear()` refetched the
      // untouched fixture and the customer's pick visibly snapped back --
      // a working feature looking broken in every story, and
      // indistinguishable from a silent failure.
      //
      // Mutating the fixture in place is deliberate: `paginate` reads these
      // same objects, so a later collection request reflects the change too,
      // the way a real API would.
      if (
        new URL(url).pathname.startsWith(
          `${new URL(SUBSCRIPTIONS_HREF).pathname}/`,
        ) &&
        !new URL(url).pathname.endsWith("/transactions")
      ) {
        const id = new URL(url).pathname.split("/").pop();
        const match = [...activeSubscriptions, ...inactiveSubscriptions].find(
          (candidate) => candidate._links.self.href.endsWith(`/${id}`),
        );

        if (!match) return json({});

        // The SDK sends a `Request` object rather than (url, init), so the
        // method and body live on `input`. Reading only `init` here silently
        // merged `{}` -- the PATCH "succeeded", persisted nothing, and the
        // customer's pick snapped back exactly as if the stub had no PATCH
        // branch at all.
        const method = (
          init?.method ??
          (input instanceof Request ? input.method : "GET")
        ).toUpperCase();

        if (method === "PATCH") {
          const rawBody =
            init?.body ??
            (input instanceof Request ? await input.clone().text() : "{}");

          Object.assign(
            match,
            JSON.parse(String(rawBody || "{}")) as Record<string, unknown>,
          );
        }

        return json(match);
      }

      // Matches the subscriptions collection request for whichever tab is
      // active. `is_active=true`/`is_active=false` are checked literally
      // against the URL, not decoded — confirmed against what the real SDK
      // sends for `filters: ["is_active=true"]`:
      // `?is_active=true&offset=0&limit=10&zoom=transaction_template%3Aitems
      // %3Aitem_options`.
      if (new URL(url).pathname === new URL(SUBSCRIPTIONS_HREF).pathname) {
        if (url.includes("is_active=true")) {
          return paginate(activeSubscriptions, url, "fx:subscriptions");
        }
        if (url.includes("is_active=false")) {
          return paginate(inactiveSubscriptions, url, "fx:subscriptions");
        }

        // No `is_active` filter at all -- `useSubscriptionById`'s fallback
        // (see use-subscription-by-id.ts) has no per-tab context, so it asks
        // for the unfiltered collection and scans it for a matching id. The
        // union of both fixtures, not either list alone, so a cold deep link
        // to an inactive subscription resolves here too, not just an active
        // one.
        return paginate(
          [...activeSubscriptions, ...inactiveSubscriptions],
          url,
          "fx:subscriptions",
        );
      }

      // A single subscription's own `fx:transactions` link -- nested under
      // the subscriptions pathname (`.../subscriptions/<id>/transactions`),
      // so it never collides with the exact-pathname match above or with the
      // customer-wide orders collection below (different pathname
      // entirely). `subscription-page.tsx` reads this rel for its Payment
      // history table.
      if (
        new URL(url).pathname.startsWith(
          `${new URL(SUBSCRIPTIONS_HREF).pathname}/`,
        ) &&
        new URL(url).pathname.endsWith("/transactions")
      ) {
        const segments = new URL(url).pathname.split("/");
        const id = segments[segments.length - 2];
        return paginate(subscriptionPaymentsFor(id), url, "fx:transactions");
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
        return paginate(orders, url, "fx:transactions");
      }

      // A single transaction, by id. `fx:last_transaction` on a subscription
      // points straight at one of these, so the subscription card's Last
      // payment cell resolves through here rather than through the
      // collection branch above (different pathname, no filters).
      if (
        new URL(url).pathname.startsWith(
          `${new URL(TRANSACTIONS_HREF).pathname}/`,
        )
      ) {
        const id = Number(new URL(url).pathname.split("/").pop());
        const match = orders.find((order) => order.id === id);
        return match ? json(match) : json({});
      }

      // The customer's one saved card. Unlike the collections above this is a
      // single resource, so it answers with the object itself, not a page.
      if (
        new URL(url).pathname === new URL(PAYMENT_METHOD_HREF).pathname
      ) {
        return json(paymentMethod);
      }

      // Matches the addresses collection request. Unlike the two branches
      // above, there is only one query shape here (no toggle, no filter), so
      // a pathname check alone is enough to discriminate it from the store's
      // other collections.
      if (new URL(url).pathname === new URL(ADDRESSES_HREF).pathname) {
        return paginate(addresses, url, "fx:customer_addresses");
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
  // `fullscreen`, not `centered`: the element sets no width of its own, so a
  // centered canvas would pad it in and hide exactly what these stories are
  // for -- how the portal behaves at the width its host gives it.
  parameters: { layout: "fullscreen" },
  // `stubStore` is exported so `element.stories.test.ts` can guard its
  // hCaptcha-script hole directly -- without this, Storybook's CSF indexer
  // treats every named export as a candidate story and errors trying to
  // render it as one. Add any future non-story export here too.
  excludeStories: ["stubStore"],
  beforeEach: (context) => {
    // Clear the session on the way in, not just on the way out. Storybook runs
    // a story's `beforeEach` teardown under the test runner, but not when you
    // navigate between stories in the interactive UI — so the session seeded by
    // `WithSalutation` survives into `SignedOut`, which then renders an account
    // screen instead of the sign-in form. Tests never saw it because each story
    // runs isolated there; only the preview lied.
    localStorage.removeItem(SESSION_KEY);
    // A story sets its own fixtures via `parameters.fixtures` (see `Empty`
    // and `LongTimeUser`); everything else gets the six-story defaults.
    return stubStore(
      (context.parameters as { fixtures?: StoreFixtures } | undefined)
        ?.fixtures,
    );
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

export const WithAddresses: StoryObj = {
  parameters: { fixtures: { addresses: MIXED_ADDRESSES } },
  beforeEach: () => withSession(),
  render: () =>
    html`<foxy-customer-portal store-domain="demo"></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(portalText(canvasElement)).toMatch(/12 Analytical Engine Way/),
    );

    const text = portalText(canvasElement);

    // The default address is summarised under both headings...
    expect(text).toMatch(/Billing address/);
    expect(text).toMatch(/Shipping address/);
    // ...and is left out of the list below, so its badges never render there.
    expect(text).not.toMatch(/Default billing/);
    expect(text).not.toMatch(/Default shipping/);
    // Exactly once on the page, rather than once per summary plus a card.
    expect(text.split("12 Analytical Engine Way").length - 1).toBe(2);

    // The addresses that are not defaults are what the list is for.
    expect(text).toMatch(/Saved addresses/);
    expect(text).toMatch(/47 Difference Engine Road/);
    expect(text).toMatch(/9 Loom Street/);
  },
};

/**
 * A brand-new customer: minimal profile (no tax ID), no subscriptions, no
 * orders, no addresses. Payment history hides entirely on zero items;
 * Subscriptions keeps its heading and Active/Inactive toggle even when empty
 * (an empty Active tab isn't an empty section — see `list.tsx`'s own note).
 * Billing & Shipping, unlike Payment history, always renders (heading +
 * payment-method column + billing/shipping summary) even with zero
 * addresses — only the address-card list itself is empty.
 */
export const Empty: StoryObj = {
  parameters: {
    fixtures: {
      customer: EMPTY_CUSTOMER,
      activeSubscriptions: [],
      inactiveSubscriptions: [],
      orders: [],
      addresses: [],
      paymentMethod: NO_PAYMENT_METHOD,
    },
  },
  beforeEach: () => withSession(),
  render: () =>
    html`<foxy-customer-portal store-domain="demo"></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(portalText(canvasElement)).toMatch(/Sam Taylor/),
    );

    const text = portalText(canvasElement);
    expect(text).toMatch(/sam\.taylor@example\.com/);
    expect(text).not.toMatch(/tax id/i);
    expect(text).toMatch(/Subscriptions/);
    expect(text).toMatch(/Active/);
    expect(text).not.toMatch(/Payment history/i);
    // Billing & Shipping, unlike Payment history, always renders -- confirm
    // the heading and the summary's empty-state text show up, while the
    // address-card list itself stays empty (no "Edit" button, which only
    // renders per address card / summary match).
    expect(text).toMatch(/Billing & Shipping/);
    expect(text).toMatch(/No billing address set\./);
    expect(text).toMatch(/No shipping address set\./);
    const editButtons = [
      ...canvasElement.querySelectorAll("button"),
    ].filter((button) => /^edit$/i.test(button.textContent ?? ""));
    expect(editButtons).toHaveLength(0);
  },
};

/**
 * A long-time customer: long name/email/tax ID, 15 active + 12 inactive
 * subscriptions, 25 orders, 12 addresses — every list has more than one page
 * (`limit: 10` everywhere), and the stub's `paginate` actually slices by
 * `offset`/`limit`, so Next/Prev page through real data in the live preview.
 */
export const LongTimeUser: StoryObj = {
  parameters: {
    fixtures: {
      customer: LONG_TIME_CUSTOMER,
      activeSubscriptions: LONG_TIME_ACTIVE_SUBSCRIPTIONS,
      inactiveSubscriptions: LONG_TIME_INACTIVE_SUBSCRIPTIONS,
      orders: LONG_TIME_ORDERS,
      addresses: LONG_TIME_ADDRESSES,
    },
  },
  beforeEach: () => withSession(),
  render: () =>
    html`<foxy-customer-portal store-domain="demo"></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(portalText(canvasElement)).toMatch(
        /Featherstonehaugh-Worthington/,
      ),
    );

    const text = portalText(canvasElement);
    // Three sections paginate on this screen, each rendered by the shared
    // Pagination component: active subscriptions (15 items / limit 10 -- 2
    // pages), orders (25 items / limit 10 -- 3 pages), and addresses (12
    // items / limit 10 -- 2 pages).
    //
    // The subscriptions and addresses blocks render an identical
    // "Previous12Next" string, so a single `toMatch` can't tell them apart
    // -- it would still pass if the addresses section's Pagination silently
    // stopped rendering, since the subscriptions match alone satisfies it.
    // Match every block and pin the exact sequence instead, so each section
    // is proven to have rendered its own -- verified against the real
    // rendered text, which gives exactly this array.
    const paginationBlocks = text.match(/Previous[\s\d]*Next/g) ?? [];
    expect(paginationBlocks).toEqual([
      "Previous12Next", // active subscriptions: 15 / 10 = 2 pages
      "Previous123Next", // orders: 25 / 10 = 3 pages
      "Previous12Next", // addresses: 12 / 10 = 2 pages
    ]);
  },
};

/**
 * The screen a customer meets when they sign in with a temporary password --
 * the one screen of the four signed-out ones that had no story, and so the
 * only one nobody could look at.
 *
 * Reached by actually signing in: `usesTemporaryPassword` reads
 * `force_password_reset` back off the stored session, and a session seeded
 * directly would open on the account screen instead.
 */
export const PasswordReset: StoryObj = {
  parameters: { fixtures: { forcePasswordReset: true } },
  render: () =>
    html`<foxy-customer-portal store-domain="demo"></foxy-customer-portal>`,
  play: async ({ canvasElement }) => {
    const shadowRoot = () =>
      canvasElement.querySelector("foxy-customer-portal")?.shadowRoot ?? null;

    await waitFor(() => expect(portalText(canvasElement)).toMatch(/sign in/i));

    const root = shadowRoot()!;
    const email = root.querySelector<HTMLInputElement>('input[type="email"]')!;
    const password = root.querySelector<HTMLInputElement>(
      'input[type="password"]',
    )!;

    // `.value = ...` alone does not reach React's onChange -- it tracks the
    // native setter and skips an assignment it did not see.
    const setValue = (input: HTMLInputElement, value: string) => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    setValue(email, "ada@example.com");
    setValue(password, "temporary");

    root.querySelector<HTMLFormElement>("form")!.requestSubmit();

    await waitFor(() =>
      expect(portalText(canvasElement)).toMatch(/choose a new password/i),
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
