# Klarna Widget Mount Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconnect the Klarna payment widget so selecting a Klarna option
actually mounts Klarna's `Payments.load()` widget, surfaces an "unavailable"
state when Klarna declines the category, and blocks tokenization in that
case — without touching the already-correct authorize/finalize logic in
`element.tsx`.

**Architecture:** Resurrect a narrow version of the deleted
`embeds/klarna.tsx` (widget mount + status display only, no duplicate
tokenize controller), wire it into `view.tsx`'s `PaymentOptionBody` exactly
like the existing Adyen/Square branches, and add a synchronous availability
gate to `element.tsx`'s `#tokenizeKlarna` fed by a new callback prop.

**Tech Stack:** React (old Tailwind/shadcn conventions — this branch is off
`release/2.0.0`, predating the Base UI/styled-components migration),
`@foxy.io/sdk/checkout/client`, Vitest (`unit` project, Chromium browser
mode).

## Global Constraints

- Branch: `fix/klarna-widget-mount`, based on `release/2.0.0` at `fa7ae268`.
  Do not use any Base UI / styled-components APIs — follow this file's
  existing Tailwind/shadcn conventions exactly, matching the sibling
  `AdyenEmbeddedOption`/`SquareWebPaymentsOption` embeds already in this
  directory.
- Do not modify `#tokenizeKlarna`'s authorize/finalize logic, the
  option-flattening logic (`#resolveKlarnaCategories`/`#createKlarnaOptions`),
  `getPaymentOptionDescriptionText`'s Klarna branch, the message catalog, or
  `mountedOptionIds` in `view.tsx` — all already correct.
- Do not resurrect the deleted component's second `useEffect` (the
  `PaymentController`/`onControllerReady` registration that duplicated
  authorize/finalize) — that responsibility now lives solely in
  `#tokenizeKlarna`, and `#optionRequiresController` deliberately no longer
  routes Klarna through the controller path.
- Do not add gating on the widget's `"error"` status (SDK missing / load()
  itself throwing) — only on `"unavailable"` (`show_form: false`). No test
  requires the former; adding it would be speculative.
- Access `checkoutClient` via the direct module-level import
  (`import { client as checkoutClient } from "@foxy.io/sdk/checkout/client"`)
  cast through a local structural type, exactly like every sibling embed in
  this directory (`adyen-embedded.tsx`, `square-web-payments.tsx`) — not via
  a prop.
- Baseline test state on this branch (confirmed by an actual run, not
  assumed): `npx vitest run --project unit
  src/elements/foxy-payment-method-selector/element.test.ts` →
  **66 passed / 5 failed (71 total)**. Three of the five are this plan's
  target (`flattens Klarna categories into separate selector entries with
  API logos`, `authorizes the selected Klarna category during tokenization`,
  `shows an unavailable Klarna state when load pre-assessment fails`). The
  other two (`renders Mollie as a branded button-driven option`, `returns
  paypal-platform metadata for selected PayPal option flows`) are unrelated
  pre-existing test-setup bugs (stale i18n copy and an incomplete SDK mock,
  respectively) that also predate this fix — **out of scope**, must still be
  failing identically after this plan's tasks, not fixed and not newly
  broken.
- Target end state: **69 passed / 2 failed (71 total)** — the same two
  unrelated failures, nothing else different.

---

### Task 1: Resurrect the Klarna widget-mount embed and wire it into view.tsx

**Files:**
- Create: `src/elements/foxy-payment-method-selector/embeds/klarna.tsx`
- Modify: `src/elements/foxy-payment-method-selector/view.tsx`

**Interfaces:**
- Consumes: `PaymentMethodSelectorOption` and its `klarna?:
  PaymentMethodSelectorKlarnaConfig` field (`category: { identifier: string;
  name: string; asset_urls: {...} }`, `sessionId: string`) from
  `./types.ts` (already defined, unchanged).
- Produces: a default-exported `KlarnaOptionEmbed` React component with
  props `{ option, disabled?, onAvailabilityChange?: (category: string,
  available: boolean) => void, loadingMessage: string, unavailableMessage:
  string, loadErrorMessage: string }`. Task 2 consumes
  `onAvailabilityChange`'s calls by wiring `element.tsx`'s
  `#setKlarnaAvailability` to the prop `view.tsx` threads down as
  `onKlarnaAvailabilityChange`.

- [ ] **Step 1: Create the embed component**

Create `src/elements/foxy-payment-method-selector/embeds/klarna.tsx`:

```tsx
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import type { KlarnaSdkInstance } from "@foxy.io/sdk/checkout";
import type { PaymentMethodSelectorOption } from "../types";

import { useEffect, useRef, useState } from "react";

type KlarnaOptionEmbedProps = {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onAvailabilityChange?: (category: string, available: boolean) => void;
  loadingMessage: string;
  unavailableMessage: string;
  loadErrorMessage: string;
};

type KlarnaStatus = "loading" | "ready" | "unavailable" | "error";

type KlarnaPaymentsError = {
  invalid_fields?: string[];
  [key: string]: unknown;
};

type KlarnaPaymentsLoadResult = {
  show_form: boolean;
  error?: KlarnaPaymentsError;
};

type CheckoutClientLike = {
  klarna?: KlarnaSdkInstance | null;
};

function loadKlarnaWidget(
  klarna: KlarnaSdkInstance,
  container: HTMLElement,
  paymentMethodCategory: string,
): Promise<KlarnaPaymentsLoadResult> {
  return new Promise((resolve) => {
    klarna.Payments.load(
      {
        container,
        payment_method_category: paymentMethodCategory,
      },
      {},
      resolve,
    );
  });
}

export default function KlarnaOptionEmbed({
  option,
  disabled,
  onAvailabilityChange,
  loadingMessage,
  unavailableMessage,
  loadErrorMessage,
}: KlarnaOptionEmbedProps) {
  const [status, setStatus] = useState<KlarnaStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const klarnaOption = option.klarna;
    const container = containerRef.current;

    if (!klarnaOption || !container) {
      return;
    }

    const klarna = (checkoutClient as CheckoutClientLike).klarna;
    const category = klarnaOption.category.identifier;

    container.innerHTML = "";
    setStatus("loading");
    setError(null);

    if (!klarna?.Payments) {
      setStatus("error");
      setError(loadErrorMessage);
      return;
    }

    let cancelled = false;

    loadKlarnaWidget(klarna, container, category)
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result.show_form) {
          setStatus("ready");
          setError(null);
          onAvailabilityChange?.(category, true);
          return;
        }

        setStatus("unavailable");
        setError(unavailableMessage);
        onAvailabilityChange?.(category, false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setError(loadErrorMessage);
      });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [
    loadErrorMessage,
    onAvailabilityChange,
    option.id,
    option.klarna?.category.identifier,
    unavailableMessage,
  ]);

  if (!option.klarna) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        data-klarna-widget="true"
        data-klarna-widget-status={status}
        aria-disabled={disabled ? "true" : undefined}
        className="border rounded bg-white w-full p-2"
      />
      {status === "loading" ? (
        <p className="m-0 text-sm text-muted-foreground">{loadingMessage}</p>
      ) : null}
      {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
```

This is adapted from the pre-deletion version at commit `a46f6b76` (the
`Payments.load()` mount effect, container ref, and status rendering are
kept near-verbatim), with the second `useEffect` (duplicate
`PaymentController`/authorize/finalize registration) removed, and a new
`onAvailabilityChange` call added to the load-result handler.

- [ ] **Step 2: Typecheck the new file in isolation**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors mentioning `embeds/klarna.tsx` (the file isn't imported
by anything yet, so this only checks the file parses and its own types are
internally consistent).

- [ ] **Step 3: Add the lazy import and wire the PaymentOptionBody branch**

In `src/elements/foxy-payment-method-selector/view.tsx`, add the lazy import
near the other embed imports (after line 66, next to
`PurchaseOrderOptionEmbed`):

```ts
const PurchaseOrderOptionEmbed = lazy(() => import("./embeds/purchase-order"));
const KlarnaOptionEmbed = lazy(() => import("./embeds/klarna"));
```

Add `onKlarnaAvailabilityChange` to the `PaymentProps` type (after
`onControllerReady`, around line 90):

```ts
  onControllerReady?: (
    optionId: string,
    controller: PaymentController | null,
  ) => void;
  onKlarnaAvailabilityChange?: (category: string, available: boolean) => void;
```

Add the same prop to `PaymentOptionBody`'s parameter destructure and its
inline type (around lines 512-546, alongside `onControllerReady`):

```ts
function PaymentOptionBody({
  option,
  lang,
  disabled,
  styleAttributes,
  onControllerReady,
  onKlarnaAvailabilityChange,
  renderStripeContent,
  renderAdyenContent,
  billingAddress,
  billingError,
  onBillingAddressChange,
}: {
  option: PaymentMethodSelectorOption;
  lang?: string;
  disabled?: boolean;
  styleAttributes: HostedFieldStyleAttributes;
  onControllerReady?: (controller: PaymentController | null) => void;
  onKlarnaAvailabilityChange?: (category: string, available: boolean) => void;
  renderStripeContent?: (params: {
    option: PaymentMethodSelectorOption;
    disabled?: boolean;
    onControllerReady?: (controller: PaymentController | null) => void;
  }) => ReactNode;
  renderAdyenContent?: (params: {
    option: PaymentMethodSelectorOption;
    disabled?: boolean;
    onControllerReady?: (controller: PaymentController | null) => void;
  }) => ReactNode;
  billingAddress?: PaymentMethodSelectorBillingAddress;
  billingError?: PaymentMethodSelectorBillingError;
  onBillingAddressChange?: (params: {
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  }) => void;
}) {
```

Add the `option.klarna` branch to `PaymentOptionBody`'s body. Insert it
right before the final `return billingSection;` (after the Square-wallet
branch that ends around line 750), matching the Adyen branch's shape
exactly:

```tsx
  if (option.klarna) {
    return (
      <>
        <Suspense fallback={bodyFallback}>
          <KlarnaOptionEmbed
            option={option}
            disabled={disabled}
            onAvailabilityChange={onKlarnaAvailabilityChange}
            loadingMessage={intl.formatMessage(messages.klarnaLoading)}
            unavailableMessage={intl.formatMessage(messages.klarnaUnavailable)}
            loadErrorMessage={intl.formatMessage(messages.klarnaLoadError)}
          />
        </Suspense>
        {billingSection}
      </>
    );
  }

  return billingSection;
```

Add `option.klarna` explicitly to `hasPaymentOptionBodyContent` (around
line 780-810), alongside the existing `adyenEmbedded`/`squareUp` check —
today Klarna only gets body content indirectly via the billing-address
fallback, which would incorrectly skip the widget when no billing address
is configured:

```ts
  const isSquareFormBased = option.type === "new-card";
  if (option.klarna || option.adyenEmbedded || (option.squareUp && isSquareFormBased)) {
    return true;
  }
```

(This replaces the existing `if (option.adyenEmbedded || (option.squareUp
&& isSquareFormBased)) {` line in that function — add `option.klarna ||` to
its condition rather than duplicating the check.)

Add `onKlarnaAvailabilityChange` to the `Payment` component's destructured
props (around line 814-829, alongside `onControllerReady`):

```ts
export function Payment({
  options,
  selectedOptionId,
  lang,
  disabled,
  loading,
  onSelectionChange,
  onControllerReady,
  onKlarnaAvailabilityChange,
  renderStripeContent,
  renderAdyenContent,
  billingAddress,
  billingError,
  orderTotal,
  orderCurrencyCode,
  onBillingAddressChange,
}: PaymentProps) {
```

Pass it through at the `<PaymentOptionBody>` call site (around line
1232-1245, alongside `onControllerReady`):

```tsx
                        <PaymentOptionBody
                          option={option}
                          lang={lang}
                          disabled={optionDisabled}
                          styleAttributes={styleAttributes}
                          onControllerReady={(controller) =>
                            onControllerReady?.(option.id, controller)
                          }
                          onKlarnaAvailabilityChange={onKlarnaAvailabilityChange}
                          renderStripeContent={renderStripeContent}
                          renderAdyenContent={renderAdyenContent}
                          billingAddress={billingAddress}
                          billingError={checked ? billingError : undefined}
                          onBillingAddressChange={onBillingAddressChange}
```

- [ ] **Step 4: Typecheck the whole app**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 5: Run the three target tests to confirm partial progress**

Run: `npx vitest run --project unit src/elements/foxy-payment-method-selector/element.test.ts -t "Klarna"`

Expected: `flattens Klarna categories into separate selector entries with API
logos` and `authorizes the selected Klarna category during tokenization`
now PASS (the widget mounts, `Payments.load()` is called with the right
category, and `#tokenizeKlarna`'s existing authorize/finalize logic
succeeds once the widget is present). `shows an unavailable Klarna state
when load pre-assessment fails` is still expected to FAIL at this point —
without Task 2's gate, `#tokenizeKlarna` calls `authorize()` on the test's
bare `vi.fn()` mock, which never resolves, so the test times out rather
than seeing the rejection it expects. This is expected and is fixed by
Task 2, not a sign anything in this task is wrong.

- [ ] **Step 6: Commit**

```bash
git add src/elements/foxy-payment-method-selector/embeds/klarna.tsx src/elements/foxy-payment-method-selector/view.tsx
git commit -m "feat(payment-method-selector): mount Klarna widget via Payments.load()"
```

---

### Task 2: Gate tokenization on load-time availability

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/element.tsx`

**Interfaces:**
- Consumes: `onKlarnaAvailabilityChange` prop on the `Payment` component
  (produced by Task 1), called as `(category: string, available: boolean) =>
  void` whenever the embed's `Payments.load()` call resolves.
- Produces: `#tokenizeKlarna` now throws `"This Klarna option is currently
  unavailable."` synchronously, before calling `authorize()`, whenever the
  currently-selected category was last reported unavailable.

- [ ] **Step 1: Add the availability map field**

In `src/elements/foxy-payment-method-selector/element.tsx`, add a new
private field next to `#controllers` (line 130):

```ts
  #controllers = new Map<string, PaymentController>();
  #klarnaAvailabilityByCategory = new Map<string, boolean>();
```

- [ ] **Step 2: Add the setter method**

Add a new private method near `#tokenizeKlarna` (directly above it, so it
reads top-to-bottom as "record availability" then "consume it"):

```ts
  #setKlarnaAvailability(category: string, available: boolean): void {
    this.#klarnaAvailabilityByCategory.set(category, available);
  }

  async #tokenizeKlarna(option: PaymentMethodSelectorOption): Promise<{
```

- [ ] **Step 3: Add the gate check in `#tokenizeKlarna`**

Immediately after `const category = klarnaOption.category.identifier;`
(line 444) and before the `const authorization = await new Promise(...)`
call, add:

```ts
    const category = klarnaOption.category.identifier;

    if (this.#klarnaAvailabilityByCategory.get(category) === false) {
      throw new Error("This Klarna option is currently unavailable.");
    }

    const authorization = await new Promise<{
```

An unset map entry (widget hasn't reported yet) or a value of `true` falls
through unchanged to the existing authorize/finalize flow.

- [ ] **Step 4: Wire the prop into the `<Payment>` render call**

In the `#render()` method's JSX (around line 772-899), add the prop
alongside `onControllerReady`:

```tsx
          onControllerReady={(optionId, controller) => {
            if (controller) {
              this.#controllers.set(optionId, controller);
              return;
            }

            this.#controllers.delete(optionId);
          }}
          onKlarnaAvailabilityChange={(category, available) => {
            this.#setKlarnaAvailability(category, available);
          }}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 6: Run the three target tests — expect all passing**

Run: `npx vitest run --project unit src/elements/foxy-payment-method-selector/element.test.ts -t "Klarna"`
Expected: 3 passed, 0 failed.

- [ ] **Step 7: Run the full file to confirm no regressions**

Run: `npx vitest run --project unit src/elements/foxy-payment-method-selector/element.test.ts`
Expected: **69 passed / 2 failed (71 total)**. The 2 remaining failures must
be exactly `renders Mollie as a branded button-driven option` and `returns
paypal-platform metadata for selected PayPal option flows` (the unrelated
pre-existing bugs called out in Global Constraints) — unchanged from
baseline, not newly broken, not fixed (out of scope for this plan).

- [ ] **Step 8: Commit**

```bash
git add src/elements/foxy-payment-method-selector/element.tsx
git commit -m "fix(payment-method-selector): block Klarna tokenization when load reports unavailable"
```

---

## After Implementation

Once both tasks are complete and reviewed, this plan's fix is done. The two
unrelated pre-existing test failures (Mollie stale copy, PayPal-platform
incomplete mock) remain — they are the same bugs already diagnosed and
fixed on `experiment/base-ui-design-system`'s
`.superpowers/sdd/fix-payment-method-selector-test-bugs-report.md`, and can
be ported to this branch separately if desired, but are out of scope here.

When real Klarna sandbox credentials are available, do a live browser-based
verification pass (select each Klarna category in a running checkout,
confirm the widget renders and completes authorization) as an additional
confidence check — not a blocker, since the three mocked tests already
exercise the full `load()` → mount → authorize → finalize → gate flow.
