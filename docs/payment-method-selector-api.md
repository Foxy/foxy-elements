# Payment Method Selector API Reference

This document describes the public API for `<foxy-payment-method-selector>`.

## Package exports

Primary entry points:

- `@foxy.io/elements/payment-method-selector-element`
- `@foxy.io/elements` (barrel export)

Main exports:

- `PaymentMethodSelectorElement`
- `paymentMethodSelectorEvents`

## Element registration

```ts
import "@foxy.io/elements/payment-method-selector-element";
```

The element is auto-registered when the module is imported.

## Tag name

```ts
const selector = document.createElement("foxy-payment-method-selector");
```

## Environment configuration

Hosted Card and ACH embed configuration comes from env vars, not `api.state.custom_config`:

- Required: `VITE_EMBED_ORIGIN`
- Embed path is fixed to `/v2.html`

## Public element class

```ts
class PaymentMethodSelectorElement extends HTMLElement {
  api:
    | (EventTarget & {
        state: unknown;
        updateBillingAddress?: (
          changes: Record<string, unknown>,
        ) => Promise<unknown> | void;
      })
    | null;
  optionIndex: number | undefined;
  tokenize(): Promise<Record<string, unknown>>;
}
```

## Observed attributes

The element observes:

- `lang`
- `option-index`

### `lang`

Type: string

Used as a locale hint (`HTMLElement.lang`) for integrations and option-level locale handling.

### `option-index`

Type: number

Sets internal selected option state by array index.

## Properties

### `api`

Type: `EventTarget & { state: unknown; updateBillingAddress?: (...) => Promise<unknown> | void } | null`

The component subscribes to `afterStateChange` and re-renders on each event.

### `optionIndex`

Type: `number | undefined`

Primary selection control property.

### `tokenize()`

```ts
tokenize(): Promise<Record<string, unknown>>
```

Behavior:

1. Resolves selected option.
2. Runs option-specific controller tokenization when available.
3. Builds payload:

```ts
{
  optionIndex: number;
  optionType: string | undefined;
  billingAddress: {
    useShippingAddress: boolean;
    values: Record<string, string>;
  } | undefined;
  // plus method-specific fields
}
```

4. Dispatches `tokenizationsuccess` with `{ payload }`.
5. Returns payload.

The element manages loading internally while `tokenize()` is in progress.

Throws `Error("No payment method is selected.")` if no selected option can be resolved.

## Events

Event detail types are internal. `PaymentMethodSelectorElement` exposes typed `addEventListener` and `removeEventListener` overloads so TypeScript infers each event's detail automatically — no imports required.

### `optionindexchange`

Constant: `paymentMethodSelectorEvents.optionIndexChange`

Detail: `{ optionIndex: number }`

Dispatch: `bubbles: true`, `composed: true`

Triggered when the user changes the selected option.

### `tokenizationstart`

Constant: `paymentMethodSelectorEvents.tokenizationStart`

Detail: `{ optionIndex: number }`

Dispatch: `bubbles: true`, `composed: true`, `cancelable: true`

Triggered before tokenization begins. Call `event.preventDefault()` to cancel.

### `tokenizationsuccess`

Constant: `paymentMethodSelectorEvents.tokenizationSuccess`

Detail: `{ payload: Record<string, unknown> }`

Dispatch: `bubbles: true`, `composed: true`

Triggered by `tokenize()`.

### `tokenizationerror`

Constant: `paymentMethodSelectorEvents.tokenizationError`

Detail: `{ error: unknown }`

Dispatch: `bubbles: true`, `composed: true`

Triggered when tokenization fails.

## Minimal event listener example

No imports needed — TypeScript infers all event detail types from the element's overloads:

```ts
selector.addEventListener("optionindexchange", (e) => {
  console.log(e.detail.optionIndex);
});

selector.addEventListener("tokenizationstart", (e) => {
  if (/* cancel condition */ false) e.preventDefault();
});

selector.addEventListener("tokenizationsuccess", (e) => {
  console.log(e.detail.payload);
});

selector.addEventListener("tokenizationerror", (e) => {
  console.error(e.detail.error);
});
```
