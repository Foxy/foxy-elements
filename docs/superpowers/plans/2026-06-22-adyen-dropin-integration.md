# Adyen Drop-in Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the per-payment-method Adyen component fan-out with a single Drop-in entry per gateway, collapsing ~70 type mappings into one entry that lets the Drop-in own method selection.

**Architecture:** `#createAdyenEmbeddedGatewayEntries` returns one entry (type `"adyen-embedded"`) instead of N per-method entries. `adyen-embedded.tsx` always constructs a `Dropin` component. Types shrink accordingly and `ADYEN_BUTTON_ONLY_OPTION_TYPES` is deleted everywhere.

**Tech Stack:** TypeScript, React 19, Adyen Web SDK v6, Vitest + Playwright (browser tests)

## Global Constraints

- Run TypeScript check after each task: `npx tsc -b`
- Run affected tests after each task: `npx vitest run --project=unit --reporter=verbose src/elements/foxy-payment-method-selector/element.test.ts`
- Breaking changes to `PaymentMethodSelectorAdyenEmbeddedConfig` and `PaymentMethodSelectorAdyenEmbeddedTokenizePayload` are intentional — do not add backward-compat shims
- Do not touch `BUTTON_CLICK_HINT_OPTION_TYPES` (different constant, unrelated to this change)
- Working directory: `/Users/pheekus/FoxyCommerce/foxy-elements`

---

### Task 1: Simplify types in types.ts

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/types.ts:27-143`

**Interfaces:**
- Produces: `PaymentMethodSelectorAdyenEmbeddedConfig = { sessionData, environment, clientKey }` (consumed by Tasks 4 and 5)
- Produces: `PaymentMethodSelectorAdyenEmbeddedTokenizePayload = { adyenEmbedded: { result } }` (consumed by Task 5)

- [ ] **Step 1: Delete `PaymentMethodSelectorAdyenEmbeddedPaymentMethod`**

  Remove lines 27–32 from `src/elements/foxy-payment-method-selector/types.ts`:

  ```typescript
  // DELETE these 6 lines:
  export type PaymentMethodSelectorAdyenEmbeddedPaymentMethod = {
    type: string;
    name?: string;
    brands?: string[];
    [key: string]: unknown;
  };
  ```

- [ ] **Step 2: Shrink `PaymentMethodSelectorAdyenEmbeddedConfig`**

  Replace lines 34–41:

  ```typescript
  // BEFORE
  export type PaymentMethodSelectorAdyenEmbeddedConfig = {
    sessionData: string;
    environment: string;
    clientKey: string;
    paymentMethodType: string;
    paymentMethod: PaymentMethodSelectorAdyenEmbeddedPaymentMethod;
    componentName: string;
  };

  // AFTER
  export type PaymentMethodSelectorAdyenEmbeddedConfig = {
    sessionData: string;
    environment: string;
    clientKey: string;
  };
  ```

- [ ] **Step 3: Shrink `PaymentMethodSelectorAdyenEmbeddedTokenizePayload`**

  Replace lines 137–143:

  ```typescript
  // BEFORE
  export type PaymentMethodSelectorAdyenEmbeddedTokenizePayload = {
    adyenEmbedded: {
      paymentMethodType: string;
      paymentMethod: PaymentMethodSelectorAdyenEmbeddedPaymentMethod;
      result: Record<string, unknown>;
    };
  };

  // AFTER
  export type PaymentMethodSelectorAdyenEmbeddedTokenizePayload = {
    adyenEmbedded: {
      result: Record<string, unknown>;
    };
  };
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  Run: `npx tsc -b`

  Expected: compile errors in `element.tsx` and `adyen-embedded.tsx` (they reference the removed fields) — these are expected and fixed in later tasks. The test for no errors here would be that `types.ts` itself has no internal errors.

- [ ] **Step 5: Commit**

  ```bash
  git add src/elements/foxy-payment-method-selector/types.ts
  git commit -m "refactor(adyen): shrink AdyenEmbeddedConfig and tokenize payload types"
  ```

---

### Task 2: Remove ADYEN_BUTTON_ONLY_OPTION_TYPES from constants.ts

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/constants.ts:39-60`

**Interfaces:**
- Removes: `ADYEN_BUTTON_ONLY_OPTION_TYPES` export (consumed by view.tsx and element.tsx — both fixed in Tasks 3 and 5)

- [ ] **Step 1: Delete the `ADYEN_BUTTON_ONLY_OPTION_TYPES` export**

  Remove lines 36–60 from `src/elements/foxy-payment-method-selector/constants.ts` (the comment on line 36 and the Set on lines 39–60):

  ```typescript
  // DELETE these lines:

  // Adyen payment methods that only render a payment button — no form fields.
  // The selector shows a generic redirect UI for these; the actual button is
  // rendered by a separate component.
  export const ADYEN_BUTTON_ONLY_OPTION_TYPES = new Set([
    "apple-pay",
    "google-pay",
    "alipay",
    "paysafecard",
    "cash-app",
    "we-chat",
    "we-chat-qr",
    "we-chat-web",
    "we-chat-mini-program",
    "bank-transfer",
    "bancontact",
    "bizum",
    "eps",
    "ideal",
    "przelewy24",
    "swish",
    "vipps",
    "twint",
    "zip",
    "zip-pos",
  ]);
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/elements/foxy-payment-method-selector/constants.ts
  git commit -m "refactor(adyen): remove ADYEN_BUTTON_ONLY_OPTION_TYPES"
  ```

---

### Task 3: Update view.tsx — remove all ADYEN_BUTTON_ONLY_OPTION_TYPES references

`view.tsx` uses `ADYEN_BUTTON_ONLY_OPTION_TYPES` in six places. With the Drop-in, every `adyenEmbedded` option renders embedded content, so all `!ADYEN_BUTTON_ONLY_OPTION_TYPES.has(option.type ?? "")` guards simplify to nothing.

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/view.tsx`

**Interfaces:**
- Consumes: `ADYEN_BUTTON_ONLY_OPTION_TYPES` (removed in Task 2) — delete the import
- No interface changes for callers

- [ ] **Step 1: Remove the import**

  Find and remove `ADYEN_BUTTON_ONLY_OPTION_TYPES` from the import at line 45 of `view.tsx`. The import line reads something like:

  ```typescript
  // BEFORE (line ~43-47):
  import {
    ADYEN_BUTTON_ONLY_OPTION_TYPES,
    BUTTON_CLICK_HINT_OPTION_TYPES,
    CARD_TYPES,
    // ...
  } from "./constants";

  // AFTER: remove only ADYEN_BUTTON_ONLY_OPTION_TYPES from the import list
  import {
    BUTTON_CLICK_HINT_OPTION_TYPES,
    CARD_TYPES,
    // ...
  } from "./constants";
  ```

- [ ] **Step 2: Fix the option description function (line ~300)**

  ```typescript
  // BEFORE (lines ~300-306):
  if (option.adyenEmbedded && !ADYEN_BUTTON_ONLY_OPTION_TYPES.has(option.type ?? "")) {
    if (option.type === "new-card") {
      return intl.formatMessage(messages.optionDescriptionNewCard);
    }
    return intl.formatMessage(messages.optionDescriptionAdyenEmbedded);
  }

  // AFTER:
  if (option.adyenEmbedded) {
    return intl.formatMessage(messages.optionDescriptionAdyenEmbedded);
  }
  ```

- [ ] **Step 3: Fix the button-click-hint render guard (line ~438)**

  ```typescript
  // BEFORE:
  if (
    (option.adyenEmbedded && !ADYEN_BUTTON_ONLY_OPTION_TYPES.has(option.type ?? "")) ||
    !option.type ||
    (!BUTTON_CLICK_HINT_OPTION_TYPES.has(option.type) && !isSquareButtonOnly)
  ) {

  // AFTER:
  if (
    option.adyenEmbedded ||
    !option.type ||
    (!BUTTON_CLICK_HINT_OPTION_TYPES.has(option.type) && !isSquareButtonOnly)
  ) {
  ```

- [ ] **Step 4: Fix the body content render guard (line ~692)**

  ```typescript
  // BEFORE:
  if (option.adyenEmbedded && !ADYEN_BUTTON_ONLY_OPTION_TYPES.has(option.type ?? "")) {

  // AFTER:
  if (option.adyenEmbedded) {
  ```

- [ ] **Step 5: Fix `hasBillingAddressContent` (line ~768)**

  ```typescript
  // BEFORE:
  const isAdyenButtonOnly = ADYEN_BUTTON_ONLY_OPTION_TYPES.has(option.type ?? "");
  const isSquareFormBased = option.type === "new-card";
  if (option.klarna || (option.adyenEmbedded && !isAdyenButtonOnly) || (option.squareUp && isSquareFormBased)) {

  // AFTER (remove isAdyenButtonOnly, simplify condition):
  const isSquareFormBased = option.type === "new-card";
  if (option.klarna || option.adyenEmbedded || (option.squareUp && isSquareFormBased)) {
  ```

- [ ] **Step 6: Fix `hasPaymentOptionBodyContent` (line ~812)**

  ```typescript
  // BEFORE:
  const isAdyenButtonOnly = ADYEN_BUTTON_ONLY_OPTION_TYPES.has(option.type ?? "");
  const isSquareFormBased = option.type === "new-card";
  if ((option.adyenEmbedded && !isAdyenButtonOnly) || (option.squareUp && isSquareFormBased)) {

  // AFTER:
  const isSquareFormBased = option.type === "new-card";
  if (option.adyenEmbedded || (option.squareUp && isSquareFormBased)) {
  ```

- [ ] **Step 7: Fix the card overflow-visible class (line ~1266)**

  ```typescript
  // BEFORE:
  checked && option.adyenEmbedded && !ADYEN_BUTTON_ONLY_OPTION_TYPES.has(option.type ?? "") && "overflow-visible",

  // AFTER:
  checked && option.adyenEmbedded && "overflow-visible",
  ```

- [ ] **Step 8: Verify TypeScript compiles**

  Run: `npx tsc -b`

  Expected: no errors in `view.tsx`; remaining errors are in `element.tsx` and `adyen-embedded.tsx` (fixed in Tasks 4 and 5).

- [ ] **Step 9: Commit**

  ```bash
  git add src/elements/foxy-payment-method-selector/view.tsx
  git commit -m "refactor(adyen): remove ADYEN_BUTTON_ONLY_OPTION_TYPES guards from view"
  ```

---

### Task 4: Rewrite adyen-embedded.tsx as a Drop-in wrapper

Replace the per-method component construction with a `Dropin` constructor. Remove the `stylesReady` probe, `inputStyles` calculation, and all per-method config fields.

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx`

**Interfaces:**
- Consumes: `PaymentMethodSelectorAdyenEmbeddedConfig` (now `{ sessionData, environment, clientKey }` from Task 1)
- External props `AdyenEmbeddedOptionProps` are unchanged — `option`, `disabled`, `onControllerReady`, and the four message strings
- Produces: same `PaymentController` interface with `tokenize()` that resolves `{ result }` (no paymentMethodType/paymentMethod)

- [ ] **Step 1: Remove unused imports**

  At the top of `adyen-embedded.tsx`, remove:

  ```typescript
  // REMOVE these two imports:
  import {
    type HostedFieldStyleAttributes,
    useResolvedHostedFieldStyleAttributes,
  } from "../stripe/style-hooks";

  // REMOVE from react imports (keep useEffect, useRef, useState):
  useMemo,
  ```

  The final React import should be:

  ```typescript
  import { useEffect, useRef, useState } from "react";
  ```

- [ ] **Step 2: Delete unused type definitions**

  Remove from `adyen-embedded.tsx`:

  ```typescript
  // DELETE AdyenInputStyles type:
  type AdyenInputStyles = Record<string, Record<string, string>>;

  // DELETE AdyenEmbeddedCssProperties type:
  type AdyenEmbeddedCssProperties = CSSProperties & {
    "--foxy-adyen-input-padding-x"?: string;
    "--foxy-adyen-input-padding-y"?: string;
  };
  ```

  Also remove the `CSSProperties` import from react (it's no longer used):

  ```typescript
  // BEFORE:
  import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

  // AFTER (already done in Step 1, confirming):
  import { useEffect, useRef, useState } from "react";
  ```

- [ ] **Step 3: Delete `createAdyenInputStyles` function**

  Remove the entire function (lines ~324–376):

  ```typescript
  // DELETE the entire function:
  function createAdyenInputStyles(
    styleAttributes: HostedFieldStyleAttributes,
  ): AdyenInputStyles {
    // ...
  }
  ```

- [ ] **Step 4: Remove probe/styles state from the component**

  Inside `AdyenEmbeddedOption`, remove:

  ```typescript
  // REMOVE these three blocks:
  const {
    probeRef,
    ready: stylesReady,
    styleAttributes,
  } = useResolvedHostedFieldStyleAttributes({
    inputTextColorFallbackVariable: "--foreground",
    inputTextSizeFallbackVariable: "--text-sm",
  });
  const inputStyles = useMemo(
    () => createAdyenInputStyles(styleAttributes),
    [styleAttributes],
  );
  const inputStylesSignature = useMemo(
    () => JSON.stringify(inputStyles),
    [inputStyles],
  );
  const adyenStyleVariables = useMemo<AdyenEmbeddedCssProperties>(() => {
    return {
      ...(styleAttributes.inputPaddingX
        ? { "--foxy-adyen-input-padding-x": styleAttributes.inputPaddingX }
        : {}),
      ...(styleAttributes.inputPaddingY
        ? { "--foxy-adyen-input-padding-y": styleAttributes.inputPaddingY }
        : {}),
    };
  }, [styleAttributes.inputPaddingX, styleAttributes.inputPaddingY]);
  ```

- [ ] **Step 5: Update the main `useEffect` — gate, constructor, and deps**

  **Remove the `stylesReady` guard** in the effect:

  ```typescript
  // BEFORE:
  if (!adyenOption || !container || !stylesReady) return;

  // AFTER:
  if (!adyenOption || !container) return;
  ```

  **Replace the per-method component constructor** with `"Dropin"`:

  ```typescript
  // BEFORE:
  const checkout = (checkoutClient as CheckoutClientLike).adyenEmbedded;
  const Component = checkout
    ? getAdyenComponentConstructor(checkout, adyenOption.componentName)
    : undefined;

  // AFTER:
  const checkout = (checkoutClient as CheckoutClientLike).adyenEmbedded;
  const Component = checkout
    ? getAdyenComponentConstructor(checkout, "Dropin")
    : undefined;
  ```

  **Remove per-method constructor props**:

  ```typescript
  // BEFORE:
  const component = new Component(checkout, {
    type: adyenOption.paymentMethodType,
    paymentMethodType: adyenOption.paymentMethodType,
    paymentMethod: adyenOption.paymentMethod,
    styles: inputStyles,
    showPayButton: false,
    readOnly: Boolean(disabled),
    onPaymentCompleted: ...,
    onPaymentFailed: ...,
    onError: ...,
  });

  // AFTER:
  const component = new Component(checkout, {
    showPayButton: false,
    readOnly: Boolean(disabled),
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
  ```

  **Remove stale deps** from the effect dependency array:

  ```typescript
  // BEFORE:
  }, [
    disabled,
    inputStyles,
    inputStylesSignature,
    loadErrorMessage,
    onControllerReady,
    option.adyenEmbedded,
    option.id,
    stylesReady,
    submitErrorMessage,
    unavailableMessage,
  ]);

  // AFTER:
  }, [
    disabled,
    loadErrorMessage,
    onControllerReady,
    option.adyenEmbedded,
    option.id,
    submitErrorMessage,
    unavailableMessage,
  ]);
  ```

- [ ] **Step 6: Remove probe div and inline style from JSX**

  ```tsx
  // BEFORE:
  return (
    <div className="foxy-adyen-embedded" style={adyenStyleVariables}>
      <div
        ref={probeRef}
        className="foxy-adyen-embedded__probe"
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        data-adyen-embedded-component="true"
        data-adyen-embedded-status={status}
        aria-disabled={disabled ? "true" : undefined}
      />
      ...
    </div>
  );

  // AFTER:
  return (
    <div className="foxy-adyen-embedded">
      <div
        ref={containerRef}
        data-adyen-embedded-component="true"
        data-adyen-embedded-status={status}
        aria-disabled={disabled ? "true" : undefined}
      />
      {status === "loading" ? (
        <p className="foxy-adyen-embedded__message">{loadingMessage}</p>
      ) : null}
      {error ? (
        <p className="foxy-adyen-embedded__message foxy-adyen-embedded__message--error">
          {error}
        </p>
      ) : null}
    </div>
  );
  ```

- [ ] **Step 7: Verify TypeScript compiles**

  Run: `npx tsc -b`

  Expected: no errors in `adyen-embedded.tsx`; remaining errors are in `element.tsx` (fixed in Task 5).

- [ ] **Step 8: Commit**

  ```bash
  git add src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx
  git commit -m "refactor(adyen): replace per-method component with Drop-in in AdyenEmbeddedOption"
  ```

---

### Task 5: Simplify element.tsx

Remove the per-method type map, related helpers, and simplify entry creation, config building, and the tokenization payload.

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/element.tsx`

**Interfaces:**
- Consumes: `PaymentMethodSelectorAdyenEmbeddedConfig` from Task 1 (now `{ sessionData, environment, clientKey }`)
- `#createAdyenEmbeddedGatewayEntries` now returns exactly 1 entry per gateway instead of N
- `#isAdyenOption` drops the `ADYEN_BUTTON_ONLY_OPTION_TYPES` guard

- [ ] **Step 1: Remove `ADYEN_PAYMENT_METHOD_TYPE_MAP` constant**

  Delete lines 77–175 (the entire `ADYEN_PAYMENT_METHOD_TYPE_MAP` constant):

  ```typescript
  // DELETE the entire constant from line 77:
  const ADYEN_PAYMENT_METHOD_TYPE_MAP: Record<
    string,
    { type: string; componentName: string }
  > = {
    card: { type: "new-card", componentName: "Card" },
    scheme: { type: "new-card", componentName: "Card" },
    // ... ~70 entries
  };
  ```

- [ ] **Step 2: Delete `AdyenEmbeddedPaymentMethodLike` and `AdyenEmbeddedSdkLike` types**

  Remove lines 62–75:

  ```typescript
  // DELETE:
  type AdyenEmbeddedPaymentMethodLike = {
    type: string;
    name?: string;
    brands?: string[];
    [key: string]: unknown;
  };

  // DELETE:
  type AdyenEmbeddedSdkLike = {
    paymentMethodsResponse?: {
      paymentMethods?: unknown[];
      storedPaymentMethods?: unknown[];
      [key: string]: unknown;
    };
  };
  ```

- [ ] **Step 3: Remove `ADYEN_BUTTON_ONLY_OPTION_TYPES` import**

  Find and remove the import from `./constants`:

  ```typescript
  // BEFORE:
  import { ADYEN_BUTTON_ONLY_OPTION_TYPES } from "./constants";

  // AFTER: delete this entire import line
  ```

- [ ] **Step 4: Delete `#toAdyenPaymentMethodKey` and `#getAdyenPaymentMethodMapping`**

  Delete lines 1463–1473:

  ```typescript
  // DELETE both methods:
  #toAdyenPaymentMethodKey(value: unknown): string {
    return this.#toText(value).trim().toLowerCase();
  }

  #getAdyenPaymentMethodMapping(
    paymentMethodType: string,
  ): { type: string; componentName: string } | undefined {
    return ADYEN_PAYMENT_METHOD_TYPE_MAP[
      this.#toAdyenPaymentMethodKey(paymentMethodType)
    ];
  }
  ```

- [ ] **Step 5: Delete `#getAdyenEmbeddedSdk` and simplify `#createAdyenEmbeddedGatewayEntries`**

  Delete `#getAdyenEmbeddedSdk` (lines 1475–1479):

  ```typescript
  // DELETE:
  #getAdyenEmbeddedSdk(): AdyenEmbeddedSdkLike | null {
    return this.#asRecord(
      this.#checkoutClient.adyenEmbedded,
    ) as AdyenEmbeddedSdkLike | null;
  }
  ```

  Replace `#createAdyenEmbeddedGatewayEntries` (lines 1481–1524) with:

  ```typescript
  #createAdyenEmbeddedGatewayEntries(
    config: Record<string, unknown>,
  ): Record<string, unknown>[] {
    const sessionData = this.#toOptionalText(config.session_data);
    const environment = this.#toOptionalText(config.environment);
    const clientKey = this.#toOptionalText(config.client_key);

    if (!sessionData || !environment || !clientKey) {
      return [];
    }

    return [
      {
        type: "adyen-embedded",
        gateway: "adyen_embedded",
        session_data: sessionData,
        environment,
        client_key: clientKey,
      },
    ];
  }
  ```

- [ ] **Step 6: Simplify `#createAdyenEmbeddedConfig`**

  Replace the method at lines 2399–2436 with:

  ```typescript
  #createAdyenEmbeddedConfig(
    option: Record<string, unknown>,
  ): PaymentMethodSelectorAdyenEmbeddedConfig | undefined {
    if (this.#toText(option.gateway) !== "adyen_embedded") {
      return undefined;
    }

    const sessionData = this.#toOptionalText(option.session_data);
    const environment = this.#toOptionalText(option.environment);
    const clientKey = this.#toOptionalText(option.client_key);

    if (!sessionData || !environment || !clientKey) {
      return undefined;
    }

    return { sessionData, environment, clientKey };
  }
  ```

- [ ] **Step 7: Update the adyen_embedded option builder (around line 2564)**

  Replace the `if (gateway === "adyen_embedded")` block with:

  ```typescript
  if (gateway === "adyen_embedded") {
    const adyenEmbedded = this.#createAdyenEmbeddedConfig(option);
    if (!adyenEmbedded) {
      return [];
    }

    return [
      {
        id: optionId,
        type,
        label: "Adyen",
        gateway,
        disabled,
        adyenEmbedded,
      },
    ];
  }
  ```

- [ ] **Step 8: Simplify `#isAdyenOption`**

  Replace lines 2996–3001:

  ```typescript
  // BEFORE:
  #isAdyenOption(option: PaymentMethodSelectorOption | undefined): boolean {
    return Boolean(
      option?.adyenEmbedded &&
      !ADYEN_BUTTON_ONLY_OPTION_TYPES.has(option.type ?? ""),
    );
  }

  // AFTER:
  #isAdyenOption(option: PaymentMethodSelectorOption | undefined): boolean {
    return Boolean(option?.adyenEmbedded);
  }
  ```

- [ ] **Step 9: Update the tokenization payload builder (around line 1285)**

  Replace lines 1285–1300:

  ```typescript
  // BEFORE:
  if (selectedOption.adyenEmbedded) {
    const result = this.#asRecord(payload.result);
    if (!result) {
      throw new Error(
        "Adyen Embedded tokenization response is missing a result.",
      );
    }

    return {
      adyenEmbedded: {
        paymentMethodType: selectedOption.adyenEmbedded.paymentMethodType,
        paymentMethod: selectedOption.adyenEmbedded.paymentMethod,
        result,
      },
    };
  }

  // AFTER:
  if (selectedOption.adyenEmbedded) {
    const result = this.#asRecord(payload.result);
    if (!result) {
      throw new Error(
        "Adyen Embedded tokenization response is missing a result.",
      );
    }

    return {
      adyenEmbedded: {
        result,
      },
    };
  }
  ```

- [ ] **Step 10: Verify TypeScript compiles cleanly**

  Run: `npx tsc -b`

  Expected: zero errors.

- [ ] **Step 11: Commit**

  ```bash
  git add src/elements/foxy-payment-method-selector/element.tsx
  git commit -m "refactor(adyen): simplify entry creation, config, and tokenize payload for Drop-in"
  ```

---

### Task 6: Update element.test.ts

Update existing Adyen tests to reflect the Drop-in architecture: one Dropin option per gateway, no per-method entries, simplified tokenize payload.

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/element.test.ts`

**Context:** The test helper `createAdyenComponentMock` creates a generic Vitest mock that works for any Adyen component including `Dropin`. The `overrideClientState` third argument sets properties on `checkoutClient.adyenEmbedded`. All tests that previously referenced `Card` or `Redirect` mocks now use a `Dropin` mock.

- [ ] **Step 1: Update "renders Adyen Embedded payment methods from the SDK response"**

  The test currently expects four per-method entries ("New Card", "iDEAL", "Bancontact", "SEPA"). After the change, there is exactly one "Adyen" entry and the `Dropin` constructor is called.

  Find the test at line ~1596 and replace it:

  ```typescript
  it("renders a single Adyen Drop-in entry from the gateway config", async () => {
    const { Component: Dropin } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: {
          Dropin,
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "Adyen");

      const content = element.shadowRoot?.textContent ?? "";
      expect(content).toContain("Adyen");
      expect(content).not.toContain("New Card");
      expect(content).not.toContain("iDEAL");
      await waitForTruthy(() => Dropin.mock.calls.length === 1, "Adyen Drop-in");
      expect(Dropin).toHaveBeenCalledTimes(1);
    } finally {
      element.remove();
      restoreClient();
    }
  });
  ```

- [ ] **Step 2: Update "mounts Adyen Embedded components in light DOM and cleans them up"**

  The test currently switches between two Adyen options. Update to mount a single Dropin and verify cleanup on element removal.

  Find the test at line ~1642 and replace it:

  ```typescript
  it("mounts Adyen Drop-in in light DOM and cleans it up on removal", async () => {
    const { Component: Dropin, instances } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: {
          Dropin,
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      const host = await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );

      await waitForText(() => host.textContent, "Adyen drop-in");

      expect(host.textContent).toContain("Adyen drop-in");
      expect(instances[0]?.props).toMatchObject({
        showPayButton: false,
      });

      element.remove();
      await waitForRender();
      expect(element.querySelector("[data-foxy-adyen-host]")).toBeNull();
    } finally {
      element.remove();
      restoreClient();
    }
  });
  ```

- [ ] **Step 3: Update "continues remounting when provider unmount throws"**

  The test needs two options to switch between. Add a second `adyen_embedded` gateway entry to the API state so the selector creates two Dropin options; switching between them exercises the unmount-error path.

  Find the test at line ~1701 and replace it:

  ```typescript
  it("continues remounting Adyen Drop-in when provider unmount throws", async () => {
    const { Component: Dropin, instances } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
      unmountError: new Error("Provider cleanup failed"),
    });
    const restoreClient = overrideClientState(
      {
        ...createAdyenEmbeddedApiState(),
        payment_gateways: [
          {
            type: "adyen_embedded",
            session_data: "adyen-session-data-1",
            environment: "test",
            client_key: "adyen-client-key-1",
          },
          {
            type: "adyen_embedded",
            session_data: "adyen-session-data-2",
            environment: "test",
            client_key: "adyen-client-key-2",
          },
        ],
      },
      undefined,
      {
        adyenEmbedded: {
          Dropin,
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(() => element.textContent, "Adyen drop-in");

      element.optionIndex = 1;
      await waitForRender();

      expect(instances[0]?.unmount).toHaveBeenCalledTimes(1);
      expect(
        element.querySelector("[data-foxy-adyen-host]")?.textContent,
      ).toContain("Adyen drop-in");
    } finally {
      element.remove();
      restoreClient();
    }
  });
  ```

- [ ] **Step 4: Delete "passes themed input styles to Adyen Embedded components"**

  Find and delete the test starting at line ~1746 ("passes themed input styles to Adyen Embedded components"). The Drop-in uses `--adyen-sdk-*` CSS variables for all styling; no `styles` prop is passed to the constructor.

  Delete from `it("passes themed input styles` through its closing `});` (approximately lines 1746–1873).

- [ ] **Step 5: Delete "falls back to host text tokens for Adyen Embedded card field styles"**

  Find and delete the test starting at line ~1876 ("falls back to host text tokens for Adyen Embedded card field styles").

  Delete from `it("falls back to host text tokens` through its closing `});` (approximately lines 1876–1924).

- [ ] **Step 6: Update "returns a wrapped Adyen Embedded session result from tokenize()"**

  Update the expected payload to remove `paymentMethodType` and `paymentMethod`. Find around line 1959:

  ```typescript
  // BEFORE:
  await expect(element.tokenize()).resolves.toEqual({
    adyenEmbedded: {
      paymentMethodType: "scheme",
      paymentMethod: {
        type: "scheme",
        name: "Credit Card",
        brands: ["visa"],
      },
      result: adyenResult,
    },
  });

  // AFTER:
  await expect(element.tokenize()).resolves.toEqual({
    adyenEmbedded: {
      result: adyenResult,
    },
  });
  ```

  Also update the test setup to use `Dropin` instead of `Card`:

  ```typescript
  // BEFORE:
  const { Component: Card } = createAdyenComponentMock({ result: adyenResult });
  const restoreClient = overrideClientState(
    createAdyenEmbeddedApiState(),
    undefined,
    {
      adyenEmbedded: {
        Card,
        paymentMethodsResponse: {
          paymentMethods: [
            { type: "scheme", name: "Credit Card", brands: ["visa"] },
          ],
        },
      },
    },
  );

  // AFTER:
  const { Component: Dropin } = createAdyenComponentMock({ result: adyenResult });
  const restoreClient = overrideClientState(
    createAdyenEmbeddedApiState(),
    undefined,
    {
      adyenEmbedded: {
        Dropin,
      },
    },
  );
  ```

- [ ] **Step 7: Update "does not render button click hints for Adyen Embedded mapped APMs"**

  The test currently uses an `ideal` payment method (which was previously "button only"). With Drop-in there are no button-only methods — the single "Adyen" entry always shows embedded content.

  Find at line ~1976 and replace:

  ```typescript
  it("does not render button click hints for the Adyen Drop-in entry", async () => {
    const { Component: Dropin } = createAdyenComponentMock();
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: {
          Dropin,
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "Adyen");

      expect(
        element.shadowRoot?.querySelector(
          '[data-payment-option-click-hint="true"]',
        ),
      ).toBeNull();
      expect(element.shadowRoot?.textContent).toContain(
        "Enter your payment details below and click the Submit button below the order summary to submit your order.",
      );
    } finally {
      element.remove();
      restoreClient();
    }
  });
  ```

- [ ] **Step 8: Run the tests**

  Run: `npx vitest run --project=unit --reporter=verbose src/elements/foxy-payment-method-selector/element.test.ts`

  Expected: all Adyen-related tests pass; no failures.

- [ ] **Step 9: Run TypeScript check one final time**

  Run: `npx tsc -b`

  Expected: zero errors.

- [ ] **Step 10: Commit**

  ```bash
  git add src/elements/foxy-payment-method-selector/element.test.ts
  git commit -m "test(adyen): update tests for Drop-in single-entry architecture"
  ```
