# Adyen Drop-in Top-Level Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the Adyen Drop-in below native selector options as a persistent, always-visible section that is mutually exclusive with native radio selection.

**Architecture:** Split `visibleOptions` into `nativeOptions` and `adyenOption` at render time in `view.tsx`. The `RadioGroup` maps only `nativeOptions`. The Adyen Drop-in renders unconditionally below the RadioGroup with its own label. Mutual exclusion is driven by the shared `selection` state: native ids are RadioGroup items, the Adyen option's id is not—so setting `selection = adyenOption.id` naturally deselects all native radios. A new `onSelect` prop on `AdyenEmbeddedOption` notifies `view.tsx` when the Drop-in's internal method selection fires.

**Tech Stack:** React 19, TypeScript, Vitest, shadcn/ui RadioGroup, Adyen Web SDK v6.36.0

## Global Constraints

- Only 3 files change: `src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx`, `src/elements/foxy-payment-method-selector/view.tsx`, `src/elements/foxy-payment-method-selector/element.test.ts`
- No changes to `element.tsx`, `types.ts`, `constants.ts`, or any other file
- The Adyen option stays in `visibleOptions` — the split into `nativeOptions` / `adyenOption` is render-time only in `view.tsx`
- `selection = adyenOption.id` means Adyen is active; `selection = nativeOptionId` means native is active
- `hasSingleOption` must become `nativeOptions.length === 1 && !adyenOption`
- The Drop-in renders unconditionally (not gated on `mountedOptionIds`) when `adyenOption !== null`
- TypeScript: compile with `npx tsc -b` (zero errors required)
- Tests: `npx vitest run --project=unit` — pre-existing 6 non-Adyen failures (Sezzle, Mollie, PayPal platform, Klarna) are expected; do not fix them

---

### Task 1: Add `onSelect` prop to `AdyenEmbeddedOption`

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx`
- Modify: `src/elements/foxy-payment-method-selector/element.test.ts` (fix stale assertion + add onSelect check)

**Interfaces:**
- Produces: `AdyenEmbeddedOptionProps.onSelect?: () => void` — optional callback fired when the Drop-in's internal `onSelect` fires (user picks a payment method within the Drop-in). Task 2 passes this prop.

- [ ] **Step 1: Fix stale test assertion and add failing onSelect check**

Open `src/elements/foxy-payment-method-selector/element.test.ts` and find the test "mounts Adyen Drop-in in light DOM and cleans it up on removal" (search for `"mounts Adyen Drop-in in light DOM"`). Its `expect(instances[0]?.props).toMatchObject(...)` assertion currently checks `showPayButton: false`, which is stale — `showPayButton` was moved from the Drop-in constructor to `checkout.update()`. Replace it with the correct constructor props AND add the new `onSelect` check:

```typescript
// Find this block (~line 1656):
expect(instances[0]?.props).toMatchObject({
  showPayButton: false,
});

// Replace with:
expect(instances[0]?.props).toMatchObject({
  showRadioButton: true,
  disableFinalAnimation: true,
  onSelect: expect.any(Function),
});
```

- [ ] **Step 2: Run the test to verify it fails on onSelect**

```bash
npx vitest run --project=unit --reporter=verbose -t "mounts Adyen Drop-in in light DOM"
```

Expected: FAIL — `expected undefined to be a Function` (the `onSelect` key is not yet in the Drop-in constructor props).

- [ ] **Step 3: Add `onSelect` prop to `AdyenEmbeddedOptionProps`**

In `src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx`, find `type AdyenEmbeddedOptionProps` and add the optional `onSelect` field after `submitErrorMessage?`:

```typescript
// Before:
type AdyenEmbeddedOptionProps = {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
  loadingMessage?: string;
  unavailableMessage?: string;
  loadErrorMessage?: string;
  submitErrorMessage?: string;
};

// After:
type AdyenEmbeddedOptionProps = {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
  loadingMessage?: string;
  unavailableMessage?: string;
  loadErrorMessage?: string;
  submitErrorMessage?: string;
  onSelect?: () => void;
};
```

- [ ] **Step 4: Destructure `onSelect` from props and wire it to the Drop-in constructor**

In the `AdyenEmbeddedOption` function signature (the `export default function AdyenEmbeddedOption({...})`), add `onSelect` to the destructured props:

```typescript
// Before:
export default function AdyenEmbeddedOption({
  option,
  disabled,
  onControllerReady,
  loadingMessage = "Loading payment details...",
  unavailableMessage = "This payment method is currently unavailable.",
  loadErrorMessage = "Unable to load this payment method. Choose a different payment method or try again.",
  submitErrorMessage = "Unable to submit this payment method. Try again.",
}: AdyenEmbeddedOptionProps) {

// After:
export default function AdyenEmbeddedOption({
  option,
  disabled,
  onControllerReady,
  loadingMessage = "Loading payment details...",
  unavailableMessage = "This payment method is currently unavailable.",
  loadErrorMessage = "Unable to load this payment method. Choose a different payment method or try again.",
  submitErrorMessage = "Unable to submit this payment method. Try again.",
  onSelect,
}: AdyenEmbeddedOptionProps) {
```

Then find the Drop-in constructor call inside the async IIFE (inside `useEffect`). It currently starts with:

```typescript
const component = new Component(checkout, {
  showRadioButton: true,
  disableFinalAnimation: true,
  readOnly: Boolean(disabled),
  onPaymentCompleted: (result: unknown) => {
```

Add `onSelect` before `onPaymentCompleted`:

```typescript
const component = new Component(checkout, {
  showRadioButton: true,
  disableFinalAnimation: true,
  readOnly: Boolean(disabled),
  onSelect: () => { onSelect?.(); },
  onPaymentCompleted: (result: unknown) => {
```

- [ ] **Step 5: Add `onSelect` to the `useEffect` dependency array**

The `useEffect` at the bottom of the file has a dependency array. Find it (it ends with `unavailableMessage,`). Add `onSelect` to the array:

```typescript
// Before:
  }, [
    disabled,
    loadErrorMessage,
    onControllerReady,
    option.adyenEmbedded,
    option.id,
    submitErrorMessage,
    unavailableMessage,
  ]);

// After:
  }, [
    disabled,
    loadErrorMessage,
    onControllerReady,
    onSelect,
    option.adyenEmbedded,
    option.id,
    submitErrorMessage,
    unavailableMessage,
  ]);
```

- [ ] **Step 6: Run the target test to verify it passes**

```bash
npx vitest run --project=unit --reporter=verbose -t "mounts Adyen Drop-in in light DOM"
```

Expected: PASS.

- [ ] **Step 7: Run all Adyen tests and verify no regressions**

```bash
npx vitest run --project=unit --reporter=verbose -t "Adyen"
```

Expected: all 5 Adyen tests pass. Confirm the stale `showPayButton` assertion is gone.

- [ ] **Step 8: TypeScript check**

```bash
npx tsc -b
```

Expected: zero errors.

- [ ] **Step 9: Commit**

```bash
git add src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx
git add src/elements/foxy-payment-method-selector/element.test.ts
git commit -m "feat(adyen): add onSelect prop to AdyenEmbeddedOption, fire on Drop-in internal selection"
```

---

### Task 2: Render Adyen Drop-in below RadioGroup in view.tsx

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/view.tsx`
- Modify: `src/elements/foxy-payment-method-selector/element.test.ts`

**Interfaces:**
- Consumes from Task 1: `AdyenEmbeddedOption` now accepts `onSelect?: () => void` prop.

- [ ] **Step 1: Write the failing render-position test**

In `src/elements/foxy-payment-method-selector/element.test.ts`, add the following test in the Adyen describe block (after the existing "renders a single Adyen Drop-in entry" test):

```typescript
it("renders Adyen Drop-in outside RadioGroup when it is the only option", async () => {
  const { Component: Dropin } = createAdyenComponentMock();
  const restoreClient = overrideClientState(
    createAdyenEmbeddedApiState(),
    undefined,
    { adyenEmbedded: { Dropin } },
  );
  const element = document.createElement(
    "foxy-payment-method-selector",
  ) as PaymentMethodSelectorElement;

  try {
    document.body.append(element);
    await waitForText(() => element.shadowRoot?.textContent, "Adyen");

    // No native radio button — Adyen is not a RadioGroup item
    expect(
      element.shadowRoot?.querySelector('input[type="radio"]'),
    ).toBeNull();
  } finally {
    element.remove();
    restoreClient();
  }
});
```

- [ ] **Step 2: Write the failing mutual-exclusion tests**

Add these two tests after the render-position test. They require a state with both a native gateway and the Adyen gateway. The `authorize` gateway type produces a native `new-card` option.

Also add `onSelect?: () => void` to the `AdyenComponentProps` type (near the top of the test file, find the type and add the field):

```typescript
// Find:
type AdyenComponentProps = Record<string, unknown> & {
  type?: string;
  onPaymentCompleted?: (result: unknown) => void;
  onPaymentFailed?: (result: unknown) => void;
};

// Replace with:
type AdyenComponentProps = Record<string, unknown> & {
  type?: string;
  onPaymentCompleted?: (result: unknown) => void;
  onPaymentFailed?: (result: unknown) => void;
  onSelect?: () => void;
};
```

Then add the tests:

```typescript
it("keeps Adyen Drop-in mounted when a native option is selected", async () => {
  const { Component: Dropin, instances } = createAdyenComponentMock({
    mountText: "Adyen drop-in",
  });
  const restoreClient = overrideClientState(
    {
      ...createAdyenEmbeddedApiState(),
      payment_gateways: [
        { type: "authorize" },
        {
          type: "adyen_embedded",
          session_data: "adyen-session-data",
          environment: "test",
          client_key: "adyen-client-key",
        },
      ],
    },
    undefined,
    { adyenEmbedded: { Dropin } },
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

    // Select native option by index (index 0 = authorize/new-card)
    element.optionIndex = 0;
    await waitForRender();

    // Drop-in stays mounted — unmount not called
    expect(instances[0]?.unmount).not.toHaveBeenCalled();
    expect(element.querySelector("[data-foxy-adyen-host]")).not.toBeNull();
  } finally {
    element.remove();
    restoreClient();
  }
});

it("clears native radio selection when Adyen Drop-in's onSelect fires", async () => {
  const { Component: Dropin, instances } = createAdyenComponentMock({
    mountText: "Adyen drop-in",
  });
  const restoreClient = overrideClientState(
    {
      ...createAdyenEmbeddedApiState(),
      payment_gateways: [
        { type: "authorize" },
        {
          type: "adyen_embedded",
          session_data: "adyen-session-data",
          environment: "test",
          client_key: "adyen-client-key",
        },
      ],
    },
    undefined,
    { adyenEmbedded: { Dropin } },
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
    await waitForRender();

    // Initially the native radio is checked
    expect(
      element.shadowRoot?.querySelector('button[data-state="checked"]'),
    ).not.toBeNull();

    // Simulate user selecting a method inside the Drop-in
    instances[0]?.props.onSelect?.();
    await waitForRender();

    // No native radio should remain checked
    expect(
      element.shadowRoot?.querySelector('button[data-state="checked"]'),
    ).toBeNull();
  } finally {
    element.remove();
    restoreClient();
  }
});
```

Also update the "does not render button click hints" test (search for `"does not render button click hints for the Adyen Drop-in entry"`). Replace the description-text assertion with a label check:

```typescript
// Find and remove this assertion inside that test:
expect(element.shadowRoot?.textContent).toContain(
  "Enter your payment details below and click the Submit button below the order summary to submit your order.",
);

// Replace with:
expect(element.shadowRoot?.textContent).toContain("Adyen");
```

- [ ] **Step 3: Run the new tests to verify they fail**

```bash
npx vitest run --project=unit --reporter=verbose -t "renders Adyen Drop-in outside RadioGroup|keeps Adyen Drop-in mounted|clears native radio"
```

Expected: all three FAIL with errors like "expected non-null" or "expected null".

- [ ] **Step 4: Split `visibleOptions` into `nativeOptions` and `adyenOption` in view.tsx**

In `src/elements/foxy-payment-method-selector/view.tsx`, find this line inside the `Payment` component body:

```typescript
const hasSingleOption = visibleOptions.length === 1;
```

Replace it with:

```typescript
const nativeOptions = useMemo(
  () => visibleOptions.filter((o) => !o.adyenEmbedded),
  [visibleOptions],
);
const adyenOption = useMemo(
  () => visibleOptions.find((o) => Boolean(o.adyenEmbedded)) ?? null,
  [visibleOptions],
);
const hasSingleOption = nativeOptions.length === 1 && !adyenOption;
```

- [ ] **Step 5: Change RadioGroup to iterate `nativeOptions`**

Find the `RadioGroup` JSX in the return block. It currently iterates:

```tsx
{visibleOptions.map((option) => {
```

Change it to:

```tsx
{nativeOptions.map((option) => {
```

- [ ] **Step 6: Remove the Adyen `overflow-visible` guard from the Card className**

Inside the `visibleOptions.map` loop (now `nativeOptions.map`), find the `Card` component's `className`:

```tsx
<Card
  key={option.id}
  className={cn(
    "gap-0 py-0 transition-colors rounded-[var(--radius)] border border-input ring-0",
    !checked && !optionDisabled && "cursor-pointer hover:bg-muted",
    // The Card's default overflow-hidden clips absolutely-positioned
    // Adyen dropdowns (e.g. bank-selection lists). Override it when
    // this option's Adyen form is expanded.
    checked && option.adyenEmbedded && "overflow-visible",
  )}
  data-disabled={optionDisabled}
>
```

Remove the `overflow-visible` guard (and the comment above it) entirely:

```tsx
<Card
  key={option.id}
  className={cn(
    "gap-0 py-0 transition-colors rounded-[var(--radius)] border border-input ring-0",
    !checked && !optionDisabled && "cursor-pointer hover:bg-muted",
  )}
  data-disabled={optionDisabled}
>
```

- [ ] **Step 7: Add the Adyen section below RadioGroup**

Find the closing `</RadioGroup>` tag, which is followed by `</FieldSet>`. Add the Adyen section between them:

```tsx
      </RadioGroup>

      {adyenOption !== null && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">
            {getBasePaymentOptionLabel(adyenOption, intl)}
          </span>
          <Suspense fallback={<Skeleton className="h-8 w-full" />}>
            <AdyenEmbeddedOption
              option={adyenOption}
              onSelect={() => {
                pendingSelectionChangeRef.current = adyenOption.id;
                setSelection(adyenOption.id);
              }}
              onControllerReady={(controller) =>
                onControllerReady?.(adyenOption.id, controller)
              }
              loadingMessage={intl.formatMessage(messages.adyenLoading)}
              unavailableMessage={intl.formatMessage(messages.adyenUnavailable)}
              loadErrorMessage={intl.formatMessage(messages.adyenLoadError)}
              submitErrorMessage={intl.formatMessage(messages.adyenSubmitError)}
            />
          </Suspense>
        </div>
      )}
    </FieldSet>
```

`AdyenEmbeddedOption` is already lazy-loaded at the top of `view.tsx` (`const AdyenEmbeddedOption = lazy(...)`). `Skeleton` is already imported. `getBasePaymentOptionLabel` is defined earlier in the file. No new imports needed.

- [ ] **Step 8: TypeScript check**

```bash
npx tsc -b
```

Expected: zero errors. If you see an error about `adyenOption` potentially being null inside the JSX callback, confirm the `adyenOption !== null` guard makes TypeScript happy (it should, since the guard narrows the type).

- [ ] **Step 9: Run all new tests and verify they pass**

```bash
npx vitest run --project=unit --reporter=verbose -t "renders Adyen Drop-in outside RadioGroup|keeps Adyen Drop-in mounted|clears native radio|does not render button click hints"
```

Expected: all four pass.

- [ ] **Step 10: Run the full Adyen test suite**

```bash
npx vitest run --project=unit --reporter=verbose -t "Adyen"
```

Expected: all Adyen tests pass (at least the original 5 plus the 3 new ones = 8 total). Zero Adyen failures.

- [ ] **Step 11: Run the full unit test suite and confirm pre-existing failure count**

```bash
npx vitest run --project=unit 2>&1 | tail -20
```

Expected: the same 6 pre-existing failures (Sezzle, Mollie, PayPal platform, Klarna). No new failures.

- [ ] **Step 12: Commit**

```bash
git add src/elements/foxy-payment-method-selector/view.tsx
git add src/elements/foxy-payment-method-selector/element.test.ts
git commit -m "feat(adyen): render Drop-in below native options, outside RadioGroup"
```
