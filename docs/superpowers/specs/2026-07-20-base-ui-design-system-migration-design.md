# foxy-elements: migrate to the Base UI + styled-components design system

Status: approved design, pending plan
Branch: `experiment/base-ui-design-system` (off `release/2.0.0` @ `fa7ae268`)
Related: foxy-design-system's `base-ui-styled-components-experiment` branch (prerequisite work lands there first)

## Goal

`foxy-design-system` finished its rewrite from a shadcn/Tailwind-based library to Base UI primitives wrapped in styled-components. `foxy-elements` still consumes the old shadcn-shaped API (`@foxy.io/design-system/ui/*` imports, Tailwind classes referencing shadcn CSS variables, a CSS-var-based theming layer). This spec migrates `foxy-elements` to the new API, removes Tailwind from the repo entirely, and replaces the CSS-var theming mechanism with one built around the new design system's styled-components theme tokens. This is experimental work, isolated to its own branch, ahead of the larger and separate `foxy-checkout` migration (not covered by this spec).

## Scope

**In scope:**
- `foxy-design-system` (prerequisite, three small fixes, see below).
- `foxy-elements`' `foxy-payment-method-selector` element: `element.tsx`, `view.tsx`, `billing.tsx`, `embeds/{ach-hosted,card-hosted,purchase-order}.tsx` — the only element that renders design-system UI components.
- `foxy-elements`' shared theming infrastructure: `src/lib/theme-mixin.ts`, `src/lib/theme-attribute-sync.ts` — used by all three elements.
- `foxy-ach-field` and `foxy-payment-card-field`: their `element.ts`, `docs.mdx`, and stories, **only** for the theme-attribute rename and metrics-derivation change (they still render plain hosted iframes, not design-system components).
- Removing Tailwind (`tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`) from `foxy-elements` entirely.

**Out of scope:**
- `foxy-checkout` — separate branch, separate spec, phase 2.
- Any change to the `embed.foxy.io` hosted-iframe app itself, or its query-param contract (`input_height`, `input_text_color`, etc.) — those names are hardcoded independently in `element.ts` and are unaffected by this migration either way.
- Visual redesign beyond what the new design system's tokens naturally produce — this is a mechanical port, not a restyling.

## Validated technical risks

Two risks were identified as potentially blocking and both were spiked and confirmed working before writing this spec:

1. **styled-components inside a shadow root.** `foxy-payment-method-selector` mounts a React root into `this.attachShadow({mode: "open"})`. styled-components injects `<style>` into `document.head` by default, which would not cross the shadow boundary. Confirmed via a live spike (styled-components 6.4.3, real shadow root) that wrapping the tree in `<StyleSheetManager target={shadowRoot}>` makes the injected `<style>` land inside the shadow root, and `<ThemeProvider theme={{tokens: defaultTheme}}>` resolves tokens correctly (`background.buttonPrimary` rendered as the exact expected `rgb(122, 46, 134)`).
2. **Base UI portal components (`Select`) inside a shadow root.** `Select` composes `Root/Trigger/Portal/Positioner/Popup/List/Item` manually in the new API, and `Portal` renders to `document.body` by default. Confirmed via a second spike that passing `container={shadowRoot}` to `Select.Portal` keeps the popped-out popup inside the shadow root, and that the popup's styled-components styles (a distinct border/background color) apply correctly there too.

Both spikes were throwaway (a static HTML file + a temporary local static-file server), nothing was committed, and no production code was touched to produce these results.

## Prerequisite work: foxy-design-system

On `base-ui-styled-components-experiment`, before foxy-elements can depend on it:

1. **Fix package identity.** `package.json` currently has scaffold leftovers from the Base UI rewrite: `name: "foxy-design-system"` (was `@foxy.io/design-system`), `description: "A starter for creating a TypeScript package."`, `author: "Author Name"`, a fake `homepage`/`repository`. Restore the real values so `foxy-elements`/`foxy-checkout`'s existing `"@foxy.io/design-system"` dependency name keeps working unchanged.
2. **Export `defaultTheme`.** It currently only exists as an internal import used by `.stories.tsx` files — no `index.ts` export, no `package.json` export map entry, no `theme` entry in `vite.config.ts`'s `pack.entry`. Without it, no consumer can build a `ThemeProvider`, and every component throws/renders unstyled (`props.theme` resolves to `{}`). Add a `theme` pack entry (`src/utils/defaultTheme.ts` re-exported, plus its type) following the same per-component subpath-export convention already used for `button`, `select`, etc.
3. **Add missing `Field` parts.** `Field` currently only exports `{ Root, Label, Control, Description, Error }` (mirroring Base UI's own `Field` primitive, which has no compound parts beyond these). The old shadcn-based API additionally had `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldContent` for grouping/layout, which `foxy-elements` needs. None of these have a Base UI primitive backing them anyway (same situation as `Card`/`Alert`), so add them as plain `styled.fieldset`/`styled.legend`/`styled.div` following the existing no-primitive pattern, exported as `Field.Set`, `Field.Legend`, `Field.Group`, `Field.Content`.

Then rebuild, re-pack (`npm pack` via `vp pack`), and replace `foxy-elements/foxy.io-design-system-0.0.0.tgz` with the new tarball — the existing vendored-tarball convention (already used for `foxy.io-sdk-0.0.0.tgz`) stays as-is, no change to the dependency-resolution mechanism itself.

## Migration mechanics: foxy-payment-method-selector

### Shadow DOM wiring (`element.tsx`)

- Wrap the existing `createRoot(...).render(...)` tree in `<StyleSheetManager target={this.#shadowRootRef}>` → `<ThemeProvider theme={{tokens: <merged theme, see below>}}>`.
- Every `*.Portal` usage (currently only `Select`, in `billing.tsx`) gets `container={this.#shadowRootRef}` (or a dedicated element inside it) so popped-out popups stay inside the shadow root.
- Remove the `<style>`-tag-with-inlined-Tailwind-text mechanism (`defaultShadowStyles` from `@/index.css?inline`) entirely — styled-components' shadow-root injection replaces it. `src/index.css` becomes either empty or removed, since Tailwind is gone (see "Tailwind removal" below).

### API shape: namespaced compound exports

The new design system exports namespaced objects, not flat named exports — this is a JSX rewrite across all six files, not just an import-path change:

| Old (`@foxy.io/design-system/ui/*`) | New (`@foxy.io/design-system/*`) |
|---|---|
| `Card`, `CardContent`, `CardDescription` | `Card.Root`, `Card.Content`, `Card.Description` |
| `Field`, `FieldGroup`, `FieldLabel`, `FieldSet`, `FieldLegend`, `FieldContent` | `Field.Root`, `Field.Group`, `Field.Label`, `Field.Set`, `Field.Legend`, `Field.Content` |
| `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectTrigger`, `SelectValue` | `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Portal`, `Select.Positioner`, `Select.Popup`, `Select.List`, `Select.Item`, `Select.ItemText`, `Select.Group`, `Select.GroupLabel` — manual composition, no ready-made "Content" wrapper |
| `RadioGroup`, `RadioGroupItem` | `Radio.Group`, `Radio.Root`, `Radio.Indicator` |
| `Checkbox` | `Checkbox.Group`, `Checkbox.Root`, `Checkbox.Indicator` |
| `Alert`, `AlertDescription` | `Alert.Root`, `Alert.Description` |
| `Button`, `Input`, `Skeleton` | unchanged shape (single component each), import path drops `/ui/` prefix |

Import paths themselves also change: `@foxy.io/design-system/ui/<name>` → `@foxy.io/design-system/<name>` (no `/ui/` segment), and `radio-group` → `radio`.

## Theming redesign: theme-mixin.ts / theme-attribute-sync.ts

`theme-mixin.ts`'s `THEME_DEFINITIONS` (23 entries: `theme-background`, `theme-primary`, `theme-input-height`, etc., each backed by a shadcn CSS variable) is shared production code across all three elements' public theme-* attribute API. Per your direction, this gets redesigned around the new token vocabulary rather than kept stable, which is a breaking change to documented API on `foxy-ach-field`/`foxy-payment-card-field`.

**Naming convention:** `theme-<token-path-kebab-cased>`, e.g. `color.primary` → `theme-color-primary`, `background.buttonPrimary` → `theme-background-button-primary`, `size.control` → `theme-size-control`. Overrides accept whatever raw CSS value the corresponding token expects — for shorthand tokens (`border.field`, `font.body`, `outline.primary`) that's the full shorthand string, matching how `injectThemeOverrides` already works inside foxy-design-system.

**Mapping table** (old attribute → new attribute, with rationale where it's not 1:1):

| Old attribute | New attribute | Note |
|---|---|---|
| `theme-background` | `theme-background-surface` | general page/surface background |
| `theme-foreground` | `theme-color-body` | |
| `theme-card` | `theme-background-surface` | new system has one surface token, not a separate card bg |
| `theme-card-foreground` | `theme-color-body` | collapses with `theme-foreground` |
| `theme-primary` | `theme-color-primary` **and** `theme-background-button-primary` | old single token served both an accent-color role and a button-fill role; new tokens distinguish them, so this becomes two knobs |
| `theme-primary-foreground` | `theme-color-on-primary` | |
| `theme-muted` | `theme-background-disabled-field` | closest equivalent subtle-surface token |
| `theme-muted-foreground` | `theme-color-secondary` | |
| `theme-destructive` | `theme-color-error` **and** `theme-background-error` | same split as `primary` |
| `theme-border` | `theme-border-field` | now a full shorthand (width+style+color), not a bare color |
| `theme-input` | `theme-border-field` | collapses with `theme-border` — old system had these as separate-but-usually-identical tokens |
| `theme-ring` | `theme-outline-primary` | |
| `theme-font-sans` | `theme-font-body` | now a full font shorthand (weight/size/line-height/family), not just a family stack |
| `theme-radius` | `theme-border-radius-sm` | |
| `theme-spacing` | `theme-space-md` | |
| `theme-input-placeholder-color` | `theme-color-secondary` | reuses the secondary/muted color role; no dedicated placeholder token |
| `theme-input-text-color` | `theme-color-body` | |
| `theme-input-error-text-color` | `theme-color-error` | |
| `theme-input-height`, `theme-input-padding`, `theme-input-padding-x`, `theme-input-padding-y`, `theme-input-font-size` | *derived, not directly settable* | see below |

The five `input-*` sizing/padding/font-size attributes become **derived** from `theme-size-control` (and `theme-font-body`'s parsed size) rather than independently settable — the new design system itself doesn't expose them as separate knobs (`Input`'s padding is `calc(size.control / 4)`, not its own token), so there's no independent value to preserve. This is a deliberate capability consolidation, not an oversight.

**Confirming no iframe capability is silently lost** — every one of the ~9-10 query params `foxy-ach-field`/`foxy-payment-card-field` currently send to the hosted iframe (`input_height`, `input_padding`, `input_padding_x`, `input_padding_y`, `input_placeholder_color`, `input_font`, `input_text_color`, `input_text_color_error`, `input_font_size`, plus card-field's `theme_background`) remains derivable:

- `input_height` = `px(theme-size-control) - 2 * px(theme-size-border-width)` (border-box content height)
- `input_padding` / `_x` / `_y` = derived from `theme-size-control / 4` horizontal, `0` vertical (matches the new `Input`'s actual CSS — a real behavior change from the old shadcn metrics, not a regression, since it now matches what the design system itself renders)
- `input_placeholder_color` = `theme-color-secondary`
- `input_font` = family portion parsed out of `theme-font-body`'s shorthand
- `input_font_size` = size portion parsed out of `theme-font-body`'s shorthand
- `input_text_color` = `theme-color-body`, `input_text_color_error` = `theme-color-error`
- `theme_background` (card-field only) = `theme-background-field`

`px()` conversion reads `getComputedStyle(document.documentElement).fontSize` once (a generic browser API call, not Tailwind-dependent) to resolve `rem` values.

**`getShadcnInputMetrics()` in `theme-attribute-sync.ts`** — currently renders a hidden `<input>` with a hardcoded shadcn Tailwind class string and measures its computed box — gets deleted. It's only ever called from Storybook story helpers (`element.stories.ts` via each element's `utils.ts`), never from production `element.ts`, so this is a stories-only change in terms of blast radius, but the token-derivation function that replaces it becomes shared production code (used by the real `_buildIframeUrl`-equivalent logic in both elements).

**Documentation:** `foxy-ach-field/docs.mdx` and `foxy-payment-card-field/docs.mdx` get their `theme-*` attribute tables and examples rewritten to the new names.

## Tailwind removal

Tailwind (`tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`, `clsx`, `tailwind-merge`) is removed from `foxy-elements` entirely — not just from `payment-method-selector`'s markup. Every `className`-based layout utility (the ~119 plain-layout usages: `flex`, `gap-2`, spacing, etc. — separate from the ~25 shadcn-CSS-var-dependent ones already flagged) gets rewritten as styled-components, matching how `foxy-design-system` itself is built (plain `styled.div` for layout, no utility classes). `src/index.css`'s Tailwind/design-system-styles.css imports are removed; any global reset the shadow root still needs (if any) moves to a small styled-components `createGlobalStyle` scoped via the same `StyleSheetManager` target.

## Testing & verification

- Run the existing Storybook/examples dev server for `foxy-payment-method-selector`, `foxy-ach-field`, and `foxy-payment-card-field` in-browser; confirm shadow-DOM styling renders correctly (not just the isolated spikes), exercise `Select`/`Radio`/`Checkbox`/`Alert` interactions, and confirm the ACH/card hosted-field visual sizing still lines up with the new `Input`.
- Regenerate `element.test.ts` screenshot baselines for all three elements (visuals shift with new tokens and removed Tailwind).
- Update `element.stories.ts` for `foxy-ach-field`/`foxy-payment-card-field` to use the new theme-attribute names and the new metrics-derivation helper.

## Framing note for phase 2 (not part of this spec)

`foxy-checkout` renders in light DOM (no `attachShadow` anywhere in its source) — so the shadow-DOM-specific risks validated here (styled-components injection target, portal `container` wiring) don't apply there. Its migration will be simpler on that axis but larger in surface (~27 files currently reference the design system, vs. 6 here).
