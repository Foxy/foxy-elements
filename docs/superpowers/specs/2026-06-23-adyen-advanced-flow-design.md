# Adyen Advanced Flow Migration

**Date:** 2026-06-23  
**Scope:** foxy-sdk + foxy-elements  
**Status:** Approved — pending implementation

## Background

The Adyen integration currently uses Sessions Flow: the Foxy backend creates an Adyen session and returns `session_id` + `session_data`; the Drop-in handles the full payment lifecycle automatically including calling Adyen's backend directly.

Advanced Flow moves the Adyen `/payments` and `/payments/details` calls to Foxy's backend. The frontend collects encrypted payment data and routes it through Foxy rather than Adyen directly, giving Foxy full control over the payment processing lifecycle.

## End-to-End Flow

1. Foxy backend calls Adyen `/paymentMethods` → returns `payment_methods_response` in the `adyen_embedded` gateway config.
2. SDK initializes `AdyenCheckout` with `paymentMethodsResponse` (no `session`).
3. Drop-in mounts; user selects a payment method and submits.
4. Drop-in fires `onSubmit(state, component, actions)` with `state.data` (encrypted payment data).
5. Embed calls `checkoutClient.submitAdyenEmbeddedPayment(state.data)` → Foxy backend calls Adyen `/payments`.
6. Embed calls `actions.resolve(response)` with the Adyen payment response.
7. If an action is required (3DS, redirect): Drop-in handles it, then fires `onAdditionalDetails(state, component, actions)`.
8. Embed calls `checkoutClient.submitAdyenEmbeddedPaymentDetails(state.data)` → Foxy backend calls Adyen `/payments/details`.
9. Embed calls `actions.resolve(response)`.
10. Drop-in determines final result; fires `onPaymentCompleted` or `onPaymentFailed`.
11. Embed settles the `tokenize()` promise with the result.

## foxy-sdk Changes

### `PaymentGatewayConfig.ts`

Replace `session_id`/`session_data` with `payment_methods_response` on `AdyenEmbeddedGatewayConfig`:

```typescript
type AdyenEmbeddedGatewayConfig = {
  type: "adyen_embedded";
  payment_methods_response: AdyenEmbeddedPaymentMethodsResponse;
  environment: AdyenEmbeddedEnvironment;
  client_key: string;
};
```

### `AdyenEmbeddedSdkInstance.ts`

- `AdyenEmbeddedCheckoutConfiguration`: drop `session: AdyenEmbeddedCheckoutSession`, add `paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse`.
- `AdyenEmbeddedSdkInstance`: remove `submitDetails` (Sessions-only method). Keep `update` and `createFromAction`.
- `AdyenEmbeddedCheckoutSession` type can be removed entirely.

```typescript
export type AdyenEmbeddedCheckoutConfiguration = {
  paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse;
  environment: AdyenEmbeddedEnvironment;
  amount: AdyenEmbeddedAmount;
  countryCode: string;
  clientKey: string;
  locale?: string;
  [key: string]: unknown;
};
```

### `adyen.ts` (`initializeAdyenEmbeddedSdk`)

- `InitializeAdyenEmbeddedSdkParams`: drop `sessionId`/`sessionData`, add `paymentMethodsResponse`.
- `getAdyenCheckoutConfiguration`: build config with `paymentMethodsResponse` instead of `session`.
- `getAdyenCheckoutKey`: drop session segments from the cache key — use `environment`, `clientKey`, `currency`, `value`, `countryCode`, `locale`.

### `API.ts`

**Two new public methods** (not wrapped in `runMutation` — these are point-in-time calls, not state mutations):

```typescript
async submitAdyenEmbeddedPayment(
  data: Record<string, unknown>
): Promise<Record<string, unknown>>

async submitAdyenEmbeddedPaymentDetails(
  data: Record<string, unknown>
): Promise<Record<string, unknown>>
```

Both POST to `/helpers?action=<action>` with body `{ data }`. Use the same URL resolution and fetch infrastructure as other API methods. Return the raw response object for the embed to pass to `actions.resolve()`.

**Endpoint URLs:**
- Payment: `/helpers?action=submit_adyen_embedded_payment`
- Details: `/helpers?action=submit_adyen_embedded_payment_details`

**`CheckOutPaymentOption` for `adyen_embedded`:** payment is fully processed server-side before `tokenize()` resolves; no additional payload needed:

```typescript
| { gateway: "adyen_embedded" }
```

## foxy-elements Changes

### `types.ts`

```typescript
export type PaymentMethodSelectorAdyenEmbeddedConfig = {
  paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse;
  environment: string;
  clientKey: string;
};
```

### `embeds/adyen-embedded.tsx`

**`CheckoutClientLike` type** gains two optional method signatures:

```typescript
type CheckoutClientLike = {
  adyenEmbedded?: AdyenCheckoutLike | null;
  submitAdyenEmbeddedPayment?: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  submitAdyenEmbeddedPaymentDetails?: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
};
```

**Drop-in constructor changes:**

- Remove the `checkout.update({ showPayButton: false })` async preamble — this was a Sessions Flow workaround and is not needed in Advanced Flow.
- Add `onSubmit` and `onAdditionalDetails` callbacks:

```typescript
onSubmit: async (state, _component, actions) => {
  const actionsRecord = asRecord(actions);
  try {
    const data = (asRecord(state)?.data as Record<string, unknown>) ?? {};
    const client = checkoutClient as CheckoutClientLike;
    const response = await client.submitAdyenEmbeddedPayment?.(data) ?? {};
    (actionsRecord?.resolve as Function)?.(response);
  } catch (error) {
    (actionsRecord?.reject as Function)?.();
    const request = tokenizationRequestRef.current;
    tokenizationRequestRef.current = null;
    settleRequest(request, toError(error, submitErrorMessage));
  }
},
onAdditionalDetails: async (state, _component, actions) => {
  const actionsRecord = asRecord(actions);
  try {
    const data = (asRecord(state)?.data as Record<string, unknown>) ?? {};
    const client = checkoutClient as CheckoutClientLike;
    const response = await client.submitAdyenEmbeddedPaymentDetails?.(data) ?? {};
    (actionsRecord?.resolve as Function)?.(response);
  } catch (error) {
    (actionsRecord?.reject as Function)?.();
    const request = tokenizationRequestRef.current;
    tokenizationRequestRef.current = null;
    settleRequest(request, toError(error, submitErrorMessage));
  }
},
```

- `onPaymentCompleted`, `onPaymentFailed`, `onError`, `onSelect` remain unchanged.

**Effect dependency array:** remove `sessionData`-related deps; no new deps needed since `onSubmit`/`onAdditionalDetails` close over stable refs.

## Script + Example Changes

### `scripts/init-adyen-session.js` → `scripts/init-adyen-payment-methods.js`

- Call Adyen `/paymentMethods` instead of `/sessions`.
- Default URL: `https://checkout-test.adyen.com/v71/paymentMethods`
- Request body: same params as before (`merchantAccount`, `amount`, `countryCode`, `shopperLocale`, `blockedPaymentMethods`, `lineItems`, optional `shopperEmail`/`shopperReference`) minus `returnUrl`.
- Validation: check that `payload.paymentMethods` is an array.
- Per-profile env output changes:
  - Remove: `VITE_ADYEN_SESSION_ID_${PROFILE}`, `VITE_ADYEN_SESSION_DATA_${PROFILE}`
  - Add: `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_${PROFILE}` = `JSON.stringify(paymentMethodsResponse)`
- Summary log: show count of payment methods instead of session ID.
- Update `package.json`: `"init:adyen": "node ./scripts/init-adyen-payment-methods.js"`

### `examples/custom/adyen_embedded/*.html`

In the `payment_gateways` array, replace session fields:

```diff
- session_id: import.meta.env.VITE_ADYEN_SESSION_ID_US,
- session_data: import.meta.env.VITE_ADYEN_SESSION_DATA_US,
+ payment_methods_response: JSON.parse(import.meta.env.VITE_ADYEN_PAYMENT_METHODS_RESPONSE_US ?? "{}"),
```

`environment` and `client_key` bindings are unchanged.

## Error Handling

- `onSubmit` backend call fails: call `actions.reject()` (Drop-in shows an error state) and reject the `tokenize()` promise via `settleRequest`.
- `onAdditionalDetails` backend call fails: same pattern.
- Multiple error paths are safe: `tokenizationRequestRef.current` is cleared on first settle; subsequent `settleRequest` calls with a null ref are no-ops.
- `onError` from the Drop-in itself (e.g. component initialization failure): unchanged behavior — sets error state and rejects the tokenization promise.

## Out of Scope

- Backend implementation of `/helpers?action=submit_adyen_embedded_payment` and `/helpers?action=submit_adyen_embedded_payment_details` — handed off to the backend team.
- Updating existing tests (test fixtures will need `payment_methods_response` instead of `session_id`/`session_data` once implementation lands).
