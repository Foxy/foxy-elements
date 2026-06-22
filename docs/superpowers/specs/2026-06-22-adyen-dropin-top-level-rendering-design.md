# Adyen Drop-in Top-Level Rendering Design

**Date:** 2026-06-22
**Status:** Approved

## Problem

After the Drop-in integration, the single "Adyen" entry renders as a `RadioGroup` item alongside native payment method options. This is wrong for two reasons:

1. The Drop-in already owns payment method selection internally — nesting it as one radio item among others creates a confusing double-selection UX.
2. The Drop-in must be always visible (not collapsed behind a radio button click) so users see the available Adyen payment methods immediately.

## Goal

Render the Adyen Drop-in below the native selector options as a persistent, always-visible section. Native options and the Drop-in are mutually exclusive: selecting a native option deactivates the Drop-in, and interacting with the Drop-in deselects any native option.

## Decisions

- **Always visible:** The Drop-in renders unconditionally whenever an Adyen option exists in `visibleOptions`. It is never collapsed or hidden.
- **Mutual exclusion via `selection` state:** The `selection` string in `view.tsx` holds a native option id when native is active, or the Adyen option's id when Adyen is active. The `RadioGroup` only maps native option ids, so setting `selection = adyenOption.id` naturally deselects all native radios without additional state.
- **No changes to `element.tsx`:** The Adyen option remains in `visibleOptions` and the full options array. All `optionIndex`, controller wiring, and `tokenize()` routing are unchanged.
- **`onSelect` prop added to `AdyenEmbeddedOption`:** Fires when the Drop-in's internal `onSelect` callback fires (user picks a method within the Drop-in). This is the only mechanism that signals "Adyen is now active" to `view.tsx`.

## Architecture

### Split at render time (`view.tsx`)

After computing `visibleOptions`, split into two arrays:

```ts
const nativeOptions = visibleOptions.filter(o => !o.adyenEmbedded);
const adyenOption   = visibleOptions.find(o => o.adyenEmbedded) ?? null;
```

The `RadioGroup` receives `nativeOptions` only. Below it, the Adyen Drop-in renders unconditionally:

```tsx
<FieldSet>
  <RadioGroup value={selection} onValueChange={handleNativeSelect}>
    {nativeOptions.map(option => <Card key={option.id} ...>...</Card>)}
  </RadioGroup>

  {adyenOption && (
    <Suspense fallback={<SkeletonList />}>
      <AdyenEmbeddedOption
        option={adyenOption}
        onSelect={handleAdyenSelect}
        onControllerReady={onControllerReady}
        ...sharedProps
      />
    </Suspense>
  )}
</FieldSet>
```

### Selection coordination

**Native selected:**
```ts
const handleNativeSelect = (id: string) => {
  setSelection(id);
  pendingSelectionChangeRef.current = id;
};
```
`RadioGroup`'s `onValueChange` fires with the native option id. `selection` becomes that id; no native radio matches the adyen id so no explicit adyen deactivation is needed.

**Adyen selected (Drop-in internal `onSelect`):**
```ts
const handleAdyenSelect = () => {
  setSelection(adyenOption!.id);
  pendingSelectionChangeRef.current = adyenOption!.id;
};
```
`selection` becomes the Adyen option's id. The `RadioGroup`'s `value` no longer matches any native option → all native radios visually deselect.

The existing `useEffect` that watches `selection` and calls `onSelectionChange(selectedId)` fires in both cases, notifying `element.tsx` to update `optionIndex` — unchanged code path.

### `hasSingleOption` update

```ts
// Before
const hasSingleOption = visibleOptions.length === 1;

// After
const hasSingleOption = nativeOptions.length === 1 && !adyenOption;
```

Radio buttons are hidden only when there is truly a single choice with no alternative. If there is one native option AND an Adyen Drop-in, the user can choose between them so radio buttons remain visible.

### Remove Adyen from Card overflow class

The `overflow-visible` class on the native option `Card` was conditioned on `checked && option.adyenEmbedded` (to let the Drop-in overflow the card boundary). Since Adyen is no longer a Card item, this condition is dropped.

### `onSelect` prop in `AdyenEmbeddedOption` (`embeds/adyen-embedded.tsx`)

Add `onSelect?: () => void` to `AdyenEmbeddedOptionProps`. Wire it to the Drop-in constructor:

```ts
const component = new Component(checkout, {
  showRadioButton: true,
  disableFinalAnimation: true,
  readOnly: Boolean(disabled),
  onSelect: () => { props.onSelect?.(); },
  onPaymentCompleted: ...,
  onPaymentFailed: ...,
  onError: ...,
});
```

No other changes to `adyen-embedded.tsx`.

## Data Flow

```
User clicks native radio
  → RadioGroup onValueChange(nativeId)
  → setSelection(nativeId)
  → useEffect fires → onSelectionChange(nativeId)
  → element.tsx sets optionIndex to native option index
  → Drop-in stays mounted, native radio shows as checked

User interacts with Drop-in (selects payment method)
  → Drop-in internal onSelect fires
  → AdyenEmbeddedOption calls props.onSelect()
  → view.tsx setSelection(adyenOption.id)
  → RadioGroup value = adyenOption.id → no native radio matches → all deselect
  → useEffect fires → onSelectionChange(adyenOption.id)
  → element.tsx sets optionIndex to adyen option index
  → tokenize() routes to Adyen controller
```

## Default Selection

On mount, the existing `selection` sync effect resolves `selectedOptionId`:
- If `selectedOptionId` is a native option id → native radio is checked, Adyen is not active.
- If `selectedOptionId` is the Adyen option's id → no native radio is checked, Drop-in is active.
- If `selectedOptionId` is empty and `nativeOptions` is non-empty → falls back to first non-disabled native option.
- If `selectedOptionId` is empty and `nativeOptions` is empty → `selection = ""`, no radio checked, Drop-in renders (user must interact with it to activate).

## Error Handling

No new error paths. Adyen `onError`/`onPaymentFailed`/`onPaymentCompleted` are unchanged inside `AdyenEmbeddedOption`. Native option error handling is unchanged.

## CSS

No new rules. The Drop-in no longer needs `overflow-visible` on a Card wrapper. The `.foxy-adyen-embedded` container already provides the Drop-in's styling context via `--adyen-sdk-*` CSS variables.

## Testing

**Changed assertions:**
- Render test: the Adyen Drop-in must NOT appear inside a `RadioGroup` item; it must render as a sibling element after all native `RadioGroup` items.
- `hasSingleOption` test: with 1 native + 1 adyen option, radio buttons must be visible (not hidden).

**New assertions:**
- Selecting a native radio does not unmount the Drop-in.
- Drop-in's `onSelect` firing sets `selection` to the Adyen option's id and `onSelectionChange` is called with the Adyen option's id.
- When `onSelectionChange` is called with the Adyen option's id, no native radio item has `data-state="checked"`.

## Files Changed

| File | Change |
|------|--------|
| `src/elements/foxy-payment-method-selector/view.tsx` | Split `visibleOptions` → `nativeOptions` + `adyenOption`; update `hasSingleOption`; render Drop-in outside `RadioGroup`; add `handleAdyenSelect`; remove `overflow-visible` Adyen guard |
| `src/elements/foxy-payment-method-selector/embeds/adyen-embedded.tsx` | Add `onSelect?: () => void` prop; wire to Drop-in `onSelect` callback |
| `src/elements/foxy-payment-method-selector/element.test.ts` | Update render-position assertions; add mutual-exclusion tests |
