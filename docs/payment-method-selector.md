# Payment Method Selector

The Payment Method Selector is a web component that renders checkout payment options (cards, saved cards, ACH, Stripe elements, Apple Pay, Google Pay, redirect providers), tracks selection, collects billing address details, and exposes a single `tokenize()` API for submit flows.

Tag name: `foxy-payment-method-selector`

## Installation

```bash
npm install @foxy.io/elements
```

## Import and register

```ts
import "@foxy.io/elements/payment-method-selector-element";
```

Registration is automatic when the module is imported.

If you import from the package root, you can also use:

```ts
import "@foxy.io/elements";
```

## Quick start

```ts
import { type PaymentMethodSelectorElement } from "@foxy.io/elements/payment-method-selector-element";

// Required at build/runtime for secure hosted fields origins:
// VITE_EMBED_ORIGIN

class CheckoutApi extends EventTarget {
  state = {
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
      { country_options: ["US", "CA"], region_options: ["MN", "WI"] },
    ],
    template_set: { id: 123 },
    totals: [{ total_order: 22.04 }],
    format: { currency_code: "USD", maximum_fraction_digits: 2 },
    store: { supported_payment_cards: ["visa", "mastercard", "amex"] },
    payment_options: [{ type: "new-card", gateway: "authorize" }],
  };

  updateBillingAddress(changes: Record<string, unknown>) {
    const current = this.state as Record<string, unknown>;
    const billing = (current.billing_address ?? {}) as Record<string, unknown>;

    this.state = {
      ...current,
      billing_address: {
        ...billing,
        ...changes,
      },
    };

    this.dispatchEvent(new CustomEvent("afterStateChange"));
  }
}

const api = new CheckoutApi();
const selector = document.createElement(
  "foxy-payment-method-selector",
) as PaymentMethodSelectorElement;

selector.api = api;
selector.lang = "en";
selector.optionIndex = 0;

selector.addEventListener("optionindexchange", (event) => {
  const detail = (event as CustomEvent<{ optionIndex: number }>).detail;
  console.log("Selected option", detail.optionIndex);
});

selector.addEventListener("tokenizationstart", (event) => {
  if (/* optional cancel condition */ false) {
    event.preventDefault();
  }
});

selector.addEventListener("tokenizationsuccess", (event) => {
  const detail = (event as CustomEvent<{ payload: Record<string, unknown> }>)
    .detail;
  console.log("Tokenized payload", detail.payload);
});

selector.addEventListener("tokenizationerror", (event) => {
  const detail = (event as CustomEvent<{ error: unknown }>).detail;
  console.error("Tokenization error", detail.error);
});

document.querySelector("#payment-mount")?.append(selector);
```

## Submit flow

Call `tokenize()` when your checkout submit button is clicked:

```ts
try {
  const payload = await selector.tokenize();

  // Send this payload to your checkout submit endpoint.
  // Example fields vary by selected method:
  // payload.optionIndex
  // payload.optionType
  // payload.billingAddress
  // payload.token (Card Embed / ACH)
  // payload.paymentMethodId (Stripe Card / Stripe Payment Element)
} catch (err) {
  console.error("Payment tokenization failed", err);
}
```

While `tokenize()` is running, the element switches to an internal loading state and restores automatically when tokenization settles.

## Billing address behavior

- If `api.updateBillingAddress` is provided, the element calls it when billing data changes.

## Styling and theming

The component uses Shadow DOM and syncs theme CSS variables from `document.documentElement` onto the host element.

## Attributes vs properties

Use JS properties for normal integration. Attributes are useful when integrating declaratively.

- `lang` attribute: locale string (for example `en`, `en-US`)
- `option-index` attribute: selected option index

Example:

```html
<foxy-payment-method-selector
  lang="en"
  option-index="0"
></foxy-payment-method-selector>
```

## Caveats and integration notes

- Card and ACH hosted field embed config is read from env vars, not `api.state.custom_config`:
  `VITE_EMBED_ORIGIN` (embed path is fixed to `/v2.html`).
- `tokenize()` throws when no option is selected.

## Next reading

- Full API reference: [payment-method-selector-api.md](./payment-method-selector-api.md)
