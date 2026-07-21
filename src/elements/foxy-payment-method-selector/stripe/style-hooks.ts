import { useTheme } from "styled-components";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { deriveInputMetrics, parseFontShorthand } from "@/lib/theme-attribute-sync";
import type { DesignSystemTheme } from "@foxy.io/design-system/theme";

export type HostedFieldStyleAttributes = {
  inputHeight?: string;
  inputPadding?: string;
  inputPaddingX?: string;
  inputPaddingY?: string;
  inputBackground?: string;
  inputPlaceholderColor?: string;
  inputFont?: string;
  inputTextColor?: string;
  inputTextColorError?: string;
  inputTextSize?: string;
  inputLineHeight?: string;
};

type StripeAppearance = NonNullable<StripeElementsOptions["appearance"]>;
type StripeRules = NonNullable<StripeAppearance["rules"]>;
type StripeRuleInput = Record<string, Record<string, string>>;
type StripeFonts = NonNullable<StripeElementsOptions["fonts"]>;

const DEFAULT_STRIPE_APPEARANCE: StripeAppearance = {
  theme: "flat",
  inputs: "spaced",
  labels: "above",
};

export function sanitizeCssValue(value: string): string | undefined {
  const normalized = value.trim();
  if (!normalized) return undefined;
  // `;` and `{`/`}` let a value that is interpolated into raw CSS source text
  // (as opposed to a structured config object or a `var(--name, fallback)`
  // reference) break out of the declaration it was meant to fill and inject
  // new rules — e.g. `red}body{display:none` closes the current rule and
  // opens a new one, with no semicolon involved. No legitimate theme value
  // (colors, font shorthands, spacing/radius lengths) needs any of these
  // characters, so rejecting them outright is safe.
  //
  // `image-set(`/`-webkit-image-set(`/`image(`/`element(`/`src(` are all
  // <url>-equivalent or image-valued CSS functions that can reference an
  // external resource (a bare quoted URL, not necessarily wrapped in
  // `url(...)`) and are valid wherever `url(...)` is valid (e.g. a
  // `background:` sink) — so they must be blocked alongside `url(` for the
  // same reason. `src()` isn't supported in image contexts by any shipping
  // browser today, but per the CSS Values spec it's a defined `<url>`
  // equivalent, so it's blocked pre-emptively rather than waiting for that
  // to change. No legitimate theme value needs any of these.
  //
  // This is a blocklist, not an allowlist, and blocklists for CSS-function
  // syntax are inherently prone to missing the next url-equivalent the spec
  // adds. Do not treat this list as closed — if this sanitizer is going to
  // be relied on long-term, it should be replaced with an allowlist keyed to
  // expected value shape (color / length / a fixed set of known-safe
  // functions), not extended indefinitely one function name at a time.
  if (
    /(url\s*\(|@import|expression\s*\(|-webkit-image-set\s*\(|image-set\s*\(|image\s*\(|element\s*\(|src\s*\(|[;{}])/i.test(
      normalized,
    )
  )
    return undefined;
  return normalized;
}

// For call sites that interpolate a theme-derived value directly into raw CSS
// source text (e.g. a `<style>` tag's textContent), rather than into a
// structured config object whose fields are dropped individually when unset.
// A value that fails sanitization degrades to the given safe default instead
// of leaving a hole in the stylesheet or aborting the whole build.
export function sanitizeCssValueOrDefault(value: string, fallback: string): string {
  return sanitizeCssValue(value) ?? fallback;
}

function mergeStripeRules(
  ...ruleSets: Array<StripeRuleInput | undefined>
): StripeRules {
  const merged: StripeRuleInput = {};

  for (const ruleSet of ruleSets) {
    if (!ruleSet) continue;

    for (const [selector, declarations] of Object.entries(ruleSet)) {
      merged[selector] = {
        ...(merged[selector] ?? {}),
        ...declarations,
      };
    }
  }

  return merged as StripeRules;
}

function normalizeFontFamilyForStripe(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  if (/inter\s*variable/i.test(normalized)) {
    return "Inter, sans-serif";
  }

  return normalized;
}

export function extractColorFromShorthand(shorthand: string): string | undefined {
  const match = shorthand.match(/#[0-9a-fA-F]{3,8}$/);
  return match ? match[0] : undefined;
}

export function buildHostedFieldStyleAttributes(
  theme: DesignSystemTheme,
): HostedFieldStyleAttributes {
  const metrics = deriveInputMetrics({
    controlSize: theme.size.control,
    borderWidth: theme.size.borderWidth,
    fontBody: theme.font.body,
  });

  return {
    inputHeight: sanitizeCssValue(`${metrics.heightPx}px`),
    inputPadding: sanitizeCssValue(`${metrics.paddingY} ${metrics.paddingX}`),
    inputPaddingX: sanitizeCssValue(metrics.paddingX),
    inputPaddingY: sanitizeCssValue(metrics.paddingY),
    inputLineHeight: "1.25",
    inputBackground: sanitizeCssValue(theme.background.field),
    inputPlaceholderColor: sanitizeCssValue(theme.color.secondary),
    inputFont: sanitizeCssValue(metrics.fontFamily),
    inputTextColor: sanitizeCssValue(theme.color.body),
    inputTextColorError: sanitizeCssValue(theme.color.error),
    inputTextSize: sanitizeCssValue(metrics.fontSize),
  };
}

function buildStripeAppearanceFromTokens(theme: DesignSystemTheme): StripeAppearance {
  const metrics = deriveInputMetrics({
    controlSize: theme.size.control,
    borderWidth: theme.size.borderWidth,
    fontBody: theme.font.body,
  });
  const { fontFamily: rawFontFamily } = parseFontShorthand(theme.font.body);
  const fontFamily = normalizeFontFamilyForStripe(sanitizeCssValue(rawFontFamily));

  const colorPrimary = sanitizeCssValue(theme.color.primary);
  const colorBackground = sanitizeCssValue(theme.background.surface);
  const colorText = sanitizeCssValue(theme.color.body);
  const colorDanger = sanitizeCssValue(theme.color.error);
  const colorTextSecondary = sanitizeCssValue(theme.color.secondary);
  const borderColor = sanitizeCssValue(
    extractColorFromShorthand(theme.border.field) ?? theme.color.secondary,
  );
  const cardBackgroundColor = colorBackground;
  const colorPrimaryForeground = sanitizeCssValue(theme.color.onPrimary);
  const focusColor = sanitizeCssValue(
    extractColorFromShorthand(theme.outline.primary) ?? theme.color.primary,
  );

  const fontSizeBase = metrics.fontSize;
  const labelFontSize = metrics.fontSize;
  const spacingUnit = sanitizeCssValue(theme.space.md) ?? "0.5625rem";
  const gridSpacing = spacingUnit.replace(
    /^([\d.]+)(.*)$/,
    (_, n, u) => `${Number.parseFloat(n) * 5}${u}`,
  );
  const borderRadius = sanitizeCssValue(theme.borderRadius.sm);
  const inputPadding = `${metrics.paddingY} ${metrics.paddingX}`;

  const variables: NonNullable<StripeAppearance["variables"]> = {
    ...(colorPrimary ? { colorPrimary } : {}),
    ...(colorBackground ? { colorBackground } : {}),
    ...(colorText ? { colorText } : {}),
    ...(colorDanger ? { colorDanger } : {}),
    ...(colorPrimaryForeground
      ? { tabIconSelectedColor: colorPrimaryForeground, buttonColorText: colorPrimaryForeground }
      : {}),
    ...(colorTextSecondary
      ? {
          colorTextSecondary,
          colorTextPlaceholder: colorTextSecondary,
          tabIconColor: colorTextSecondary,
          tabIconMoreColor: colorTextSecondary,
          iconColor: colorTextSecondary,
        }
      : {}),
    ...(colorText
      ? {
          tabIconHoverColor: colorText,
          tabIconMoreHoverColor: colorText,
          iconHoverColor: colorText,
          iconMenuColor: colorText,
          iconMenuHoverColor: colorText,
          iconMenuOpenColor: colorText,
        }
      : {}),
    ...(fontFamily ? { fontFamily } : {}),
    fontSizeBase,
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    spacingUnit,
    gridColumnSpacing: gridSpacing,
    gridRowSpacing: gridSpacing,
    ...(borderRadius ? { borderRadius } : {}),
    ...(colorPrimary ? { buttonColorBackground: colorPrimary } : {}),
    ...(focusColor ? { focusBoxShadow: `0 0 0 2px ${focusColor}` } : {}),
  };

  const rules = mergeStripeRules(
    {
      ".Input": {
        padding: inputPadding,
        ...(fontFamily ? { fontFamily } : {}),
        fontSize: fontSizeBase,
        lineHeight: "1.25",
        ...(borderRadius ? { borderRadius } : {}),
      },
      ".Block": { boxShadow: "none" },
      ".Label": { ...(fontFamily ? { fontFamily } : {}), fontSize: labelFontSize, fontWeight: "500", marginBottom: "0.5rem" },
      ".Label--focused": { ...(fontFamily ? { fontFamily } : {}), fontSize: labelFontSize, fontWeight: "500" },
      ".Label--empty": { ...(fontFamily ? { fontFamily } : {}), fontSize: labelFontSize, fontWeight: "500" },
      ".Label--invalid": { ...(fontFamily ? { fontFamily } : {}), fontSize: labelFontSize, fontWeight: "500" },
      ".Label--floating": { ...(fontFamily ? { fontFamily } : {}), fontSize: labelFontSize, fontWeight: "500" },
      ".Label--resting": { ...(fontFamily ? { fontFamily } : {}), fontSize: labelFontSize, fontWeight: "500" },
      ".TabLabel": { fontSize: labelFontSize },
      ".TabLabel--selected": { fontSize: labelFontSize },
      ".TabLabel--selected:hover": { fontSize: labelFontSize },
    },
    borderColor
      ? {
          ".Tab": { border: `1px solid ${borderColor}` },
          ".Input": { border: `1px solid ${borderColor}` },
          ".Tab--selected": { border: `1px solid ${borderColor}` },
          ".CheckboxInput": { border: `1px solid ${borderColor}` },
        }
      : undefined,
    cardBackgroundColor
      ? {
          ".Block": { backgroundColor: cardBackgroundColor },
          ".Tab": { backgroundColor: cardBackgroundColor },
          ".Input": { backgroundColor: cardBackgroundColor },
        }
      : undefined,
    borderColor
      ? {
          ".Block": { border: `1px solid ${borderColor}` },
          ".BlockDivider": { backgroundColor: borderColor },
        }
      : undefined,
    borderRadius ? { ".Block": { borderRadius } } : undefined,
    colorPrimary
      ? {
          ".Tab--selected": { backgroundColor: colorPrimary },
          ".Tab--selected:hover": { backgroundColor: colorPrimary },
        }
      : undefined,
    colorText
      ? {
          ".Link": { color: colorText },
          ".SecondaryLink": { color: colorText },
          ".TermsLink": { color: colorText },
          ".Action": { color: colorText },
          ".Tab": { color: colorText },
          ".TabLabel": { color: colorText },
          ".Tab--selected": { color: colorText },
          ".Tab--selected:hover": { color: colorText },
          ".TabLabel--selected": { color: colorText },
          ".TabIcon": { color: colorText, fill: colorText },
          ".TabIcon--selected": { color: colorText, fill: colorText },
          ".Button": { color: colorText },
          ".MenuIcon": { fill: colorText },
          ".MenuIcon--open": { fill: colorText },
        }
      : undefined,
    colorPrimaryForeground
      ? {
          ".Tab--selected": { color: colorPrimaryForeground },
          ".Tab--selected:hover": { color: colorPrimaryForeground },
          ".TabLabel--selected": { color: colorPrimaryForeground },
          ".TabLabel--selected:hover": { color: colorPrimaryForeground },
          ".TabIcon--selected": { color: colorPrimaryForeground, fill: colorPrimaryForeground },
        }
      : undefined,
    focusColor
      ? {
          ".Input:focus": { boxShadow: `0 0 0 2px ${focusColor}` },
          ".Tab--selected": { boxShadow: `0 0 0 2px ${focusColor}` },
        }
      : undefined,
    colorDanger
      ? {
          ".Input--invalid": { boxShadow: `0 0 0 2px ${colorDanger}` },
          ".Error": { color: colorDanger },
        }
      : undefined,
  );

  return { ...DEFAULT_STRIPE_APPEARANCE, variables, rules };
}

function getStripeFonts(
  appearanceFontFamily: string | undefined,
  configuredFonts: StripeFonts | undefined,
): StripeFonts | undefined {
  if (configuredFonts && configuredFonts.length) return configuredFonts;

  if (appearanceFontFamily?.toLowerCase().includes("inter")) {
    return [
      {
        cssSrc:
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ];
  }

  return undefined;
}

export function getStripeFontsForAppearance(
  appearance: StripeElementsOptions["appearance"] | undefined,
  configuredFonts?: StripeFonts,
): StripeFonts | undefined {
  const appearanceFontFamily =
    appearance?.variables && "fontFamily" in appearance.variables
      ? String(appearance.variables.fontFamily)
      : undefined;
  return getStripeFonts(appearanceFontFamily, configuredFonts);
}

export function mergeStripeAppearance(
  baseAppearance: StripeAppearance,
  configuredAppearance: StripeElementsOptions["appearance"] | undefined,
): StripeAppearance {
  if (!configuredAppearance) {
    return baseAppearance;
  }

  return {
    ...baseAppearance,
    ...configuredAppearance,
    variables: {
      ...(baseAppearance.variables ?? {}),
      ...(configuredAppearance.variables ?? {}),
    },
    rules: {
      ...(baseAppearance.rules ?? {}),
      ...(configuredAppearance.rules ?? {}),
    },
  };
}

export function resolveDesignTokens(theme: DesignSystemTheme) {
  return {
    primary: sanitizeCssValue(theme.color.primary),
    background: sanitizeCssValue(theme.background.field),
    foreground: sanitizeCssValue(theme.color.body),
    destructive: sanitizeCssValue(theme.color.error),
    mutedForeground: sanitizeCssValue(theme.color.secondary),
    border: sanitizeCssValue(extractColorFromShorthand(theme.border.field) ?? theme.color.secondary),
    radius: sanitizeCssValue(theme.borderRadius.sm),
  };
}

export function useHostedFieldStyleAttributes(): HostedFieldStyleAttributes {
  const { tokens } = useTheme() as { tokens: DesignSystemTheme };
  return buildHostedFieldStyleAttributes(tokens);
}

export function useResolvedHostedFieldStyleAttributes(): {
  ready: boolean;
  styleAttributes: HostedFieldStyleAttributes;
} {
  const { tokens } = useTheme() as { tokens: DesignSystemTheme };
  return { ready: true, styleAttributes: buildHostedFieldStyleAttributes(tokens) };
}

export function useStripeTokenAppearance(enabled: boolean) {
  const { tokens } = useTheme() as { tokens: DesignSystemTheme };

  const appearance = enabled
    ? buildStripeAppearanceFromTokens(tokens)
    : DEFAULT_STRIPE_APPEARANCE;
  const appearanceSignature = JSON.stringify(appearance);

  return { appearance, appearanceSignature };
}
