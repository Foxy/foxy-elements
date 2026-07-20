import type { DesignSystemTheme } from "@foxy.io/design-system/theme";

// Recursively widens every literal string leaf of `DesignSystemTheme` to
// `string`. `DesignSystemTheme` (`typeof defaultTheme`) is inferred with
// literal types (e.g. `space.sm: "0.375rem"`), but at runtime the theme
// object elements actually provide to `ThemeProvider` has some of those
// leaves overridden with plain `string` values sourced from theme-* element
// attributes (see foxy-payment-method-selector/element.tsx's
// `#buildThemeTokens`, which merges `defaultTheme` with
// `getThemeProperty(...)` results typed as `string | undefined`). Widening
// here keeps the object shape (and autocomplete) intact while accepting
// either the literal defaults or an attribute-driven override.
type WidenThemeLeaves<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenThemeLeaves<U>[]
    : { [K in keyof T]: WidenThemeLeaves<T[K]> };

// The design system's ThemeProvider is fed `{ tokens: DesignSystemTheme }`
// (see foxy-payment-method-selector/element.tsx's `#buildThemeTokens`).
// styled-components' own `DefaultTheme` is an empty interface by default;
// augment it here so `props.theme.tokens.*` type-checks in styled-components
// templates across the codebase instead of only where a local theme type is
// threaded through manually.
declare module "styled-components" {
  export interface DefaultTheme {
    tokens: WidenThemeLeaves<DesignSystemTheme>;
  }
}
