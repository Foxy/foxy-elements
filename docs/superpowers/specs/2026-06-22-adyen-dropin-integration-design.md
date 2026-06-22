# Adyen Drop-in Integration Design

**Date:** 2026-06-22
**Status:** Approved

## Problem

`foxy-payment-method-selector` currently expands each Adyen payment method into its own top-level option entry (card, SEPA, iDEAL, Bancontact, etc.) using a ~70-entry `ADYEN_PAYMENT_METHOD_TYPE_MAP`. Each entry gets its own `AdyenEmbeddedOption` mounting a specific Adyen Web SDK component (`Card`, `SepaDirectDebit`, `Redirect`, etc.).

This approach is fragile — new Adyen payment method types require manual map entries — and produces a sprawling option list that duplicates what Adyen's Drop-in already does natively.

## Goal

Replace the per-method fan-out with a single top-level "Adyen" entry that renders Adyen's Drop-in component. The Drop-in owns payment method selection and form rendering internally. The selector's submit flow calls `dropin.submit()` unchanged.

## Decisions

- **Single entry per gateway:** `#createAdyenEmbeddedGatewayEntries()` returns exactly 1 entry with `type: "adyen-embedded"`.
- **Tokenization payload:** Drop `paymentMethodType` and `paymentMethod`. Payload becomes `{ adyenEmbedded: { result } }`. The Adyen Sessions result contains full payment details; the backend reads method info from there.
- **Stored payment methods:** The Drop-in shows stored methods from the session automatically (`showStoredPaymentMethods` not overridden — Adyen default is `true`).
- **Breaking changes acceptable:** `PaymentMethodSelectorAdyenEmbeddedConfig` and `PaymentMethodSelectorAdyenEmbeddedTokenizePayload` both shrink.

## Architecture

### Layer 1 — Entry creation (`element.tsx`)

`#createAdyenEmbeddedGatewayEntries(config)` is simplified to:

```ts
return [{
  type: "adyen-embedded",
  gateway: "adyen_embedded",
  session_data: sessionData,
  environment,
  client_key: clientKey,
}];
```

**Deleted:**
- `ADYEN_PAYMENT_METHOD_TYPE_MAP` (~70 entries)
- `ADYEN_BUTTON_ONLY_OPTION_TYPES`
- `#getAdyenPaymentMethodMapping()`
- `#toAdyenPaymentMethodKey()`
- `AdyenEmbeddedPaymentMethodLike` type
- `AdyenEmbeddedSdkLike` type (no longer reading `paymentMethodsResponse` in this method)

`#isAdyenOption()` becomes:
```ts
return Boolean(option?.adyenEmbedded);
```

### Layer 2 — Config and option shape (`types.ts`, `element.tsx`)

`PaymentMethodSelectorAdyenEmbeddedConfig` becomes:
```ts
export type PaymentMethodSelectorAdyenEmbeddedConfig = {
  sessionData: string;
  environment: string;
  clientKey: string;
};
```

`PaymentMethodSelectorAdyenEmbeddedPaymentMethod` is removed.

`PaymentMethodSelectorAdyenEmbeddedTokenizePayload` becomes:
```ts
export type PaymentMethodSelectorAdyenEmbeddedTokenizePayload = {
  adyenEmbedded: {
    result: Record<string, unknown>;
  };
};
```

`#createAdyenEmbeddedConfig()` in `element.tsx` drops the `paymentMethodType`, `paymentMethod`, and `componentName` field requirements — validates only `sessionData`, `environment`, `clientKey`.

The option built in `#createOption()` drops `acceptedBrands` (was derived from `paymentMethod.brands`) and uses the gateway name `"Adyen"` as the label.

### Layer 3 — Drop-in component (`embeds/adyen-embedded.tsx`)

The `AdyenEmbeddedOption` component always constructs a `Dropin` instance:

```ts
const Component = getAdyenComponentConstructor(checkout, "Dropin");
const component = new Component(checkout, {
  showPayButton: false,
  onPaymentCompleted: ...,
  onPaymentFailed: ...,
  onError: ...,
});
component.mount(container);
```

**Removed from props:** `paymentMethodType`, `paymentMethod`, `componentName` (were part of `adyenEmbedded` config).

**Removed from component setup:** `styles` (input styles object), `type`/`paymentMethodType`/`paymentMethod` constructor args — these were per-method. The Drop-in manages form rendering itself and picks up styling from the existing `--adyen-sdk-*` CSS variables on `.foxy-adyen-embedded`.

**`isAvailable()` handling:** The Drop-in does not expose `isAvailable()`. The `readyPromise` resolves immediately to `ready` after mount — the Drop-in handles per-method availability internally (e.g. hides Apple Pay if unsupported).

**Tokenization payload change:**
```ts
// Before
return { adyenEmbedded: { paymentMethodType, paymentMethod, result } };

// After
return { adyenEmbedded: { result } };
```

## Data Flow

```
SDK session
  → #createAdyenEmbeddedGatewayEntries() → 1 entry { type: "adyen-embedded" }
  → selector renders 1 "Adyen" row
  → user selects row
  → AdyenEmbeddedOption mounts Dropin instance
  → Drop-in renders its own method list + form
  → user picks method, fills details
  → selector calls tokenize()
  → tokenize() calls dropin.submit()
  → onPaymentCompleted fires with Adyen Sessions result
  → resolves { adyenEmbedded: { result } }
```

## Error Handling

No behavioral change. `AdyenStatus` state machine (`loading → ready / unavailable / error`) is unchanged. `onPaymentCompleted`, `onPaymentFailed`, and `onError` map to the same `settleRequest`/`setError` paths.

## CSS

The pay button is hidden via `showPayButton: false` in the constructor config — it is never rendered, so no CSS rule is needed to hide it. The existing `.adyen-checkout__button--pay` CSS rules (which style the button when present) can be removed or left as dead code; they have no effect.

The Drop-in's method list inherits all `--adyen-sdk-*` CSS variable mappings already set on `.foxy-adyen-embedded`. No new rules are required.

The `stylesReady` probe (used by per-method components to compute hosted-field input styles before mounting) is removed. The Drop-in uses the `--adyen-sdk-*` CSS variables for all form styling natively; the computed-style probe is not needed.

## Testing

- Update `element.test.ts` assertions: given any `paymentMethodsResponse`, expect exactly 1 option with `type: "adyen-embedded"` and `gateway: "adyen_embedded"`.
- Update `adyen-embedded.tsx` component tests: remove `paymentMethodType`/`paymentMethod` from props setup; assert `Dropin` constructor is used.
- Remove test cases covering `ADYEN_BUTTON_ONLY_OPTION_TYPES` behavior.
- Example pages under `examples/custom/adyen_embedded/` cover end-to-end integration.

## Files Changed

| File | Change |
|------|--------|
| `src/elements/foxy-payment-method-selector/element.tsx` | Simplify `#createAdyenEmbeddedGatewayEntries`, `#createAdyenEmbeddedConfig`, `#isAdyenOption`; delete map/helpers/imports |
| `src/elements/foxy-payment-method-selector/types.ts` | Shrink `PaymentMethodSelectorAdyenEmbeddedConfig` and `PaymentMethodSelectorAdyenEmbeddedTokenizePayload`; remove `PaymentMethodSelectorAdyenEmbeddedPaymentMethod` |
| `src/elements/foxy-payment-method-selector/constants.ts` | Remove `ADYEN_BUTTON_ONLY_OPTION_TYPES` |
| `src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx` | Always construct `Dropin`; remove per-method props/config |
| `src/elements/foxy-payment-method-selector/element.test.ts` | Update entry-count and payload assertions |
