# Klarna Widget Mount Fix — Design

## Background

`foxy-payment-method-selector` flattens each Klarna payment method category
(e.g. "Pay in 4", "Pay in 30 Days") into a separate selectable option. Each
option correctly renders a label, description, and logo, and
`element.tsx`'s `#tokenizeKlarna` method already implements the full
authorize → finalize tokenization flow. However, no code ever calls Klarna's
`Payments.load()` to actually mount the interactive widget, so a customer who
selects a Klarna option sees no widget and no way to complete authorization
through it.

This gap predates and is independent of the Base UI / styled-components
migration happening on `experiment/base-ui-design-system`. It exists on
`release/2.0.0` itself.

### Root cause

Commit `26985cc5` ("wip: add payment button element for ach, standard card
gateways, sagepay and klarna") did two things at once:

1. Added `#tokenizeKlarna` directly to `element.tsx`, called from
   `tokenize()` ahead of the general controller-based path, and removed
   `option.klarna` from `#optionRequiresController`.
2. Deleted `src/elements/foxy-payment-method-selector/embeds/klarna.tsx`,
   which previously mounted the widget via `Payments.load()` and registered
   its own `PaymentController` (a full duplicate of authorize/finalize logic
   now more sensibly centralized in `#tokenizeKlarna`).

This was a deliberate architecture shift, not an accidental regression — but
the widget-mount half of the old component was never reconnected. Three
tests in `element.test.ts` (`flattens Klarna categories...`, `authorizes the
selected Klarna category...`, `shows an unavailable Klarna state...`) already
encode the expected behavior and currently fail against this gap.

## Scope

This fix is bounded to:
- Resurrecting a narrow version of `embeds/klarna.tsx` (widget mount +
  status display only — no duplicate tokenize controller).
- Wiring it into `view.tsx`'s `PaymentOptionBody` and
  `hasPaymentOptionBodyContent`, following the exact pattern already used by
  the Adyen and Square embeds.
- Adding a synchronous availability gate to `element.tsx`'s
  `#tokenizeKlarna` so a widget that reported itself unavailable at load
  time blocks tokenization immediately, without calling `authorize()`.

Nothing else changes. `#tokenizeKlarna`'s authorize/finalize logic, the
option-flattening logic (`#resolveKlarnaCategories`/`#createKlarnaOptions`),
the description text logic, and the message catalog are already correct and
untouched.

## Architecture

### 1. `embeds/klarna.tsx` (new file, adapted from the pre-deletion version)

A React component following the same shape as `AdyenEmbeddedOption` /
`SquareWebPaymentsOption`:

```ts
type KlarnaOptionEmbedProps = {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onAvailabilityChange?: (category: string, available: boolean) => void;
  loadingMessage: string;
  unavailableMessage: string;
  loadErrorMessage: string;
};
```

On mount (and whenever `option.klarna?.category.identifier` changes), it
calls `checkoutClient.klarna.Payments.load({ container, payment_method_category },
{}, callback)` against the same module-level `checkoutClient` singleton
every sibling embed already imports directly (`import { client as
checkoutClient } from "@foxy.io/sdk/checkout/client"` — confirmed this is
also how `element.tsx` and `adyen-embedded.tsx` access it, not via a prop).

Status transitions (`"loading" | "ready" | "unavailable" | "error"`) drive:
- The rendered container (`data-klarna-widget`, `data-klarna-widget-status`).
- Loading text and error text, matching the historical component's markup
  (`border rounded bg-white w-full p-2` container, `text-muted-foreground`
  loading line, `text-destructive` error line — old Tailwind conventions,
  matching this branch's pre-migration styling).
- A call to `onAvailabilityChange(category, show_form)` whenever `load()`
  resolves — this is the one new piece of behavior not present in the
  original component.

Removed relative to the original: the second `useEffect` that registered a
`PaymentController` via `onControllerReady` and independently re-implemented
authorize/finalize. That responsibility now lives solely in
`#tokenizeKlarna`; duplicating it would be dead code, since
`#optionRequiresController` no longer routes Klarna options through the
controller-based `tokenize()` path at all.

### 2. `view.tsx` wiring

Add an `option.klarna` branch to `PaymentOptionBody`, matching the existing
Adyen/Square branches exactly in shape:

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
```

`onKlarnaAvailabilityChange` is threaded through `PaymentProps` → `Payment`
→ `PaymentOptionBody` the same way `onControllerReady` already is, ultimately
calling back into `element.tsx`.

Add `option.klarna` explicitly to `hasPaymentOptionBodyContent`'s existing
condition (alongside `option.adyenEmbedded` / `option.squareUp`). Today
Klarna only gets body content indirectly, via the billing-address fallback
(`hasBillingAddressContent`) — which would incorrectly skip rendering the
widget if no billing address is configured. The widget must render
regardless of billing address presence.

No changes needed to `mountedOptionIds` in `view.tsx`: it already mounts
only the initially-selected option and adds an option to the mounted set the
first time it becomes selected, which is exactly the semantics the tests
require (one `load()` call on initial render, a second only after switching
to a different Klarna category).

### 3. `element.tsx` availability gate

A new private field:

```ts
#klarnaAvailabilityByCategory = new Map<string, boolean>();
```

A method (bound, passed down as `onKlarnaAvailabilityChange`):

```ts
#setKlarnaAvailability(category: string, available: boolean): void {
  this.#klarnaAvailabilityByCategory.set(category, available);
}
```

In `#tokenizeKlarna`, immediately after resolving `category`, before calling
`authorize()`:

```ts
if (this.#klarnaAvailabilityByCategory.get(category) === false) {
  throw new Error("This Klarna option is currently unavailable.");
}
```

An unset map entry (widget hasn't reported yet) or `true` falls through to
existing behavior unchanged.

## Error handling

No new error paths beyond the pre-check above. `#tokenizeKlarna`'s existing
error messages (`"Unable to load Klarna..."`, `"...couldn't authorize..."`,
`"...couldn't finalize..."`, `"...missing an authorization token."`) are
untouched. The embed's own `"error"` status (load() itself throwing, e.g.
SDK unavailable) is displayed in the widget but does not feed the
availability gate — it's a distinct condition from "Klarna assessed this
category and declined it," and no test requires gating on it. Adding that
gate now would be speculative; it can be added later if a real scenario
demands it.

## Testing

The three existing tests in `element.test.ts` are the definition of done:
- `flattens Klarna categories into separate selector entries with API logos`
- `authorizes the selected Klarna category during tokenization`
- `shows an unavailable Klarna state when load pre-assessment fails`

No new tests are planned beyond what's needed to make these pass, per
existing test hygiene in this file (mocking `checkoutClient.klarna.Payments`
via the existing `overrideClientState`/`createKlarnaApiState` helpers).

Once real Klarna sandbox credentials are available, a live browser-based
verification pass will be done as an additional confidence check, but the
fix's correctness is not blocked on it — the mocked tests fully exercise the
`load()` → mount → authorize → finalize → gate flow.

## Out of scope

- Any change to the Base UI / styled-components migration branch — this fix
  targets `release/2.0.0`'s existing Tailwind/shadcn conventions only.
- Any change to `#tokenizeKlarna`'s authorize/finalize logic, the
  option-flattening logic, or the message catalog.
- Gating tokenize on the widget's `"error"` status (see Error handling).
- Any backend/API-side change — this is entirely a frontend wiring gap.
