# Adyen Advanced Flow Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Adyen Sessions Flow integration with Advanced Flow, moving Adyen `/payments` and `/payments/details` calls to Foxy's backend and removing the automatic session-based lifecycle.

**Architecture:** The SDK no longer creates an Adyen session; instead it initialises `AdyenCheckout` with a `paymentMethodsResponse` provided by the Foxy backend. Two new `API` class methods post payment data to Foxy's `/helpers` endpoint, which proxies to Adyen. The embed component wires these into the Drop-in's `onSubmit`/`onAdditionalDetails` callbacks.

**Tech Stack:** TypeScript, Vitest (jsdom for foxy-sdk, Playwright/Chromium for foxy-elements), Adyen Web SDK v6, React.

## Global Constraints

- Both repos live side-by-side: `/Users/pheekus/FoxyCommerce/foxy-sdk` and `/Users/pheekus/FoxyCommerce/foxy-elements`.
- Breaking changes to foxy-sdk types are acceptable — project is in development.
- Never add `session_id`, `session_data`, or `session_result` to any new code path.
- Do not wrap the two new API methods in `runMutation` — they are point-in-time calls, not checkout state mutations.
- New Foxy backend endpoints (placeholder): `POST /helpers?action=submit_adyen_embedded_payment` and `POST /helpers?action=submit_adyen_embedded_payment_details` — these do not exist yet; the SDK methods should compile and type-check but will fail at runtime until the backend team implements them.

---

### Task 1: Update foxy-sdk types

**Files:**
- Modify: `foxy-sdk/src/checkout/types/AdyenEmbeddedSdkInstance.ts`
- Modify: `foxy-sdk/src/checkout/types/PaymentGatewayConfig.ts`

**Interfaces:**
- Produces: `AdyenEmbeddedCheckoutConfiguration` with `paymentMethodsResponse` field (consumed by Task 2)
- Produces: `AdyenEmbeddedGatewayConfig` with `payment_methods_response` field (consumed by Tasks 2, 3)

- [ ] **Step 1: Update `AdyenEmbeddedSdkInstance.ts`**

Replace the entire file content:

```typescript
/** Supported Adyen Web environments for Advanced Flow. */
export type AdyenEmbeddedEnvironment =
  | "test"
  | "live"
  | "live-us"
  | "live-au"
  | "live-apse"
  | "live-in"
  | "live-nea";

/** Monetary amount accepted by Adyen Checkout. */
export type AdyenEmbeddedAmount = {
  /** Amount in minor units (for example cents). */
  value: number;
  /** ISO 4217 currency code. */
  currency: string;
};

/** Raw payment method entry returned by Adyen. */
export type AdyenEmbeddedPaymentMethod = {
  /** Adyen payment method identifier, for example "scheme" or "ideal". */
  type: string;
  /** Buyer-facing payment method name when Adyen provides one. */
  name?: string;
  /** Optional list of supported brands for card-like methods. */
  brands?: string[];
  /** Additional provider-specific properties exposed by Adyen. */
  [key: string]: unknown;
};

/** Payment methods payload returned by Adyen's /paymentMethods endpoint. */
export type AdyenEmbeddedPaymentMethodsResponse = {
  /** Regular payment methods available for this merchant/country/currency. */
  paymentMethods?: AdyenEmbeddedPaymentMethod[];
  /** Stored shopper payment methods, when present. */
  storedPaymentMethods?: AdyenEmbeddedPaymentMethod[];
  /** Additional provider-specific response properties. */
  [key: string]: unknown;
};

/** Minimal configuration used to initialise Adyen Checkout in Advanced Flow. */
export type AdyenEmbeddedCheckoutConfiguration = {
  /** Payment methods response from Adyen's /paymentMethods endpoint. */
  paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse;
  /** Adyen environment matching the client-side asset region. */
  environment: AdyenEmbeddedEnvironment;
  /** Amount displayed by Adyen's payment components. */
  amount: AdyenEmbeddedAmount;
  /** Shopper country code used to filter payment methods. */
  countryCode: string;
  /** Client-side authentication key required by Adyen. */
  clientKey: string;
  /** Shopper locale used for UI translations. */
  locale?: string;
  /** Additional configuration properties supported by Adyen. */
  [key: string]: unknown;
};

/** Initialised Adyen Checkout instance. */
export type AdyenEmbeddedSdkInstance = {
  /** Discovered payment methods available for the current configuration. */
  paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse;
  /** Updates the checkout instance with new global properties. */
  update(
    props?: Record<string, unknown>,
    options?: { shouldReinitializeCheckout?: boolean },
  ): Promise<AdyenEmbeddedSdkInstance>;
  /** Creates an action component from an Adyen action payload when supported. */
  createFromAction?(
    action: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): unknown;
  /** Additional Adyen instance properties and methods. */
  [key: string]: unknown;
};

/** Browser namespace exposed by the Adyen Web script. */
export type AdyenEmbeddedSdkNamespace = {
  /** Async factory used to create an Adyen Checkout instance. */
  AdyenCheckout(
    configuration: AdyenEmbeddedCheckoutConfiguration,
  ): Promise<AdyenEmbeddedSdkInstance>;
};
```

- [ ] **Step 2: Update `PaymentGatewayConfig.ts` — replace `AdyenEmbeddedGatewayConfig`**

Find the `AdyenEmbeddedGatewayConfig` type (currently lines 121–132) and replace it:

```typescript
type AdyenEmbeddedGatewayConfig = {
  /** Gateway identifier. */
  type: "adyen_embedded";
  /** Payment methods response from Adyen's /paymentMethods endpoint. */
  payment_methods_response: AdyenEmbeddedPaymentMethodsResponse;
  /** Adyen environment matching the session region. */
  environment: AdyenEmbeddedEnvironment;
  /** Adyen client-side authentication key. */
  client_key: string;
};
```

Add the missing import at the top of `PaymentGatewayConfig.ts` if `AdyenEmbeddedPaymentMethodsResponse` is not already imported:

```typescript
import type {
  AdyenEmbeddedEnvironment,
  AdyenEmbeddedPaymentMethodsResponse,
} from "./AdyenEmbeddedSdkInstance";
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
npx tsc --noEmit
```

Expected: no errors from the two changed files. (Errors in other files that reference the old types are expected — they'll be fixed in later tasks.)

- [ ] **Step 4: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
git add src/checkout/types/AdyenEmbeddedSdkInstance.ts src/checkout/types/PaymentGatewayConfig.ts
git commit -m "feat(adyen): replace Sessions types with Advanced Flow types"
```

---

### Task 2: Update foxy-sdk initialisation (`adyen.ts`) and its tests

**Files:**
- Modify: `foxy-sdk/src/checkout/utils/adyen.ts`
- Modify: `foxy-sdk/src/tests/checkout/adyen-embedded-payment-options.test.ts`
- Modify: `foxy-sdk/src/tests/checkout/parallel-sdk-loading.test.ts`

**Interfaces:**
- Consumes: `AdyenEmbeddedCheckoutConfiguration.paymentMethodsResponse` from Task 1
- Produces: `initializeAdyenEmbeddedSdk({ paymentMethodsResponse, environment, clientKey, amount, locale, countryCode })` (consumed by Task 3 — `API.ts`)

- [ ] **Step 1: Update the test fixture and assertions in `adyen-embedded-payment-options.test.ts`**

Replace the `adyenGatewayConfig` constant (currently lines 23–29):

```typescript
const adyenGatewayConfig = {
  type: "adyen_embedded",
  payment_methods_response: {
    paymentMethods: [
      { type: "scheme", name: "Cards" },
      { type: "eps", name: "EPS" },
    ],
  },
  environment: "test",
  client_key: "test_870be2_client_key",
} as const;
```

Remove `submitDetails` from `createAdyenCheckoutInstance` (currently lines 206–226). The updated function:

```typescript
function createAdyenCheckoutInstance(
  paymentMethods: AdyenEmbeddedPaymentMethod[] = [
    { type: "scheme", name: "Cards" },
    { type: "eps", name: "EPS" },
  ],
): AdyenEmbeddedSdkInstance {
  let checkout!: AdyenEmbeddedSdkInstance;
  const update = vi.fn(async () => checkout);

  checkout = {
    paymentMethodsResponse: {
      paymentMethods,
      storedPaymentMethods: [],
    },
    createFromAction: vi.fn(),
    update,
  } as AdyenEmbeddedSdkInstance;

  return checkout;
}
```

Update the `AdyenCheckout` configuration assertion (currently lines 374–384):

```typescript
expect(getLastConfiguration()).toEqual({
  paymentMethodsResponse: adyenGatewayConfig.payment_methods_response,
  environment: adyenGatewayConfig.environment,
  amount: { value: 1234, currency: "USD" },
  countryCode: "US",
  clientKey: adyenGatewayConfig.client_key,
  locale: "en-US",
});
```

- [ ] **Step 2: Run the tests — they should fail**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
npx vitest run src/tests/checkout/adyen-embedded-payment-options.test.ts
```

Expected: failures because `adyen.ts` still references `sessionId`/`sessionData`.

- [ ] **Step 3: Update `adyen.ts`**

Replace the `InitializeAdyenEmbeddedSdkParams` type, `getAdyenCheckoutConfiguration`, `getAdyenCheckoutKey`, and `initializeAdyenEmbeddedSdk` in full. The rest of the file (script loading helpers) is unchanged.

```typescript
type InitializeAdyenEmbeddedSdkParams = {
  paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse;
  environment: AdyenEmbeddedEnvironment;
  clientKey: string;
  amount?: AdyenEmbeddedAmount;
  locale?: string;
  countryCode?: string;
};
```

Replace `getAdyenCheckoutConfiguration`:

```typescript
function getAdyenCheckoutConfiguration(
  params: InitializeAdyenEmbeddedSdkParams,
): AdyenEmbeddedCheckoutConfiguration {
  const clientKey = getTrimmedString(params.clientKey);
  const locale = getNormalizedLocale(params.locale);
  const countryCode = getNormalizedCountryCode(params.countryCode);
  const currency = getNormalizedCurrencyCode(params.amount?.currency);
  const amountValue = params.amount?.value;

  if (!clientKey) {
    throw new Error("Adyen client key is required.");
  }

  if (!countryCode) {
    throw new Error("Adyen country code is required.");
  }

  if (
    amountValue === undefined ||
    !Number.isSafeInteger(amountValue) ||
    amountValue < 0 ||
    !currency
  ) {
    throw new Error("Adyen amount is required.");
  }

  const configuration: AdyenEmbeddedCheckoutConfiguration = {
    paymentMethodsResponse: params.paymentMethodsResponse,
    environment: params.environment,
    amount: { value: amountValue, currency },
    countryCode,
    clientKey,
  };

  if (locale) {
    configuration.locale = locale;
  }

  return configuration;
}
```

Replace `getAdyenCheckoutKey`:

```typescript
function getAdyenCheckoutKey(
  configuration: AdyenEmbeddedCheckoutConfiguration,
): string {
  return [
    configuration.environment,
    configuration.clientKey,
    configuration.amount.currency,
    String(configuration.amount.value),
    configuration.countryCode,
    configuration.locale ?? "",
  ].join(":");
}
```

Replace `initializeAdyenEmbeddedSdk` export signature (implementation is unchanged):

```typescript
export async function initializeAdyenEmbeddedSdk(
  params: InitializeAdyenEmbeddedSdkParams,
): Promise<AdyenEmbeddedSdkInstance> {
  const configuration = getAdyenCheckoutConfiguration(params);
  return await createAdyenCheckout(configuration);
}
```

Also update the import at the top of `adyen.ts` — remove `AdyenEmbeddedCheckoutSession` and add `AdyenEmbeddedPaymentMethodsResponse`:

```typescript
import type {
  AdyenEmbeddedAmount,
  AdyenEmbeddedCheckoutConfiguration,
  AdyenEmbeddedEnvironment,
  AdyenEmbeddedPaymentMethodsResponse,
  AdyenEmbeddedSdkInstance,
  AdyenEmbeddedSdkNamespace,
} from "../types/AdyenEmbeddedSdkInstance";
```

- [ ] **Step 4: Run tests — they should pass**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
npx vitest run src/tests/checkout/adyen-embedded-payment-options.test.ts
```

Expected: all tests in that file pass.

- [ ] **Step 5: Fix `parallel-sdk-loading.test.ts`**

Update the `adyenGatewayConfig` fixture in that file (currently lines 172–178):

```typescript
const adyenGatewayConfig = {
  type: "adyen_embedded",
  payment_methods_response: {
    paymentMethods: [{ type: "scheme", name: "Cards" }],
  },
  environment: "test",
  client_key: "test_adyen_client_key",
};
```

Remove `submitDetails` from the mock SDK object (currently lines 30 and 104–105). Find `state.adyenSdk.submitDetails.mockClear()` and delete that line. Find the initial `adyenSdk` object definition and remove the `submitDetails` property.

- [ ] **Step 6: Run the parallel test**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
npx vitest run src/tests/checkout/parallel-sdk-loading.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Run the full foxy-sdk test suite**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
npm run test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
git add src/checkout/utils/adyen.ts src/tests/checkout/adyen-embedded-payment-options.test.ts src/tests/checkout/parallel-sdk-loading.test.ts
git commit -m "feat(adyen): initialize checkout with paymentMethodsResponse instead of session"
```

---

### Task 3: Add `submitAdyenEmbeddedPayment` and `submitAdyenEmbeddedPaymentDetails` to the API class

**Files:**
- Modify: `foxy-sdk/src/checkout/API.ts`
- Modify: `foxy-sdk/src/tests/checkout/adyen-embedded-payment-options.test.ts`

**Interfaces:**
- Consumes: `resolveUrl`, `assertStoreDomain`, `createRequestError` (private methods already on `API`)
- Produces:
  - `api.submitAdyenEmbeddedPayment(data: Record<string, unknown>): Promise<Record<string, unknown>>`
  - `api.submitAdyenEmbeddedPaymentDetails(data: Record<string, unknown>): Promise<Record<string, unknown>>`

- [ ] **Step 1: Write failing tests**

Append these two `describe` blocks to the test file `adyen-embedded-payment-options.test.ts`, after the closing `});` of the existing `describe("Adyen Embedded payment option loading", ...)` block:

```typescript
describe("submitAdyenEmbeddedPayment", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRuntime();
  });

  it("posts payment data as JSON to /helpers?action=submit_adyen_embedded_payment", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API({ storeDomain: "store.test" });

    const paymentData = { paymentMethod: { type: "scheme", encryptedCardNumber: "abc" } };
    const mockResponse = { resultCode: "Authorised", pspReference: "PSP123" };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await api.submitAdyenEmbeddedPayment(paymentData);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://store.test/helpers?action=submit_adyen_embedded_payment");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ data: paymentData });
    expect(result).toEqual(mockResponse);
  });

  it("throws when the response is not ok", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API({ storeDomain: "store.test" });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("{}", { status: 422 }),
    );

    await expect(
      api.submitAdyenEmbeddedPayment({ paymentMethod: { type: "scheme" } }),
    ).rejects.toThrow("HTTP status 422");
  });

  it("throws when storeDomain is not set", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API();

    await expect(
      api.submitAdyenEmbeddedPayment({ paymentMethod: { type: "scheme" } }),
    ).rejects.toThrow();
  });
});

describe("submitAdyenEmbeddedPaymentDetails", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRuntime();
  });

  it("posts details as JSON to /helpers?action=submit_adyen_embedded_payment_details", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API({ storeDomain: "store.test" });

    const detailsData = { details: { redirectResult: "eyJ..." }, paymentData: "Ab02b4c..." };
    const mockResponse = { resultCode: "Authorised", pspReference: "PSP456" };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await api.submitAdyenEmbeddedPaymentDetails(detailsData);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://store.test/helpers?action=submit_adyen_embedded_payment_details");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ data: detailsData });
    expect(result).toEqual(mockResponse);
  });

  it("throws when the response is not ok", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API({ storeDomain: "store.test" });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("{}", { status: 500 }),
    );

    await expect(
      api.submitAdyenEmbeddedPaymentDetails({ details: {} }),
    ).rejects.toThrow("HTTP status 500");
  });
});
```

- [ ] **Step 2: Run tests — they should fail**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
npx vitest run src/tests/checkout/adyen-embedded-payment-options.test.ts
```

Expected: the two new describe blocks fail with "api.submitAdyenEmbeddedPayment is not a function".

- [ ] **Step 3: Add the two methods to `API.ts`**

In `API.ts`, update `CheckOutPaymentOption` — find the `adyen_embedded` branch (currently `{ gateway: "adyen_embedded"; session_result: string }`) and replace it:

```typescript
| { gateway: "adyen_embedded" }
```

Then add the two new public methods to the `API` class. Place them just before the `getAddressSuggestions` method (around line 1258):

```typescript
async submitAdyenEmbeddedPayment(
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  this.assertStoreDomain();

  const response = await fetch(
    this.resolveUrl("/helpers", {
      action: "submit_adyen_embedded_payment",
    }),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    },
  );

  if (!response.ok) {
    throw this.createRequestError(
      response.status,
      "Adyen payment submission failed.",
    );
  }

  return (await response.json()) as Record<string, unknown>;
}

async submitAdyenEmbeddedPaymentDetails(
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  this.assertStoreDomain();

  const response = await fetch(
    this.resolveUrl("/helpers", {
      action: "submit_adyen_embedded_payment_details",
    }),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    },
  );

  if (!response.ok) {
    throw this.createRequestError(
      response.status,
      "Adyen payment details submission failed.",
    );
  }

  return (await response.json()) as Record<string, unknown>;
}
```

Also update `API.ts` to pass `paymentMethodsResponse` (from the gateway config) to `initializeAdyenEmbeddedSdk`. Find the existing call to `initializeAdyenEmbeddedSdk` (around line 287–294) and replace:

```typescript
initializeAdyenEmbeddedSdk({
  sessionId: adyenEmbeddedConfig.session_id,
  sessionData: adyenEmbeddedConfig.session_data,
  environment: adyenEmbeddedConfig.environment,
  clientKey: adyenEmbeddedConfig.client_key,
  amount: getAdyenCheckoutAmount(nextJson),
  locale: nextJson.format.locale_code,
  countryCode: nextJson.billing_address.country,
})
```

with:

```typescript
initializeAdyenEmbeddedSdk({
  paymentMethodsResponse: adyenEmbeddedConfig.payment_methods_response,
  environment: adyenEmbeddedConfig.environment,
  clientKey: adyenEmbeddedConfig.client_key,
  amount: getAdyenCheckoutAmount(nextJson),
  locale: nextJson.format.locale_code,
  countryCode: nextJson.billing_address.country,
})
```

- [ ] **Step 4: Run tests — they should pass**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
npx vitest run src/tests/checkout/adyen-embedded-payment-options.test.ts
```

Expected: all tests in the file pass.

- [ ] **Step 5: Run the full foxy-sdk test suite**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
npm run test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk
git add src/checkout/API.ts src/tests/checkout/adyen-embedded-payment-options.test.ts
git commit -m "feat(adyen): add submitAdyenEmbeddedPayment and submitAdyenEmbeddedPaymentDetails to API"
```

---

### Task 4: Update foxy-elements types and embed component

**Files:**
- Modify: `foxy-elements/src/elements/foxy-payment-method-selector/types.ts`
- Modify: `foxy-elements/src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx`
- Modify: `foxy-elements/src/elements/foxy-payment-method-selector/element.test.ts`

**Interfaces:**
- Consumes: `submitAdyenEmbeddedPayment` / `submitAdyenEmbeddedPaymentDetails` from Task 3

- [ ] **Step 1: Update `types.ts` — `PaymentMethodSelectorAdyenEmbeddedConfig`**

Find the type (currently lines 27–31):

```typescript
export type PaymentMethodSelectorAdyenEmbeddedConfig = {
  sessionData: string;
  environment: string;
  clientKey: string;
};
```

Replace with:

```typescript
export type PaymentMethodSelectorAdyenEmbeddedConfig = {
  paymentMethodsResponse: Record<string, unknown>;
  environment: string;
  clientKey: string;
};
```

- [ ] **Step 2: Update test fixtures in `element.test.ts`**

Replace `createAdyenEmbeddedApiState` (currently lines 368–398):

```typescript
function createAdyenEmbeddedApiState() {
  return {
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
        country_options: ["US", "NL", "BE", "PL"],
        region_options: ["MN", "WI"],
      },
    ],
    payment_gateways: [
      {
        type: "adyen_embedded",
        payment_methods_response: {
          paymentMethods: [{ type: "scheme", name: "Cards" }],
        },
        environment: "test",
        client_key: "adyen-client-key",
      },
    ],
  };
}
```

Update `AdyenComponentProps` (currently lines 400–405) — replace `onPaymentCompleted`/`onPaymentFailed` with `onSubmit`/`onAdditionalDetails`, keep the rest:

```typescript
type AdyenComponentProps = Record<string, unknown> & {
  type?: string;
  onSubmit?: (state: unknown, component: unknown, actions: unknown) => void;
  onAdditionalDetails?: (state: unknown, component: unknown, actions: unknown) => void;
  onPaymentCompleted?: (result: unknown) => void;
  onPaymentFailed?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  onSelect?: () => void;
};
```

Replace `createAdyenComponentMock` (currently lines 415–453) — change `submit()` to fire `onSubmit` through `actions`, which then settles `onPaymentCompleted`/`onPaymentFailed`:

```typescript
function createAdyenComponentMock(params?: {
  available?: boolean;
  mountText?: string;
  result?: Record<string, unknown>;
  unmountError?: Error;
  submitData?: Record<string, unknown>;
}) {
  const instances: AdyenComponentInstance[] = [];
  const Component = vi.fn(function AdyenComponent(
    this: AdyenComponentInstance,
    _checkout: unknown,
    props?: AdyenComponentProps,
  ) {
    const componentProps = props ?? {};
    this.props = componentProps;
    this.mount = vi.fn((container: HTMLElement) => {
      container.textContent =
        params?.mountText ?? `Adyen ${componentProps.type}`;
    });
    this.unmount = vi.fn(() => {
      if (params?.unmountError) {
        throw params.unmountError;
      }
    });
    this.isAvailable = vi.fn(() =>
      params?.available === false ? Promise.reject() : Promise.resolve(),
    );
    this.submit = vi.fn(() => {
      const state = { data: params?.submitData ?? { paymentMethod: { type: "scheme" } } };
      const actions = {
        resolve: (response: unknown) => {
          componentProps.onPaymentCompleted?.(
            response ?? params?.result ?? { resultCode: "Authorised" },
          );
        },
        reject: () => {
          componentProps.onPaymentFailed?.({ resultCode: "Refused" });
        },
      };
      componentProps.onSubmit?.(state, this, actions);
    });
    instances.push(this);
  });

  return { Component, instances };
}
```

Update the test "returns a wrapped Adyen Embedded session result from tokenize()" (around line 1853). Replace the test body:

```typescript
it("returns the Adyen payment result from tokenize()", async () => {
  const adyenResult = { resultCode: "Authorised", pspReference: "PSP123" };
  const submitAdyenEmbeddedPayment = vi.fn().mockResolvedValue(adyenResult);
  const { Component: Dropin } = createAdyenComponentMock({ result: adyenResult });
  const restoreClient = overrideClientState(
    createAdyenEmbeddedApiState(),
    undefined,
    {
      adyenEmbedded: { Dropin },
      submitAdyenEmbeddedPayment,
    },
  );
  const element = document.createElement(
    "foxy-payment-method-selector",
  ) as PaymentMethodSelectorElement;

  try {
    document.body.append(element);
    await waitForTruthy(
      () => element.querySelector("[data-foxy-adyen-host]"),
      "Adyen light DOM host",
    );

    await expect(element.tokenize()).resolves.toEqual({
      adyenEmbedded: {
        result: adyenResult,
      },
    });
    expect(submitAdyenEmbeddedPayment).toHaveBeenCalledOnce();
    expect(submitAdyenEmbeddedPayment).toHaveBeenCalledWith({ paymentMethod: { type: "scheme" } });
  } finally {
    element.remove();
    restoreClient();
  }
});
```

Also update all inline gateway config objects that appear inside individual tests (e.g. around lines 1670–1672, 1715–1717, 1812–1820). Find every occurrence of:
```javascript
type: "adyen_embedded",
session_data: "adyen-session-data",
```
and replace with:
```javascript
type: "adyen_embedded",
payment_methods_response: { paymentMethods: [{ type: "scheme", name: "Cards" }] },
```
(keeping `environment` and `client_key` lines as-is).

- [ ] **Step 3: Run tests — they should fail**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements
npx vitest run --project unit src/elements/foxy-payment-method-selector/element.test.ts
```

Expected: Adyen-related tests fail because the embed still uses the Sessions Flow callbacks.

- [ ] **Step 4: Update `adyen-embedded.tsx` — `CheckoutClientLike` type**

Find `CheckoutClientLike` (around line 185) and replace it:

```typescript
type CheckoutClientLike = {
  adyenEmbedded?: AdyenCheckoutLike | null;
  submitAdyenEmbeddedPayment?: (
    data: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
  submitAdyenEmbeddedPaymentDetails?: (
    data: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
};
```

- [ ] **Step 5: Update the Drop-in constructor in `adyen-embedded.tsx`**

Remove the `checkout.update({ showPayButton: false })` async preamble that currently wraps the constructor in an IIFE (around lines 384–388). The effect body should no longer be async at the outer level — remove the `(async () => { ... })()` wrapper and the `update` call. Keep the rest of the constructor call synchronous.

The updated effect body (replacing the IIFE from line 384 to 498) becomes:

```typescript
if (cancelled) return;

const component = new Component(checkout, {
  showRadioButton: true,
  disableFinalAnimation: true,
  readOnly: Boolean(disabled),
  onSelect: () => {
    onSelect?.();
  },
  onSubmit: async (state: unknown, _component: unknown, actions: unknown) => {
    const actionsRecord = asRecord(actions);
    try {
      const data =
        (asRecord(state)?.data as Record<string, unknown>) ?? {};
      const client = checkoutClient as CheckoutClientLike;
      const response =
        (await client.submitAdyenEmbeddedPayment?.(data)) ?? {};
      (actionsRecord?.resolve as (r: unknown) => void)?.(response);
    } catch (error) {
      (actionsRecord?.reject as () => void)?.();
      const request = tokenizationRequestRef.current;
      tokenizationRequestRef.current = null;
      settleRequest(request, toError(error, submitErrorMessage));
    }
  },
  onAdditionalDetails: async (
    state: unknown,
    _component: unknown,
    actions: unknown,
  ) => {
    const actionsRecord = asRecord(actions);
    try {
      const data =
        (asRecord(state)?.data as Record<string, unknown>) ?? {};
      const client = checkoutClient as CheckoutClientLike;
      const response =
        (await client.submitAdyenEmbeddedPaymentDetails?.(data)) ?? {};
      (actionsRecord?.resolve as (r: unknown) => void)?.(response);
    } catch (error) {
      (actionsRecord?.reject as () => void)?.();
      const request = tokenizationRequestRef.current;
      tokenizationRequestRef.current = null;
      settleRequest(request, toError(error, submitErrorMessage));
    }
  },
  onPaymentCompleted: (result: unknown) => {
    const request = tokenizationRequestRef.current;
    tokenizationRequestRef.current = null;
    const resultRecord = asRecord(result) ?? { value: result };
    settleRequest(request, resultRecord);
  },
  onPaymentFailed: (result: unknown) => {
    const request = tokenizationRequestRef.current;
    tokenizationRequestRef.current = null;
    const normalizedError = toError(result, submitErrorMessage);
    setError(normalizedError.message);
    settleRequest(request, normalizedError);
  },
  onError: (error: unknown) => {
    const request = tokenizationRequestRef.current;
    tokenizationRequestRef.current = null;
    const normalizedError = toError(error, submitErrorMessage);
    setStatus("error");
    setError(normalizedError.message);
    settleRequest(request, normalizedError);
  },
});

localComponent = component;
componentRef.current = component;
```

Keep the controller creation, `component.mount`, `isAvailable`, and cleanup return function exactly as they are currently — only the IIFE wrapper and the `checkout.update` preamble are removed.

- [ ] **Step 6: Run tests — they should pass**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements
npx vitest run --project unit src/elements/foxy-payment-method-selector/element.test.ts
```

Expected: all Adyen-related tests pass.

- [ ] **Step 7: Verify TypeScript**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements
git add src/elements/foxy-payment-method-selector/types.ts \
        src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx \
        src/elements/foxy-payment-method-selector/element.test.ts
git commit -m "feat(adyen): wire Advanced Flow callbacks in embed; update element types and tests"
```

---

### Task 5: Rewrite the `init:adyen` script

**Files:**
- Create: `foxy-elements/scripts/init-adyen-payment-methods.js`
- Modify: `foxy-elements/package.json`

- [ ] **Step 1: Create `scripts/init-adyen-payment-methods.js`**

Write the new script. It mirrors the structure of `init-adyen-session.js` but calls `/paymentMethods` instead of `/sessions`, and stores the full response rather than `id`/`sessionData`.

```javascript
import { loadEnv } from "vite";

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const ENV_FILE_PATH = resolve(PROJECT_ROOT, ".env.local");
const DEFAULT_ENVIRONMENT = "test";
const DEFAULT_TEST_PAYMENT_METHODS_URL =
  "https://checkout-test.adyen.com/v71/paymentMethods";
const DEFAULT_REFERENCE_PREFIX = "foxy-elements-demo";
const BLOCKED_PAYMENT_METHODS = [
  "ratepay",
  "ratepay_directdebit",
  "klarna",
  "klarna_account",
  "klarna_paynow",
  "paypal",
];

const PROFILE_CONFIGS = {
  US: { page: "us.html", countryCode: "US", shopperLocale: "en-US", currency: "USD", value: 1749 },
  CA: { page: "ca.html", countryCode: "CA", shopperLocale: "en-CA", currency: "CAD", value: 1749 },
  DE: { page: "de.html", countryCode: "DE", shopperLocale: "de-DE", currency: "EUR", value: 1749 },
  NL: { page: "nl.html", countryCode: "NL", shopperLocale: "nl-NL", currency: "EUR", value: 1749 },
  BE: { page: "be.html", countryCode: "BE", shopperLocale: "nl-BE", currency: "EUR", value: 1749 },
  IE: { page: "ie.html", countryCode: "IE", shopperLocale: "en-IE", currency: "EUR", value: 1749 },
  ES: { page: "es.html", countryCode: "ES", shopperLocale: "es-ES", currency: "EUR", value: 1749 },
  FR: { page: "fr.html", countryCode: "FR", shopperLocale: "fr-FR", currency: "EUR", value: 1749 },
  IT: { page: "it.html", countryCode: "IT", shopperLocale: "it-IT", currency: "EUR", value: 1749 },
  GB: { page: "gb.html", countryCode: "GB", shopperLocale: "en-GB", currency: "GBP", value: 1749 },
  CH: { page: "ch.html", countryCode: "CH", shopperLocale: "de-CH", currency: "CHF", value: 1749 },
  AU: { page: "au.html", countryCode: "AU", shopperLocale: "en-AU", currency: "AUD", value: 1749 },
  NZ: { page: "nz.html", countryCode: "NZ", shopperLocale: "en-NZ", currency: "NZD", value: 1749 },
  SE: { page: "se.html", countryCode: "SE", shopperLocale: "sv-SE", currency: "SEK", value: 14900 },
  PL: { page: "pl.html", countryCode: "PL", shopperLocale: "pl-PL", currency: "PLN", value: 6900 },
  CZ: { page: "cz.html", countryCode: "CZ", shopperLocale: "cs-CZ", currency: "CZK", value: 39900 },
  RS: { page: "rs.html", countryCode: "RS", shopperLocale: "sr-RS", currency: "RSD", value: 174900 },
  NO: { page: "no.html", countryCode: "NO", shopperLocale: "nb-NO", currency: "NOK", value: 14900 },
};

function toNonEmptyString(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function getRequiredString(env, name) {
  const value = toNonEmptyString(env[name]);
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function getOptionalString(env, name, fallback) {
  return toNonEmptyString(env[name]) || fallback;
}

function getOptionalProfileString(env, profile, name, fallback) {
  return (
    toNonEmptyString(env[`ADYEN_${profile}_${name}`]) ||
    toNonEmptyString(env[`ADYEN_${name}_${profile}`]) ||
    toNonEmptyString(env[`VITE_ADYEN_${name}_${profile}`]) ||
    toNonEmptyString(env[`ADYEN_${name}`]) ||
    toNonEmptyString(env[`VITE_ADYEN_${name}`]) ||
    fallback
  );
}

function getClientKey(env) {
  return toNonEmptyString(env.ADYEN_CLIENT_KEY) || toNonEmptyString(env.VITE_ADYEN_CLIENT_KEY) || null;
}

function getProfilePositiveInteger(env, profile, name, fallback) {
  const rawValue = getOptionalProfileString(env, profile, name, null);
  if (!rawValue) return fallback;
  const value = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} for ${profile} must be a positive integer.`);
  return value;
}

function ensureUrl(value, name) {
  try { return new URL(value).toString(); }
  catch { throw new Error(`${name} must be a valid absolute URL.`); }
}

function loadRuntimeEnv() {
  return { ...loadEnv("development", PROJECT_ROOT, ""), ...process.env };
}

function getPaymentMethodsUrl(env, environment) {
  const configuredUrl = toNonEmptyString(env.ADYEN_CHECKOUT_API_URL);
  if (configuredUrl) return ensureUrl(configuredUrl, "ADYEN_CHECKOUT_API_URL");
  if (environment === "test") return DEFAULT_TEST_PAYMENT_METHODS_URL;
  throw new Error("ADYEN_CHECKOUT_API_URL is required when ADYEN_ENVIRONMENT is not test.");
}

function getProfiles(env) {
  const rawProfiles = getOptionalString(env, "ADYEN_EXAMPLE_PROFILES", "all");
  const profileKeys = Object.keys(PROFILE_CONFIGS);
  if (rawProfiles.toLowerCase() === "all") return profileKeys;

  const profiles = rawProfiles.split(",").map((p) => p.trim().toUpperCase()).filter(Boolean);
  const unknown = profiles.filter((p) => !Object.hasOwn(PROFILE_CONFIGS, p));
  if (unknown.length > 0) throw new Error(`Unknown ADYEN_EXAMPLE_PROFILES value: ${unknown.join(", ")}.`);
  if (profiles.length === 0) throw new Error("ADYEN_EXAMPLE_PROFILES must include at least one profile.");
  return profiles;
}

function createAdyenPaymentMethodsRequest(env, profile, paymentMethodsUrl, environment, clientKey) {
  const config = PROFILE_CONFIGS[profile];
  const merchantAccount = getRequiredString(env, "ADYEN_MERCHANT_ACCOUNT");
  const apiKey = getRequiredString(env, "ADYEN_API_KEY");

  if (!clientKey) throw new Error("ADYEN_CLIENT_KEY is required.");

  const referencePrefix = getOptionalString(env, "ADYEN_REFERENCE_PREFIX", DEFAULT_REFERENCE_PREFIX);
  const value = getProfilePositiveInteger(env, profile, "AMOUNT_VALUE", config.value);
  const currency = getOptionalProfileString(env, profile, "CURRENCY", config.currency).toUpperCase();
  const countryCode = getOptionalProfileString(env, profile, "COUNTRY_CODE", config.countryCode).toUpperCase();
  const shopperLocale = getOptionalProfileString(env, profile, "SHOPPER_LOCALE", config.shopperLocale);
  const reference = `${referencePrefix}-${profile.toLowerCase()}-${Date.now()}`;

  const body = {
    merchantAccount,
    reference,
    amount: { currency, value },
    countryCode,
    shopperLocale,
    blockedPaymentMethods: BLOCKED_PAYMENT_METHODS,
    lineItems: [
      {
        id: "demo-001",
        description: "Demo product",
        quantity: 1,
        amountIncludingTax: value,
        amountExcludingTax: value,
        taxAmount: 0,
        taxPercentage: 0,
      },
    ],
  };

  const shopperEmail = getOptionalString(env, "ADYEN_SHOPPER_EMAIL", null);
  const shopperReference = getOptionalString(env, "ADYEN_SHOPPER_REFERENCE", null);

  if (shopperEmail) body.shopperEmail = shopperEmail;
  if (shopperReference) {
    body.shopperReference = shopperReference;
    body.recurringProcessingModel = getOptionalString(env, "ADYEN_RECURRING_PROCESSING_MODEL", "CardOnFile");
    body.storePaymentMethodMode = getOptionalString(env, "ADYEN_STORE_PAYMENT_METHOD_MODE", "askForConsent");
  }

  return { profile, environment, paymentMethodsUrl, apiKey, clientKey, body };
}

function tryParseJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

function summarizeAdyenError(status, payload) {
  if (!payload || typeof payload !== "object") return `Adyen request failed with HTTP ${status}.`;
  const lines = [`Adyen request failed with HTTP ${status}.`];
  if (typeof payload.errorCode === "string") lines.push(`errorCode: ${payload.errorCode}`);
  if (typeof payload.message === "string") lines.push(`message: ${payload.message}`);
  if (typeof payload.errorType === "string") lines.push(`errorType: ${payload.errorType}`);
  if (typeof payload.pspReference === "string") lines.push(`pspReference: ${payload.pspReference}`);
  if (payload.errorCode === "192" && typeof payload.message === "string" && /merchantAccount/i.test(payload.message)) {
    lines.push("hint: Check that ADYEN_MERCHANT_ACCOUNT is the merchant account code for the same Adyen environment and API credential used by this script.");
  }
  return lines.join("\n");
}

async function fetchAdyenPaymentMethods(config) {
  const response = await fetch(config.paymentMethodsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-API-key": config.apiKey },
    body: JSON.stringify(config.body),
  });
  const responseText = await response.text();
  const payload = tryParseJson(responseText);
  if (!response.ok) throw new Error(summarizeAdyenError(response.status, payload));
  if (!payload || typeof payload !== "object") throw new Error("Adyen returned a non-JSON response.");
  return payload;
}

function validateAdyenPaymentMethodsResponse(payload) {
  if (!Array.isArray(payload.paymentMethods)) {
    throw new Error("Adyen response must include a paymentMethods array.");
  }
  return payload;
}

async function upsertEnvVars(filePath, entries) {
  let content = "";
  try { content = await readFile(filePath, "utf8"); }
  catch (error) { if (error?.code !== "ENOENT") throw error; }

  const names = new Set(entries.map(([name]) => name));
  const lines = content ? content.split(/\r?\n/) : [];
  const filteredLines = lines.filter((line) => {
    const equalsIndex = line.indexOf("=");
    const name = equalsIndex >= 0 ? line.slice(0, equalsIndex) : line;
    return !names.has(name);
  });

  while (filteredLines.length > 0 && filteredLines.at(-1) === "") filteredLines.pop();
  for (const [name, value] of entries) filteredLines.push(`${name}=${value}`);
  filteredLines.push("");
  await writeFile(filePath, filteredLines.join("\n"), "utf8");
}

async function main() {
  const env = loadRuntimeEnv();
  const environment = (toNonEmptyString(env.ADYEN_ENVIRONMENT) || toNonEmptyString(env.VITE_ADYEN_ENVIRONMENT) || DEFAULT_ENVIRONMENT).toLowerCase();
  const paymentMethodsUrl = getPaymentMethodsUrl(env, environment);
  const profiles = getProfiles(env);
  const clientKey = getClientKey(env);

  if (!clientKey) throw new Error("ADYEN_CLIENT_KEY or VITE_ADYEN_CLIENT_KEY is required.");

  const envEntries = [
    ["VITE_ADYEN_ENVIRONMENT", environment],
    ["VITE_ADYEN_CLIENT_KEY", clientKey],
  ];
  const summaries = [];

  for (const profile of profiles) {
    const request = createAdyenPaymentMethodsRequest(env, profile, paymentMethodsUrl, environment, clientKey);
    const raw = await fetchAdyenPaymentMethods(request);
    const paymentMethodsResponse = validateAdyenPaymentMethodsResponse(raw);

    envEntries.push([
      `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_${profile}`,
      JSON.stringify(paymentMethodsResponse),
    ]);
    summaries.push({
      profile,
      methods: paymentMethodsResponse.paymentMethods.length,
      countryCode: request.body.countryCode,
      currency: request.body.amount.currency,
      value: request.body.amount.value,
    });
  }

  await upsertEnvVars(ENV_FILE_PATH, envEntries);

  console.log(`Stored Adyen payment methods in ${ENV_FILE_PATH}`);
  for (const s of summaries) {
    console.log(`${s.profile}: methods=${s.methods} country=${s.countryCode} amount=${s.value} ${s.currency}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
```

- [ ] **Step 2: Update `package.json`**

Find `"init:adyen": "node ./scripts/init-adyen-session.js"` and replace with:

```json
"init:adyen": "node ./scripts/init-adyen-payment-methods.js",
```

- [ ] **Step 3: Verify the script parses without error**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements
node --input-type=module --eval "import './scripts/init-adyen-payment-methods.js'" 2>&1 | head -5
```

Expected: exits immediately (no syntax errors; it will fail on missing env vars which is fine).

- [ ] **Step 4: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements
git add scripts/init-adyen-payment-methods.js package.json
git commit -m "feat(adyen): replace init:adyen session script with paymentMethods script"
```

---

### Task 6: Update example HTML files

**Files:**
- Modify: `foxy-elements/examples/custom/adyen_embedded/au.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/be.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/ca.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/ch.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/cz.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/de.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/es.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/fr.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/gb.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/ie.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/it.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/nl.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/no.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/nz.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/pl.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/rs.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/se.html`
- Modify: `foxy-elements/examples/custom/adyen_embedded/us.html`

Each file has the same two-line change. In the `payment_gateways` array, replace:

```javascript
session_id: import.meta.env.VITE_ADYEN_SESSION_ID_XX,
session_data: import.meta.env.VITE_ADYEN_SESSION_DATA_XX,
```

with:

```javascript
payment_methods_response: JSON.parse(import.meta.env.VITE_ADYEN_PAYMENT_METHODS_RESPONSE_XX ?? "{}"),
```

where `XX` is the profile suffix for that file (e.g. `US` for `us.html`, `AU` for `au.html`, `BE` for `be.html`, etc.).

The full list of substitutions:
- `au.html` → `AU`
- `be.html` → `BE`
- `ca.html` → `CA`
- `ch.html` → `CH`
- `cz.html` → `CZ`
- `de.html` → `DE`
- `es.html` → `ES`
- `fr.html` → `FR`
- `gb.html` → `GB`
- `ie.html` → `IE`
- `it.html` → `IT`
- `nl.html` → `NL`
- `no.html` → `NO`
- `nz.html` → `NZ`
- `pl.html` → `PL`
- `rs.html` → `RS`
- `se.html` → `SE`
- `us.html` → `US`

- [ ] **Step 1: Apply the substitution to all 18 files**

Use a shell loop to apply the change:

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements/examples/custom/adyen_embedded

for profile in AU BE CA CH CZ DE ES FR GB IE IT NL NO NZ PL RS SE US; do
  file="${profile,,}.html"
  # Remove the session_id line
  sed -i '' "/session_id: import\.meta\.env\.VITE_ADYEN_SESSION_ID_${profile}/d" "$file"
  # Replace session_data line with payment_methods_response
  sed -i '' "s|session_data: import\.meta\.env\.VITE_ADYEN_SESSION_DATA_${profile},|payment_methods_response: JSON.parse(import.meta.env.VITE_ADYEN_PAYMENT_METHODS_RESPONSE_${profile} ?? \"{}\"),|" "$file"
done
```

- [ ] **Step 2: Verify one file looks correct**

Open `us.html` and confirm the `payment_gateways` section reads:

```javascript
payment_gateways: [
  {
    type: "adyen_embedded",
    payment_methods_response: JSON.parse(import.meta.env.VITE_ADYEN_PAYMENT_METHODS_RESPONSE_US ?? "{}"),
    environment: import.meta.env.VITE_ADYEN_ENVIRONMENT || "test",
    client_key: import.meta.env.VITE_ADYEN_CLIENT_KEY,
  },
],
```

- [ ] **Step 3: Verify no `session_id` or `session_data` references remain**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements
grep -r "session_id\|session_data\|SESSION_ID\|SESSION_DATA" examples/custom/adyen_embedded/
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements
git add examples/custom/adyen_embedded/
git commit -m "feat(adyen): update example pages to use payment_methods_response"
```
