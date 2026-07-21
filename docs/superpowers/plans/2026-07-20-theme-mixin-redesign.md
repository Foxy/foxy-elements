# foxy-elements: theme-mixin redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the shared `theme-mixin.ts` attribute vocabulary (used by all three elements' public `theme-*` API) around `foxy-design-system`'s new token shape instead of the old shadcn CSS variables, and replace the Tailwind-dependent `getShadcnInputMetrics()` DOM probe with a pure token-derivation function. This is a breaking change to documented public API on `foxy-ach-field` and `foxy-payment-card-field`.

**Architecture:** `theme-mixin.ts`'s `ThemeMixin` mechanism (attribute ↔ property ↔ CSS-var reflection) is unchanged — only its `THEME_DEFINITIONS` data table changes, from 23 shadcn-shaped entries to 17 new-token-shaped entries (some old entries collapse onto the same new token; `theme-primary`/`theme-destructive` each split into two, since the new tokens distinguish an accent color from a fill color where the old ones didn't). `theme-attribute-sync.ts` loses its DOM-measurement helper entirely, replaced by a pure function that computes input sizing/typography straight from token strings — no hidden probe element, no `document.body` append, no Tailwind class dependency. `foxy-ach-field` and `foxy-payment-card-field`'s production code (`_buildIframeUrl`, `_resolveInitialIframeHeight`) and Storybook helpers (`utils.ts`) are updated to the new vocabulary; the wire contract they send to `embed.foxy.io` (`input_height`, `theme_input_height`, etc. query param *names*) does not change.

**Tech Stack:** TypeScript, Vitest (`vp test`, this repo's existing test runner — plain `*.test.ts` files, not Storybook-driven like `foxy-design-system`), Storybook 10.

## Global Constraints

- This plan lands on the `experiment/base-ui-design-system` branch (already created, based on `release/2.0.0` @ `fa7ae268`).
- Every new/changed `theme-*` attribute is documented public API — every rename must be reflected in the corresponding element's `docs.mdx`.
- The URL/postMessage query param *names* sent to the external `embed.foxy.io` iframe (`input_height`, `theme_input_height`, `theme_font_sans`, etc.) must not change — only how their values get computed changes.
- Run `npm run localdev:storybook` or `npx vitest run <path>` (check `package.json`'s `scripts` for the exact test command — this repo's `test` script may be a Storybook-driven Vitest project like `foxy-design-system`'s, or a plain Vitest project; confirm before running) after each task.
- Do not touch `foxy-payment-method-selector` in this plan — that migration (and its consumption of the new vocabulary) is a separate, later plan (`2026-07-20-payment-method-selector-migration.md`) that depends on this one landing first.

---

### Task 1: Rewrite `theme-mixin.ts`'s `THEME_DEFINITIONS`

**Files:**
- Modify: `src/lib/theme-mixin.ts:7-123` (the `THEME_DEFINITIONS` array only — everything below line 123, the `ThemeMixin` mechanism itself, is unchanged)

**Interfaces:**
- Produces: `THEME_DEFINITIONS`, `ThemePropertyName`, `ThemeAttributeName`, `ThemeCssVar` — same type names, new members. Every consumer in Tasks 2-6 (and the later payment-method-selector plan) is written against this exact set of 17 attribute names.

- [ ] **Step 1: Confirm current state**

Run: `sed -n '7,123p' src/lib/theme-mixin.ts | head -5` — confirms the file still starts the `THEME_DEFINITIONS` array at line 7 with `property: "themeBackground"` (if line numbers have drifted, adjust the replacement range accordingly).

- [ ] **Step 2: Replace the definitions array**

Replace lines 7-123 of `src/lib/theme-mixin.ts` (the full `THEME_DEFINITIONS` array, from `const THEME_DEFINITIONS = [` through its closing `] as const satisfies readonly ThemeDefinition[];`) with:

```ts
const THEME_DEFINITIONS = [
  {
    property: "themeBackgroundSurface",
    attribute: "theme-background-surface",
    cssVariable: "--background-surface",
  },
  {
    property: "themeBackgroundField",
    attribute: "theme-background-field",
    cssVariable: "--background-field",
  },
  {
    property: "themeColorBody",
    attribute: "theme-color-body",
    cssVariable: "--color-body",
  },
  {
    property: "themeColorPrimary",
    attribute: "theme-color-primary",
    cssVariable: "--color-primary",
  },
  {
    property: "themeBackgroundButtonPrimary",
    attribute: "theme-background-button-primary",
    cssVariable: "--background-button-primary",
  },
  {
    property: "themeColorOnPrimary",
    attribute: "theme-color-on-primary",
    cssVariable: "--color-on-primary",
  },
  {
    property: "themeBackgroundDisabledField",
    attribute: "theme-background-disabled-field",
    cssVariable: "--background-disabled-field",
  },
  {
    property: "themeColorSecondary",
    attribute: "theme-color-secondary",
    cssVariable: "--color-secondary",
  },
  {
    property: "themeColorError",
    attribute: "theme-color-error",
    cssVariable: "--color-error",
  },
  {
    property: "themeBackgroundError",
    attribute: "theme-background-error",
    cssVariable: "--background-error",
  },
  {
    property: "themeBorderField",
    attribute: "theme-border-field",
    cssVariable: "--border-field",
  },
  {
    property: "themeOutlinePrimary",
    attribute: "theme-outline-primary",
    cssVariable: "--outline-primary",
  },
  {
    property: "themeFontBody",
    attribute: "theme-font-body",
    cssVariable: "--font-body",
  },
  {
    property: "themeBorderRadiusSm",
    attribute: "theme-border-radius-sm",
    cssVariable: "--border-radius-sm",
  },
  {
    property: "themeSpaceMd",
    attribute: "theme-space-md",
    cssVariable: "--space-md",
  },
  {
    property: "themeSizeControl",
    attribute: "theme-size-control",
    cssVariable: "--size-control",
  },
  {
    property: "themeSizeBorderWidth",
    attribute: "theme-size-border-width",
    cssVariable: "--size-border-width",
  },
] as const satisfies readonly ThemeDefinition[];
```

This is the old-to-new mapping this replaces (for reference — not code to write anywhere, just the rationale for anyone diffing against the old array):

| Old attribute | New attribute |
|---|---|
| `theme-background` | `theme-background-surface` |
| `theme-foreground` | `theme-color-body` |
| `theme-card` | `theme-background-surface` (collapsed) |
| `theme-card-foreground` | `theme-color-body` (collapsed) |
| `theme-primary` | `theme-color-primary` **+** `theme-background-button-primary` (split) |
| `theme-primary-foreground` | `theme-color-on-primary` |
| `theme-muted` | `theme-background-disabled-field` |
| `theme-muted-foreground` | `theme-color-secondary` |
| `theme-destructive` | `theme-color-error` **+** `theme-background-error` (split) |
| `theme-border` | `theme-border-field` |
| `theme-input` | `theme-border-field` (collapsed) |
| `theme-ring` | `theme-outline-primary` |
| `theme-font-sans` | `theme-font-body` |
| `theme-radius` | `theme-border-radius-sm` |
| `theme-spacing` | `theme-space-md` |
| `theme-input-placeholder-color` | `theme-color-secondary` (collapsed) |
| `theme-input-text-color` | `theme-color-body` (collapsed) |
| `theme-input-error-text-color` | `theme-color-error` (collapsed) |
| `theme-input-height`, `theme-input-padding`, `theme-input-padding-x`, `theme-input-padding-y`, `theme-input-font-size` | *removed* — derived in Task 2 from `theme-size-control` + `theme-size-border-width` + `theme-font-body` |

`theme-background-field` is a new attribute not explicitly called out in the migration spec's table — it's needed in Task 5 for `foxy-payment-card-field`'s `theme_background` query param, which describes the hosted *input's* own surface color, not the page/card surface `theme-background-surface` represents. Both tokens (`background.surface`, `background.field`) already exist distinctly in `foxy-design-system`'s `defaultTheme`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.app.json` (or the repo's equivalent — check `package.json`'s `scripts` for a `typecheck`/`check` entry first and prefer that)

Expected: FAILS at this point — every consumer (`foxy-ach-field`, `foxy-payment-card-field`, and their tests/stories) still references the old property/attribute names (`themeInputHeight`, `theme-input-height`, etc.), which no longer exist on the `ThemeElement`/`ThemePropertyValues` types. This is expected and will be fixed by Tasks 3-6. Confirm the errors are all in the expected files (`foxy-ach-field/*`, `foxy-payment-card-field/*`) and not in `theme-mixin.ts` itself.

- [ ] **Step 4: Commit**

```bash
git add src/lib/theme-mixin.ts
git commit -m "refactor(theme-mixin): redesign THEME_DEFINITIONS around design-system tokens

Replaces the 23 shadcn-CSS-variable-shaped theme-* attributes with 17
attributes named after foxy-design-system's own token paths. theme-primary
and theme-destructive each split into a color-only and a background-only
attribute, since the new tokens distinguish those roles where the old ones
didn't; the five input-sizing attributes (theme-input-height and its
padding/font-size siblings) are removed entirely, becoming derived values
in theme-attribute-sync.ts instead of independently settable attributes.

This is a breaking change to documented public API on foxy-ach-field and
foxy-payment-card-field. Consumers of this commit alone will fail to
typecheck until the following commits update every element that reads
these properties — that's expected, not a regression, see the plan.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Replace `getShadcnInputMetrics` with a pure token-derivation function

**Files:**
- Modify: `src/lib/theme-attribute-sync.ts` (remove `SHADCN_INPUT_PROBE_CLASS_NAME`, `ShadcnInputMetrics`, `getShadcnInputMetrics`; add `parseFontShorthand`, `getRootFontSizePx`, `remToPx`, `DerivedInputMetrics`, `deriveInputMetrics`)
- Test: `src/lib/theme-attribute-sync.test.ts` (new file — this module currently has no dedicated test file; every other helper in it is only exercised indirectly through `foxy-ach-field`/`foxy-payment-card-field`'s own tests, but `deriveInputMetrics` is pure and easy to test directly, so it gets one)

**Interfaces:**
- Consumes: nothing new (no DOM APIs required except `getRootFontSizePx`'s `document`/`getComputedStyle` fallback, and even that only runs when the caller doesn't pass `rootFontSizePx` explicitly).
- Produces: `deriveInputMetrics(options: { controlSize: string; borderWidth: string; fontBody: string; rootFontSizePx?: number }): DerivedInputMetrics` where `DerivedInputMetrics = { heightPx: number; paddingX: string; paddingY: string; fontSize: string; fontFamily: string }`. Tasks 3, 4, 5, 6 all call this with values already resolved via `getThemeProperty`/`getThemeCssVarMap` plus a `defaultTheme` fallback.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/theme-attribute-sync.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { deriveInputMetrics, parseFontShorthand, remToPx } from "./theme-attribute-sync";

describe("parseFontShorthand", () => {
  it("splits a weight/size/line-height/family shorthand into size and family", () => {
    expect(
      parseFontShorthand("400 1rem/1.25 Albert Sans, sans-serif"),
    ).toEqual({ fontSize: "1rem", fontFamily: "Albert Sans, sans-serif" });
  });

  it("handles a different weight and size", () => {
    expect(
      parseFontShorthand("600 0.875rem/1.25 Albert Sans, sans-serif"),
    ).toEqual({ fontSize: "0.875rem", fontFamily: "Albert Sans, sans-serif" });
  });
});

describe("remToPx", () => {
  it("converts a rem value at the given root font size", () => {
    expect(remToPx("2.5rem", 16)).toBe("40px");
  });

  it("passes through values that aren't in rem unchanged", () => {
    expect(remToPx("40px", 16)).toBe("40px");
  });
});

describe("deriveInputMetrics", () => {
  it("derives height as control size minus twice the border width, in px", () => {
    const metrics = deriveInputMetrics({
      controlSize: "2.5rem",
      borderWidth: "0.125rem",
      fontBody: "400 1rem/1.25 Albert Sans, sans-serif",
      rootFontSizePx: 16,
    });

    // control: 2.5rem = 40px, border: 0.125rem = 2px, height = 40 - 2*2 = 36
    expect(metrics.heightPx).toBe(36);
  });

  it("derives horizontal padding as a quarter of the control size, no vertical padding", () => {
    const metrics = deriveInputMetrics({
      controlSize: "2.5rem",
      borderWidth: "0.125rem",
      fontBody: "400 1rem/1.25 Albert Sans, sans-serif",
      rootFontSizePx: 16,
    });

    // 40px / 4 = 10px
    expect(metrics.paddingX).toBe("10px");
    expect(metrics.paddingY).toBe("0px");
  });

  it("resolves font size and family from the font shorthand", () => {
    const metrics = deriveInputMetrics({
      controlSize: "2.5rem",
      borderWidth: "0.125rem",
      fontBody: "400 1rem/1.25 Albert Sans, sans-serif",
      rootFontSizePx: 16,
    });

    expect(metrics.fontSize).toBe("16px");
    expect(metrics.fontFamily).toBe("Albert Sans, sans-serif");
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npx vitest run src/lib/theme-attribute-sync.test.ts`
Expected: FAIL — `deriveInputMetrics`, `parseFontShorthand`, `remToPx` are not exported yet (module doesn't have these members).

- [ ] **Step 3: Remove the shadcn probe and add the derivation functions**

In `src/lib/theme-attribute-sync.ts`, delete these three members entirely (currently at the top of the file, right after the imports):
- `type ShadcnInputMetrics = {...}` (the type)
- `const SHADCN_INPUT_PROBE_CLASS_NAME = "..."` (the hardcoded Tailwind class string)
- `export function getShadcnInputMetrics(): ShadcnInputMetrics {...}` (the DOM-probing function, at the bottom of the file)

In their place, add (near the top of the file, after the existing `readCssVarValue` helper and before `applyThemeAttributeMap`):

```ts
export type ParsedFontShorthand = {
  fontSize: string;
  fontFamily: string;
};

export function parseFontShorthand(shorthand: string): ParsedFontShorthand {
  const match = shorthand.match(/([\d.]+(?:px|rem|em))(?:\/[\d.]+)?\s+(.+)$/);
  if (!match) return { fontSize: "1rem", fontFamily: shorthand };
  return { fontSize: match[1], fontFamily: match[2] };
}

export function getRootFontSizePx(): number {
  if (typeof document === "undefined") return 16;
  const parsed = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

export function remToPx(value: string, rootFontSizePx = getRootFontSizePx()): string {
  const match = value.match(/^([\d.]+)rem$/);
  if (!match) return value;
  return `${Number.parseFloat(match[1]) * rootFontSizePx}px`;
}

export type DerivedInputMetrics = {
  heightPx: number;
  paddingX: string;
  paddingY: string;
  fontSize: string;
  fontFamily: string;
};

export function deriveInputMetrics(options: {
  controlSize: string;
  borderWidth: string;
  fontBody: string;
  rootFontSizePx?: number;
}): DerivedInputMetrics {
  const rootFontSizePx = options.rootFontSizePx ?? getRootFontSizePx();
  const controlPx = Number.parseFloat(remToPx(options.controlSize, rootFontSizePx));
  const borderWidthPx = Number.parseFloat(remToPx(options.borderWidth, rootFontSizePx));
  const heightPx = Math.max(Math.round(controlPx - 2 * borderWidthPx), 0);
  const paddingXPx = Math.round(controlPx / 4);
  const { fontSize, fontFamily } = parseFontShorthand(options.fontBody);

  return {
    heightPx,
    paddingX: `${paddingXPx}px`,
    paddingY: "0px",
    fontSize: remToPx(fontSize, rootFontSizePx),
    fontFamily,
  };
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `npx vitest run src/lib/theme-attribute-sync.test.ts`
Expected: PASS, all 7 tests.

- [ ] **Step 5: Confirm no remaining references to the deleted probe**

Run: `grep -rn "getShadcnInputMetrics\|ShadcnInputMetrics\|SHADCN_INPUT_PROBE" src`
Expected: no matches in `src/lib/theme-attribute-sync.ts` itself. Matches WILL still appear in `foxy-ach-field/utils.ts` and `foxy-payment-card-field/utils.ts` — that's expected, fixed in Tasks 4 and 6.

- [ ] **Step 6: Commit**

```bash
git add src/lib/theme-attribute-sync.ts src/lib/theme-attribute-sync.test.ts
git commit -m "refactor(theme-attribute-sync): replace DOM-probed metrics with token derivation

getShadcnInputMetrics rendered a hidden <input> with a hardcoded shadcn
Tailwind class string and measured its computed box — with Tailwind being
removed from this repo, that probe has nothing to measure against anymore.
deriveInputMetrics computes the same height/padding/font values as a pure
function of the design-system's own tokens (size.control, size.borderWidth,
font.body), matching what the new Input component actually renders without
touching the DOM.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Update `foxy-ach-field`'s production theme consumption

**Files:**
- Modify: `src/elements/foxy-ach-field/element.ts:74-88` (attribute list), `:1054-1108` (`_buildIframeUrl`'s theme block), imports
- Modify: `src/elements/foxy-ach-field/element.test.ts:463-464` and the CSS-var-default test block (~471-480)

**Interfaces:**
- Consumes: `deriveInputMetrics` from `./theme-attribute-sync` (Task 2); `defaultTheme` from `@foxy.io/design-system/theme` (this is a **new dependency edge** — `foxy-ach-field` previously never imported the design-system package in production code, only the local `theme-mixin`; it's already a peerDependency of the whole `foxy-elements` package, so this is a legitimate use of an existing dependency, not a new one being added to `package.json`).

- [ ] **Step 1: Update imports**

At the top of `src/elements/foxy-ach-field/element.ts`, add two imports alongside the existing `theme-mixin` import:

```ts
import { deriveInputMetrics } from "@/lib/theme-attribute-sync";
import { defaultTheme } from "@foxy.io/design-system/theme";
```

- [ ] **Step 2: Replace the iframe theme attribute list**

Replace lines 74-88:

```ts
const ACH_IFRAME_THEME_ATTRIBUTE_NAMES = [
  "theme-input-placeholder-color",
  "theme-input-height",
  "theme-input-padding",
  "theme-input-padding-x",
  "theme-input-padding-y",
  "theme-font-sans",
  "theme-input-text-color",
  "theme-input-error-text-color",
  "theme-input-font-size",
] as const satisfies readonly ThemeAttributeName[];

const ACH_IFRAME_THEME_DEFINITIONS = getThemeDefinitionsByAttributeNames(
  ACH_IFRAME_THEME_ATTRIBUTE_NAMES,
);
```

with:

```ts
const ACH_IFRAME_THEME_ATTRIBUTE_NAMES = [
  "theme-color-secondary",
  "theme-font-body",
  "theme-color-body",
  "theme-color-error",
  "theme-size-control",
  "theme-size-border-width",
] as const satisfies readonly ThemeAttributeName[];

const ACH_IFRAME_THEME_DEFINITIONS = getThemeDefinitionsByAttributeNames(
  ACH_IFRAME_THEME_ATTRIBUTE_NAMES,
);
```

- [ ] **Step 3: Replace the theme block inside `_buildIframeUrl`**

Replace lines 1075-1107 (the block from `if (theme["--input-height"]) {` through the closing brace right before `}` at line 1108, i.e. everything currently reading `theme["--input-*"]`/`theme["--font-sans"]`) with:

```ts
      const metrics = deriveInputMetrics({
        controlSize: theme["--size-control"] || defaultTheme.size.control,
        borderWidth:
          theme["--size-border-width"] || defaultTheme.size.borderWidth,
        fontBody: theme["--font-body"] || defaultTheme.font.body,
      });

      url.searchParams.set("input_height", `${metrics.heightPx}px`);
      url.searchParams.set(
        "input_padding",
        `${metrics.paddingY} ${metrics.paddingX}`,
      );
      url.searchParams.set("input_padding_x", metrics.paddingX);
      url.searchParams.set("input_padding_y", metrics.paddingY);
      url.searchParams.set("input_font", metrics.fontFamily);
      url.searchParams.set("input_text_size", metrics.fontSize);

      if (theme["--color-secondary"]) {
        url.searchParams.set(
          "input_placeholder_color",
          theme["--color-secondary"],
        );
      }
      if (theme["--color-body"]) {
        url.searchParams.set("input_text_color", theme["--color-body"]);
      }
      if (theme["--color-error"]) {
        url.searchParams.set(
          "input_text_color_error",
          theme["--color-error"],
        );
      }
```

The query param *names* (`input_height`, `input_padding`, `input_padding_x`, `input_padding_y`, `input_font`, `input_text_size`, `input_placeholder_color`, `input_text_color`, `input_text_color_error`) are unchanged from before — only how their values are produced changes. `input_height`/`input_padding`/`input_padding_x`/`input_padding_y`/`input_font`/`input_text_size` are now always set (derived values always exist, unlike the old conditionally-set attributes) — this is intentional: the iframe always receives a value now instead of only when a customer happened to set the old attribute.

- [ ] **Step 4: Fix the two hardcoded test blocks**

`src/elements/foxy-ach-field/element.test.ts` line 463-464 currently:

```ts
    field.themeInputHeight = " 44px ";
    expect(field.getAttribute("theme-input-height")).toBe("44px");
```

Replace with (using a property that still exists post-redesign):

```ts
    field.themeSizeControl = " 3rem ";
    expect(field.getAttribute("theme-size-control")).toBe("3rem");
```

And the CSS-var-default test (~lines 469-481) currently:

```ts
  it("uses CSS custom properties as default theme values", () => {
    const field = document.createElement(
      ACH_FIELD_ELEMENT_TAG,
    ) as AchFieldElement;
    field.type = "routing-number";
    field.group = "ach-unit-group";
    field.style.setProperty("--font-sans", "Figtree");
    field.style.setProperty("--input-height", "48px");
    document.body.append(field);

    expect(field.themeFontSans).toBe("Figtree");
    expect(field.themeInputHeight).toBe("48px");
```

Replace with:

```ts
  it("uses CSS custom properties as default theme values", () => {
    const field = document.createElement(
      ACH_FIELD_ELEMENT_TAG,
    ) as AchFieldElement;
    field.type = "routing-number";
    field.group = "ach-unit-group";
    field.style.setProperty("--font-body", "400 1rem/1.25 Figtree, sans-serif");
    field.style.setProperty("--size-control", "3rem");
    document.body.append(field);

    expect(field.themeFontBody).toBe("400 1rem/1.25 Figtree, sans-serif");
    expect(field.themeSizeControl).toBe("3rem");
```

(Read the rest of that `it` block — anything after line 480 in the original that asserted further on `themeInputHeight` needs the same rename; there is no other reference per the earlier repo-wide `grep -n "theme-"` check, but re-run that grep after this edit to be sure — see Step 5.)

- [ ] **Step 5: Confirm no stale references remain in this file**

Run: `grep -n "theme-input-\|themeInputHeight\|themeInputPadding\|themeInputFontSize\|theme-primary\|theme-destructive\|theme-muted\|theme-card\|theme-border\b\|theme-input\b\|theme-ring\|theme-radius\|theme-spacing\|theme-foreground\|theme-background\b\|themeFontSans\b" src/elements/foxy-ach-field/element.ts src/elements/foxy-ach-field/element.test.ts`
Expected: no matches (every old-vocabulary name has been replaced).

- [ ] **Step 6: Run the element's test suite**

Run: `npx vitest run src/elements/foxy-ach-field/element.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/elements/foxy-ach-field/element.ts src/elements/foxy-ach-field/element.test.ts
git commit -m "refactor(ach-field): consume the redesigned theme-mixin vocabulary

The hosted iframe's theme query params (input_height, input_font, etc.)
keep their exact names — only how their values are produced changes: sizing
and typography are now derived from theme-size-control/theme-size-border-
width/theme-font-body via deriveInputMetrics instead of being read directly
off five now-removed theme-input-* attributes.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Update `foxy-ach-field`'s Storybook helpers and docs

**Files:**
- Modify: `src/elements/foxy-ach-field/utils.ts`
- Modify: `src/elements/foxy-ach-field/docs.mdx`

**Interfaces:**
- Consumes: `deriveInputMetrics`, `defaultTheme` (same as Task 3).

- [ ] **Step 1: Update imports**

In `src/elements/foxy-ach-field/utils.ts`, replace:

```ts
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  createThemeAttributeMap,
  getShadcnInputMetrics,
} from "../../lib/theme-attribute-sync";
```

with:

```ts
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  createThemeAttributeMap,
  deriveInputMetrics,
} from "../../lib/theme-attribute-sync";
import { defaultTheme } from "@foxy.io/design-system/theme";
```

- [ ] **Step 2: Update `ACH_THEME_ATTRIBUTE_MAP`**

Replace the existing map:

```ts
const ACH_THEME_ATTRIBUTE_MAP = createThemeAttributeMap([
  {
    attribute: "theme-font-sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
  },
  {
    attribute: "theme-input-text-color",
    fallback: "#111827",
  },
  {
    attribute: "theme-input-placeholder-color",
    fallback: "#6b7280",
  },
  {
    attribute: "theme-input-error-text-color",
    fallback: "#dc2626",
  },
] as const);
```

with:

```ts
const ACH_THEME_ATTRIBUTE_MAP = createThemeAttributeMap([
  {
    attribute: "theme-font-body",
    fallback: defaultTheme.font.body,
  },
  {
    attribute: "theme-color-body",
    fallback: defaultTheme.color.body,
  },
  {
    attribute: "theme-color-secondary",
    fallback: defaultTheme.color.secondary,
  },
  {
    attribute: "theme-color-error",
    fallback: defaultTheme.color.error,
  },
] as const);
```

- [ ] **Step 3: Simplify `createAchSurface`, `createStoryNote`, `createButton` — replace shadcn CSS-var fallbacks with real token values**

These three functions build plain demo-page DOM for the Storybook story (not the element itself) and currently fall back to hardcoded shadcn defaults via `var(--card, #ffffff)` etc. Replace every such inline style with the literal token value from `defaultTheme`:

`createAchSurface` currently:
```ts
  element.style.background = "var(--card, #ffffff)";
  element.style.color = "var(--card-foreground, #111827)";
```
becomes:
```ts
  element.style.background = defaultTheme.background.surface;
  element.style.color = defaultTheme.color.body;
```

`createStoryNote` currently:
```ts
  note.style.color = "var(--muted-foreground, #6b7280)";
```
becomes:
```ts
  note.style.color = defaultTheme.color.secondary;
```

`createButton` currently:
```ts
  button.style.border = "1px solid var(--input, #d1d5db)";
  button.style.borderRadius = "calc(var(--radius, 0.625rem) - 2px)";
  button.style.background = "var(--primary, #111827)";
  button.style.color = "var(--primary-foreground, #ffffff)";
```
becomes:
```ts
  button.style.border = defaultTheme.border.field;
  button.style.borderRadius = defaultTheme.borderRadius.sm;
  button.style.background = defaultTheme.background.buttonPrimary;
  button.style.color = defaultTheme.color.onPrimary;
```

- [ ] **Step 4: Replace `styleFieldHost`'s shadcn var fallbacks**

Current:
```ts
function styleFieldHost(element: HTMLElement): void {
  const metrics = getShadcnInputMetrics();
  element.style.display = "block";
  element.style.width = "100%";
  element.style.minHeight = `${metrics.outerHeightPx}px`;
  element.style.border = "1px solid var(--input, #d1d5db)";
  element.style.borderRadius = "calc(var(--radius, 0.625rem) - 2px)";
  element.style.background = "var(--background, #ffffff)";
  element.style.overflow = "hidden";
  element.style.transition = "border-color 150ms ease, box-shadow 150ms ease";
}
```

Replace with:

```ts
function styleFieldHost(element: HTMLElement): void {
  const metrics = deriveInputMetrics({
    controlSize: defaultTheme.size.control,
    borderWidth: defaultTheme.size.borderWidth,
    fontBody: defaultTheme.font.body,
  });
  element.style.display = "block";
  element.style.width = "100%";
  element.style.minHeight = `${metrics.heightPx}px`;
  element.style.border = defaultTheme.border.field;
  element.style.borderRadius = defaultTheme.borderRadius.sm;
  element.style.background = defaultTheme.background.field;
  element.style.overflow = "hidden";
  element.style.transition = "border-color 150ms ease, box-shadow 150ms ease";
}
```

(`getShadcnInputMetrics()` no longer exists after Task 2 — this call would already be a compile error before this fix.)

- [ ] **Step 5: Replace `injectFieldInteractionStyles`'s shadcn var fallbacks**

Current:
```ts
    ${ACH_FIELD_ELEMENT_TAG}:state(focused) {
      border-color: var(--ring, #94a3b8) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring, #94a3b8) 35%, transparent);
    }

    ${ACH_FIELD_ELEMENT_TAG}:state(user-invalid) {
      border-color: var(--destructive, #dc2626) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--destructive, #dc2626) 20%, transparent);
    }

    ${ACH_FIELD_ELEMENT_TAG}:state(disabled) {
      background: var(--muted, #f3f4f6) !important;
      opacity: 0.75;
    }
```

Replace with (interpolating real token values directly into the template literal, since this builds a literal CSS string, not styled-components):

```ts
    ${ACH_FIELD_ELEMENT_TAG}:state(focused) {
      border-color: ${defaultTheme.color.primary} !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, ${defaultTheme.color.primary} 35%, transparent);
    }

    ${ACH_FIELD_ELEMENT_TAG}:state(user-invalid) {
      border-color: ${defaultTheme.color.error} !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, ${defaultTheme.color.error} 20%, transparent);
    }

    ${ACH_FIELD_ELEMENT_TAG}:state(disabled) {
      background: ${defaultTheme.background.disabledField} !important;
      opacity: 0.75;
    }
```

- [ ] **Step 6: Simplify `applyAchThemeAttributes` — drop the now-removed sizing attributes**

Current:
```ts
function applyAchThemeAttributes(element: AchFieldElement): void {
  const metrics = getShadcnInputMetrics();
  const hostBorderTotalPx = 2;
  const hostedInputHeightPx = Math.max(
    metrics.outerHeightPx - hostBorderTotalPx,
    0,
  );
  const hostedInputPadding = `${metrics.paddingY} ${metrics.paddingX}`;

  element.setAttribute("theme-input-height", `${hostedInputHeightPx}px`);
  element.setAttribute("theme-input-padding", hostedInputPadding);
  element.setAttribute("theme-input-font-size", metrics.fontSize);
  applyThemeAttributeMap(element, ACH_THEME_ATTRIBUTE_MAP);
}
```

Replace with:

```ts
function applyAchThemeAttributes(element: AchFieldElement): void {
  applyThemeAttributeMap(element, ACH_THEME_ATTRIBUTE_MAP);
}
```

`theme-input-height`/`theme-input-padding`/`theme-input-font-size` no longer exist as settable attributes (Task 1) — the element's own default derivation (Task 3, using `defaultTheme` as the fallback) already produces the correct sizing without any story-side push, since the story wants the same defaults the element would use anyway. If a specific story later needs to demo a *non-default* size, it should set `theme-size-control` directly (already covered by `bindThemeAttributes`'s generic story-theme application path, no dedicated helper needed for that one attribute).

- [ ] **Step 7: Update the `theme` option type in `createLabeledField`**

`createLabeledField`'s `options.theme` parameter type currently includes fields for the removed attributes:

```ts
  theme?: {
    textColor?: string;
    placeholderColor?: string;
    errorTextColor?: string;
    height?: string;
    padding?: string;
    fontSize?: string;
    fontSans?: string;
  };
```

and `applyStoryTheme` sets them via the old attribute names. Replace both the type and the `applyStoryTheme` body:

```ts
  theme?: {
    textColor?: string;
    placeholderColor?: string;
    errorTextColor?: string;
    fontBody?: string;
    controlSize?: string;
  };
```

```ts
  const applyStoryTheme = (target: AchFieldElement) => {
    applyAchThemeAttributes(target);

    if (options.theme?.textColor) {
      target.setAttribute("theme-color-body", options.theme.textColor);
    }

    if (options.theme?.placeholderColor) {
      target.setAttribute(
        "theme-color-secondary",
        options.theme.placeholderColor,
      );
    }

    if (options.theme?.errorTextColor) {
      target.setAttribute("theme-color-error", options.theme.errorTextColor);
    }

    if (options.theme?.controlSize) {
      target.setAttribute("theme-size-control", options.theme.controlSize);
    }

    if (options.theme?.fontBody) {
      target.setAttribute("theme-font-body", options.theme.fontBody);
    }
  };
```

- [ ] **Step 8: Update `docs.mdx`**

In `src/elements/foxy-ach-field/docs.mdx`, the attribute reference table has one `<tr>` per `theme-*` attribute (see the `theme-input-placeholder-color`/`theme-input-height` rows read earlier in this session for the exact format). Replace every row for a removed/renamed attribute. The 9 old rows (`theme-input-placeholder-color`, `theme-input-height`, `theme-input-padding`, `theme-input-padding-x`, `theme-input-padding-y`, `theme-font-sans`, `theme-input-text-color`, `theme-input-error-text-color`, `theme-input-font-size`) become 4 new rows:

```html
    <tr>
      <td>
        <code>theme-color-secondary</code>
      </td>
      <td>Placeholder text color token.</td>
      <td>
        <code>#635C67</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>theme-font-body</code>
      </td>
      <td>Font shorthand (weight/size/line-height/family) for the hosted input text.</td>
      <td>
        <code>400 1rem/1.25 Albert Sans, sans-serif</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>theme-color-body</code>
      </td>
      <td>Hosted input text color token.</td>
      <td>
        <code>#1C1A1D</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>theme-color-error</code>
      </td>
      <td>Hosted input error-state text color token.</td>
      <td>
        <code>#C1272D</code>
      </td>
    </tr>
```

Also add two rows for the new sizing attributes that replace the deleted height/padding ones, reflecting that they're now a single shared size knob rather than four separate ones:

```html
    <tr>
      <td>
        <code>theme-size-control</code>
      </td>
      <td>Overall control height; hosted input height and horizontal padding are both derived from this.</td>
      <td>
        <code>2.5rem</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>theme-size-border-width</code>
      </td>
      <td>Border width used to compute the hosted input's content height from theme-size-control.</td>
      <td>
        <code>0.125rem</code>
      </td>
    </tr>
```

Also find any prose (not table rows) elsewhere in `docs.mdx` referencing the old attribute names by name (e.g. a "Theming" section introduction) and update those to match — read the full file first (`cat src/elements/foxy-ach-field/docs.mdx`) to locate every such reference, since table rows aren't the only place attribute names appear.

- [ ] **Step 9: Confirm no stale references remain**

Run: `grep -n "theme-input-\|theme-font-sans\b" src/elements/foxy-ach-field/utils.ts src/elements/foxy-ach-field/docs.mdx src/elements/foxy-ach-field/element.stories.ts`
Expected: no matches.

- [ ] **Step 10: Visual check in Storybook**

Run: `npm run localdev:storybook`, open `foxy-ach-field`'s stories, confirm the demo field host renders with the new token-derived sizing/colors and no console errors about missing properties.

- [ ] **Step 11: Commit**

```bash
git add src/elements/foxy-ach-field/utils.ts src/elements/foxy-ach-field/docs.mdx
git commit -m "docs(ach-field): update Storybook helpers and API docs to new theme vocabulary

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Update `foxy-payment-card-field`'s production theme consumption

**Files:**
- Modify: `src/elements/foxy-payment-card-field/element.ts:74-91` (attribute→query-key map), `:551-554` (`_resolveInitialIframeHeight`), `:605-611` and the code right after it inside `_buildIframeUrl`, imports
- Modify: `src/elements/foxy-payment-card-field/element.test.ts:244-245`, `:255-256`

**Interfaces:**
- Consumes: `deriveInputMetrics`, `defaultTheme` (same as Task 3).

- [ ] **Step 1: Update imports**

Add alongside the existing `theme-mixin` import:

```ts
import { deriveInputMetrics } from "@/lib/theme-attribute-sync";
import { defaultTheme } from "@foxy.io/design-system/theme";
```

- [ ] **Step 2: Replace the attribute→query-key map**

Replace lines 74-91:

```ts
const THEME_ATTR_TO_QUERY_KEY = {
  "theme-background": "theme_background",
  "theme-input-placeholder-color": "theme_input_placeholder_color",
  "theme-input-height": "theme_input_height",
  "theme-input-padding": "theme_input_padding",
  "theme-input-padding-x": "theme_input_padding_x",
  "theme-input-padding-y": "theme_input_padding_y",
  "theme-font-sans": "theme_font_sans",
  "theme-input-text-color": "theme_input_text_color",
  "theme-input-error-text-color": "theme_input_error_text_color",
  "theme-input-font-size": "theme_input_font_size",
} as const satisfies Partial<Record<ThemeAttributeName, string>>;

type ThemeQueryAttributeName = keyof typeof THEME_ATTR_TO_QUERY_KEY;

const THEME_QUERY_ATTRIBUTE_NAMES = Object.keys(
  THEME_ATTR_TO_QUERY_KEY,
) as ThemeQueryAttributeName[];
```

with:

```ts
const THEME_ATTR_TO_QUERY_KEY = {
  "theme-background-field": "theme_background",
  "theme-color-secondary": "theme_input_placeholder_color",
  "theme-color-body": "theme_input_text_color",
  "theme-color-error": "theme_input_error_text_color",
} as const satisfies Partial<Record<ThemeAttributeName, string>>;

type ThemeQueryAttributeName = keyof typeof THEME_ATTR_TO_QUERY_KEY;

const THEME_QUERY_ATTRIBUTE_NAMES = Object.keys(
  THEME_ATTR_TO_QUERY_KEY,
) as ThemeQueryAttributeName[];
```

(The four sizing/font query keys — `theme_input_height`, `theme_input_padding`, `theme_input_padding_x`, `theme_input_padding_y`, `theme_font_sans`, `theme_input_font_size` — move out of this generic per-attribute map and into an explicit derivation block in Step 4, same restructuring as `foxy-ach-field` in Task 3.)

- [ ] **Step 3: Fix `_resolveInitialIframeHeight`**

Current:
```ts
  private _resolveInitialIframeHeight(): string {
    const styleHeight = this.getThemeProperty("themeInputHeight");
    return styleHeight || "52px";
  }
```

Replace with:

```ts
  private _resolveInitialIframeHeight(): string {
    const metrics = deriveInputMetrics({
      controlSize:
        this.getThemeProperty("themeSizeControl") ?? defaultTheme.size.control,
      borderWidth:
        this.getThemeProperty("themeSizeBorderWidth") ??
        defaultTheme.size.borderWidth,
      fontBody:
        this.getThemeProperty("themeFontBody") ?? defaultTheme.font.body,
    });
    return `${metrics.heightPx}px`;
  }
```

(The `|| "52px"` hardcoded fallback is no longer needed — `defaultTheme.size.control`/`defaultTheme.size.borderWidth` always resolve to real values, so `deriveInputMetrics` always returns a real height.)

- [ ] **Step 4: Add the derived-metrics block to `_buildIframeUrl`**

The existing loop (lines 605-611):

```ts
    for (const attrName of THEME_QUERY_ATTRIBUTE_NAMES) {
      const value = this.getThemeProperty(
        THEME_DEFINITION_BY_ATTRIBUTE[attrName].property,
      );
      if (!value) continue;
      url.searchParams.set(THEME_ATTR_TO_QUERY_KEY[attrName], value);
    }
```

stays as-is (it now iterates the smaller 4-entry map from Step 2 — no code change needed here, only the map it reads from changed). Immediately after that loop (still inside `_buildIframeUrl`, before the `for (const attrName of TRANSLATION_ATTRIBUTE_NAMES)` loop), add:

```ts
    const metrics = deriveInputMetrics({
      controlSize:
        this.getThemeProperty("themeSizeControl") ?? defaultTheme.size.control,
      borderWidth:
        this.getThemeProperty("themeSizeBorderWidth") ??
        defaultTheme.size.borderWidth,
      fontBody:
        this.getThemeProperty("themeFontBody") ?? defaultTheme.font.body,
    });

    url.searchParams.set("theme_input_height", `${metrics.heightPx}px`);
    url.searchParams.set(
      "theme_input_padding",
      `${metrics.paddingY} ${metrics.paddingX}`,
    );
    url.searchParams.set("theme_input_padding_x", metrics.paddingX);
    url.searchParams.set("theme_input_padding_y", metrics.paddingY);
    url.searchParams.set("theme_font_sans", metrics.fontFamily);
    url.searchParams.set("theme_input_font_size", metrics.fontSize);
```

Note the query key for font family stays `theme_font_sans` (not `theme_input_font`) — that's the existing wire-contract name for this element (different from `foxy-ach-field`'s `input_font`), preserved exactly as-is.

- [ ] **Step 5: Fix the test file**

`src/elements/foxy-payment-card-field/element.test.ts`, current (lines 236-256):

```ts
  it("uses CSS custom properties as default theme values", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    element.style.setProperty("--font-sans", "Figtree");
    element.style.setProperty("--input-height", "64px");
    document.body.append(element);

    expect(element.themeFontSans).toBe("Figtree");
    expect(element.themeInputHeight).toBe("64px");

    const iframe = element.shadowRoot?.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.style.height).toBe("64px");

    const url = new URL(
      iframe?.getAttribute("src") ?? "",
      window.location.origin,
    );
    expect(url.searchParams.get("theme_font_sans")).toBe("Figtree");
    expect(url.searchParams.get("theme_input_height")).toBe("64px");
  });
```

Replace with (setting `--size-control` directly, since height is now derived rather than settable verbatim, and computing the expected value with the same formula the implementation uses so the test doesn't hardcode a magic derived number):

```ts
  it("uses CSS custom properties as default theme values", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    element.style.setProperty("--font-body", "400 1rem/1.25 Figtree, sans-serif");
    element.style.setProperty("--size-control", "4rem");
    document.body.append(element);

    expect(element.themeFontBody).toBe("400 1rem/1.25 Figtree, sans-serif");
    expect(element.themeSizeControl).toBe("4rem");

    // 4rem = 64px at the default 16px root font size; border width falls
    // back to the design system's default (0.125rem = 2px each side).
    const expectedHeightPx = 64 - 2 * 2;

    const iframe = element.shadowRoot?.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.style.height).toBe(`${expectedHeightPx}px`);

    const url = new URL(
      iframe?.getAttribute("src") ?? "",
      window.location.origin,
    );
    expect(url.searchParams.get("theme_font_sans")).toBe("Figtree, sans-serif");
    expect(url.searchParams.get("theme_input_height")).toBe(`${expectedHeightPx}px`);
  });
```

- [ ] **Step 6: Confirm no stale references remain**

Run: `grep -n "theme-input-\|themeInputHeight\|themeFontSans\b\|theme-background\"\|theme-primary\|theme-destructive\|theme-muted\|theme-card\|theme-radius\|theme-spacing\|theme-ring\b" src/elements/foxy-payment-card-field/element.ts src/elements/foxy-payment-card-field/element.test.ts`
Expected: no matches.

- [ ] **Step 7: Run the element's test suite**

Run: `npx vitest run src/elements/foxy-payment-card-field/element.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/elements/foxy-payment-card-field/element.ts src/elements/foxy-payment-card-field/element.test.ts
git commit -m "refactor(payment-card-field): consume the redesigned theme-mixin vocabulary

theme_* query param names sent to the hosted iframe are unchanged; sizing
and typography are now derived from theme-size-control/theme-size-border-
width/theme-font-body via deriveInputMetrics instead of five now-removed
theme-input-* attributes. theme-background becomes theme-background-field,
matching the design system's background.field token (the input's own
surface color, distinct from the general background.surface).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Update `foxy-payment-card-field`'s Storybook helpers and docs

**Files:**
- Modify: `src/elements/foxy-payment-card-field/utils.ts`
- Modify: `src/elements/foxy-payment-card-field/docs.mdx`

**Interfaces:**
- Consumes: `deriveInputMetrics`, `defaultTheme` (same as Tasks 4/5).

This task is structurally identical to Task 4, applied to `foxy-payment-card-field/utils.ts`'s `CARD_THEME_ATTRIBUTE_MAP`, `styleFieldHost`, `injectFieldInteractionStyles`, and `applyCardThemeAttributes` (all shown verbatim earlier in this session), plus `docs.mdx`'s attribute table.

- [ ] **Step 1: Update imports**

Replace:
```ts
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  createThemeAttributeMap,
  getShadcnInputMetrics,
} from "../../lib/theme-attribute-sync";
```
with:
```ts
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  createThemeAttributeMap,
  deriveInputMetrics,
} from "../../lib/theme-attribute-sync";
import { defaultTheme } from "@foxy.io/design-system/theme";
```

- [ ] **Step 2: Update `CARD_THEME_ATTRIBUTE_MAP`**

Replace:
```ts
const CARD_THEME_ATTRIBUTE_MAP = createThemeAttributeMap([
  {
    attribute: "theme-font-sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
  },
  {
    attribute: "theme-input-text-color",
    fallback: "#111827",
  },
  {
    attribute: "theme-input-placeholder-color",
    fallback: "#6b7280",
  },
  // (any further entries — re-read the file to confirm the complete list before editing, only the first three were confirmed verbatim in this session)
```

with:

```ts
const CARD_THEME_ATTRIBUTE_MAP = createThemeAttributeMap([
  {
    attribute: "theme-font-body",
    fallback: defaultTheme.font.body,
  },
  {
    attribute: "theme-color-body",
    fallback: defaultTheme.color.body,
  },
  {
    attribute: "theme-color-secondary",
    fallback: defaultTheme.color.secondary,
  },
```

Before finalizing this step, run `sed -n '30,50p' src/elements/foxy-payment-card-field/utils.ts` to see the full original array (this plan only confirmed the first three entries verbatim) and map any additional entries the same way Task 3/4 mapped `foxy-ach-field`'s (e.g. an error-color entry, if present, becomes `{ attribute: "theme-color-error", fallback: defaultTheme.color.error }`).

- [ ] **Step 3: Replace `styleFieldHost`**

Replace:
```ts
function styleFieldHost(element: HTMLElement): void {
  const metrics = getShadcnInputMetrics();
  element.style.display = "block";
  element.style.width = "100%";
  element.style.minHeight = `${metrics.outerHeightPx}px`;
  element.style.border = "1px solid var(--input, #d1d5db)";
  element.style.borderRadius = "calc(var(--radius, 0.625rem) - 2px)";
  element.style.background = "var(--background, #ffffff)";
  element.style.overflow = "hidden";
  element.style.transition = "border-color 150ms ease, box-shadow 150ms ease";
}
```
with:
```ts
function styleFieldHost(element: HTMLElement): void {
  const metrics = deriveInputMetrics({
    controlSize: defaultTheme.size.control,
    borderWidth: defaultTheme.size.borderWidth,
    fontBody: defaultTheme.font.body,
  });
  element.style.display = "block";
  element.style.width = "100%";
  element.style.minHeight = `${metrics.heightPx}px`;
  element.style.border = defaultTheme.border.field;
  element.style.borderRadius = defaultTheme.borderRadius.sm;
  element.style.background = defaultTheme.background.field;
  element.style.overflow = "hidden";
  element.style.transition = "border-color 150ms ease, box-shadow 150ms ease";
}
```

- [ ] **Step 4: Replace `injectFieldInteractionStyles`'s var() fallbacks**

Replace:
```ts
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(focused),
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:focus-within {
      border-color: var(--ring, #94a3b8) !important;
      outline: none !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring, #94a3b8) 35%, transparent) !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(user-invalid) {
      border-color: var(--destructive, #dc2626) !important;
      outline: 2px solid rgba(220, 38, 38, 0.6) !important;
      outline-offset: 2px;
      box-shadow: none !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(disabled) {
      background: var(--muted, #f3f4f6) !important;
      opacity: 0.75;
    }
```
with:
```ts
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(focused),
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:focus-within {
      border-color: ${defaultTheme.color.primary} !important;
      outline: none !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, ${defaultTheme.color.primary} 35%, transparent) !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(user-invalid) {
      border-color: ${defaultTheme.color.error} !important;
      outline: 2px solid color-mix(in srgb, ${defaultTheme.color.error} 60%, transparent) !important;
      outline-offset: 2px;
      box-shadow: none !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(disabled) {
      background: ${defaultTheme.background.disabledField} !important;
      opacity: 0.75;
    }
```

- [ ] **Step 5: Simplify `applyCardThemeAttributes`**

Replace:
```ts
function applyCardThemeAttributes(element: PaymentCardFieldElement): void {
  const metrics = getShadcnInputMetrics();
  const hostBorderTotalPx = 2;
  const hostedInputHeightPx = Math.max(
    metrics.outerHeightPx - hostBorderTotalPx,
    0,
  );

  element.setAttribute("theme-input-height", `${hostedInputHeightPx}px`);
  element.setAttribute("theme-input-padding-y", metrics.paddingY);
  element.setAttribute("theme-input-padding-x", metrics.paddingX);
  element.setAttribute("theme-input-font-size", metrics.fontSize);
  applyThemeAttributeMap(element, CARD_THEME_ATTRIBUTE_MAP);
}
```
with:
```ts
function applyCardThemeAttributes(element: PaymentCardFieldElement): void {
  applyThemeAttributeMap(element, CARD_THEME_ATTRIBUTE_MAP);
}
```

- [ ] **Step 6: Update `docs.mdx`**

Same restructuring as Task 4 Step 8, applied to `src/elements/foxy-payment-card-field/docs.mdx`'s attribute table — 10 old rows (`theme-background`, `theme-input-placeholder-color`, `theme-input-height`, `theme-input-padding`, `theme-input-padding-x`, `theme-input-padding-y`, `theme-font-sans`, `theme-input-text-color`, `theme-input-error-text-color`, `theme-input-font-size`) become 6 new rows (`theme-background-field`, `theme-color-secondary`, `theme-font-body`, `theme-color-body`, `theme-color-error`, `theme-size-control`, `theme-size-border-width` — note this is 7, one more than "6": `theme-background-field` is unique to this element's table, unlike `foxy-ach-field`'s, since only `foxy-payment-card-field` had a `theme-background` row to begin with). Read the full current table first (`cat src/elements/foxy-payment-card-field/docs.mdx`) since this session only confirmed a subset of rows verbatim, and there are also two "Reflects ..." prose rows per attribute (seen earlier: `<code>theme-background</code>` appears twice — once in the attributes table, once in a "reflected properties" table) — update both occurrences of every renamed attribute.

- [ ] **Step 7: Confirm no stale references remain**

Run: `grep -n "theme-input-\|theme-font-sans\b\|var(--" src/elements/foxy-payment-card-field/utils.ts src/elements/foxy-payment-card-field/docs.mdx src/elements/foxy-payment-card-field/element.stories.ts`
Expected: no matches.

- [ ] **Step 8: Visual check in Storybook**

Run: `npm run localdev:storybook`, open `foxy-payment-card-field`'s stories, confirm correct rendering and no console errors.

- [ ] **Step 9: Commit**

```bash
git add src/elements/foxy-payment-card-field/utils.ts src/elements/foxy-payment-card-field/docs.mdx
git commit -m "docs(payment-card-field): update Storybook helpers and API docs to new theme vocabulary

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Full-repo verification

**Files:** none (verification only)

- [ ] **Step 1: Repo-wide search for any remaining old vocabulary**

Run:
```bash
grep -rn "theme-input-height\|theme-input-padding\|theme-input-font-size\|theme-input-text-color\|theme-input-error-text-color\|theme-input-placeholder-color\|theme-font-sans\b\|theme-primary\b\|theme-primary-foreground\|theme-destructive\b\|theme-muted\b\|theme-muted-foreground\|theme-card\b\|theme-card-foreground\|theme-border\b\|theme-input\b\|theme-ring\b\|theme-radius\b\|theme-spacing\b\|theme-foreground\b\|theme-background\b\|getShadcnInputMetrics" src
```
Expected: no matches anywhere in `src/`.

- [ ] **Step 2: Full typecheck and test run**

Run: `npx tsc --noEmit -p tsconfig.app.json` (or this repo's `check`/`typecheck` script) and `npx vitest run`.
Expected: both pass with zero errors.

- [ ] **Step 3: No commit needed — verification only.**

This task exists to catch anything Tasks 1-6 missed (e.g. a story file, a snapshot, a comment) before this plan is considered done. If Step 1 finds anything, go back and fix it as part of the task that should have covered that file, then re-run Steps 1-2.
