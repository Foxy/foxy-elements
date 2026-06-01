import { useLayoutEffect, useRef, useState } from "react";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { FIELD_STYLE_PROBE_CLASS_NAME } from "../constants";

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

type HostedFieldStyleResolutionOptions = {
  inputTextColorFallbackVariable?: string;
  inputTextSizeFallbackVariable?: string;
};

type ResolvedPaddingValue = {
  value?: string;
  x?: string;
  y?: string;
};

const DEFAULT_STRIPE_APPEARANCE: StripeAppearance = {
  theme: "flat",
  inputs: "spaced",
  labels: "above",
};

function normalizeToPixelValue(value: string): string | undefined {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return `${Math.round(parsed * 1000) / 1000}px`;
}

export function sanitizeCssValue(value: string): string | undefined {
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (/(url\s*\(|@import|expression\s*\(|;)/i.test(normalized))
    return undefined;
  return normalized;
}

function areStyleAttributesEqual(
  left: HostedFieldStyleAttributes,
  right: HostedFieldStyleAttributes,
): boolean {
  return (
    left.inputHeight === right.inputHeight &&
    left.inputPadding === right.inputPadding &&
    left.inputPaddingX === right.inputPaddingX &&
    left.inputPaddingY === right.inputPaddingY &&
    left.inputBackground === right.inputBackground &&
    left.inputPlaceholderColor === right.inputPlaceholderColor &&
    left.inputFont === right.inputFont &&
    left.inputTextColor === right.inputTextColor &&
    left.inputTextColorError === right.inputTextColorError &&
    left.inputTextSize === right.inputTextSize &&
    left.inputLineHeight === right.inputLineHeight
  );
}

function resolveNearestShadowHost(
  probeElement: HTMLElement,
): HTMLElement | null {
  let current: HTMLElement | null = probeElement.parentElement;

  while (current) {
    if (current.shadowRoot) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function resolveProbeAttachmentTarget(
  probeElement: HTMLElement,
): HTMLElement | ShadowRoot {
  const nearestShadowHost = resolveNearestShadowHost(probeElement);
  if (nearestShadowHost?.shadowRoot) {
    return nearestShadowHost.shadowRoot;
  }

  const parentElement = probeElement.parentElement;
  if (parentElement) {
    return parentElement;
  }

  const rootNode = probeElement.getRootNode();
  if (rootNode instanceof ShadowRoot) {
    return rootNode;
  }

  return probeElement.ownerDocument.body;
}

function appendProbeElement(
  probeElement: HTMLElement,
  probeNode: HTMLElement,
): void {
  resolveProbeAttachmentTarget(probeElement).append(probeNode);
}

function resolveProbeQueryRoot(probeElement: HTMLElement): ParentNode {
  const rootNode = probeElement.getRootNode();
  if (rootNode instanceof ShadowRoot) {
    return rootNode;
  }

  const nearestShadowHost = resolveNearestShadowHost(probeElement);
  if (nearestShadowHost?.shadowRoot) {
    return nearestShadowHost.shadowRoot;
  }

  return probeElement.ownerDocument;
}

function resolveCssVariableColor(
  probeElement: HTMLElement,
  variableName: string,
): string | undefined {
  if (!getCssVariableValue(getComputedStyle(probeElement), variableName)) {
    return undefined;
  }

  const ownerDocument = probeElement.ownerDocument;
  const colorProbe = ownerDocument.createElement("span");
  colorProbe.style.position = "absolute";
  colorProbe.style.opacity = "0";
  colorProbe.style.pointerEvents = "none";
  colorProbe.style.color = `var(${variableName})`;

  appendProbeElement(probeElement, colorProbe);

  const resolved = sanitizeCssValue(getComputedStyle(colorProbe).color);
  colorProbe.remove();

  return normalizeColorForStripe(probeElement, resolved);
}

function parseOklchColor(value: string): {
  lightness: number;
  chroma: number;
  hue: number;
  alpha?: number;
} | null {
  const match = value
    .trim()
    .match(
      /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
    );

  if (!match) return null;

  const [, lightnessRaw, chromaRaw, hueRaw, alphaRaw] = match;
  const lightness = lightnessRaw.endsWith("%")
    ? Number.parseFloat(lightnessRaw) / 100
    : Number.parseFloat(lightnessRaw);
  const chroma = Number.parseFloat(chromaRaw);
  const hue = Number.parseFloat(hueRaw);
  const alpha = alphaRaw
    ? alphaRaw.endsWith("%")
      ? Number.parseFloat(alphaRaw) / 100
      : Number.parseFloat(alphaRaw)
    : undefined;

  if (![lightness, chroma, hue].every(Number.isFinite)) return null;
  if (alpha !== undefined && !Number.isFinite(alpha)) return null;

  return { lightness, chroma, hue, alpha };
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function linearToSrgb(value: number): number {
  if (value <= 0.0031308) return 12.92 * value;
  return 1.055 * value ** (1 / 2.4) - 0.055;
}

function convertOklchToRgbString(value: string): string | undefined {
  const parsed = parseOklchColor(value);
  if (!parsed) return undefined;

  const h = (parsed.hue * Math.PI) / 180;
  const a = parsed.chroma * Math.cos(h);
  const b = parsed.chroma * Math.sin(h);

  const lPrime = parsed.lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = parsed.lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = parsed.lightness - 0.0894841775 * a - 1.291485548 * b;

  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;

  const rLinear = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const r = Math.round(clamp01(linearToSrgb(rLinear)) * 255);
  const g = Math.round(clamp01(linearToSrgb(gLinear)) * 255);
  const bChannel = Math.round(clamp01(linearToSrgb(bLinear)) * 255);

  if (parsed.alpha !== undefined && parsed.alpha < 1) {
    const alpha = Math.round(clamp01(parsed.alpha) * 1000) / 1000;
    return `rgba(${r}, ${g}, ${bChannel}, ${alpha})`;
  }

  return `rgb(${r}, ${g}, ${bChannel})`;
}

function normalizeColorForStripe(
  probeElement: HTMLElement,
  value: string | undefined,
): string | undefined {
  const sanitized = value ? sanitizeCssValue(value) : undefined;
  if (!sanitized) return undefined;
  if (/^oklch\(/i.test(sanitized)) {
    const converted = convertOklchToRgbString(sanitized);
    if (converted) return converted;
  }
  if (/^(#|rgb\(|hsl\()/i.test(sanitized)) return sanitized;

  const ownerDocument = probeElement.ownerDocument;
  const canvas = ownerDocument.createElement("canvas");
  const context = canvas.getContext("2d");

  if (context) {
    context.fillStyle = "#000000";
    context.fillStyle = sanitized;
    const canvasColor = sanitizeCssValue(context.fillStyle);
    if (canvasColor && /^(#|rgb\(|hsl\()/i.test(canvasColor)) {
      return canvasColor;
    }
  }

  const fallbackProbe = ownerDocument.createElement("span");
  fallbackProbe.style.position = "absolute";
  fallbackProbe.style.opacity = "0";
  fallbackProbe.style.pointerEvents = "none";
  fallbackProbe.style.color = sanitized;

  appendProbeElement(probeElement, fallbackProbe);

  const computedColor = sanitizeCssValue(getComputedStyle(fallbackProbe).color);
  fallbackProbe.remove();

  if (computedColor && /^(#|rgb\(|hsl\()/i.test(computedColor)) {
    return computedColor;
  }

  return undefined;
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

function getCssVariableValue(
  style: CSSStyleDeclaration,
  name: string,
): string | undefined {
  return sanitizeCssValue(style.getPropertyValue(name));
}

function resolveCssVariableLength(
  probeElement: HTMLElement,
  variableName: string,
  cssProperty: "borderRadius" | "padding" | "fontSize" | "height",
): string | undefined {
  if (!getCssVariableValue(getComputedStyle(probeElement), variableName)) {
    return undefined;
  }

  const ownerDocument = probeElement.ownerDocument;
  const lengthProbe = ownerDocument.createElement("span");
  lengthProbe.style.position = "absolute";
  lengthProbe.style.opacity = "0";
  lengthProbe.style.pointerEvents = "none";
  lengthProbe.style[cssProperty] = `var(${variableName})`;

  appendProbeElement(probeElement, lengthProbe);

  const resolved = sanitizeCssValue(getComputedStyle(lengthProbe)[cssProperty]);
  lengthProbe.remove();

  return resolved;
}

function resolveCssVariablePadding(
  probeElement: HTMLElement,
  variableName: string,
): ResolvedPaddingValue | undefined {
  if (!getCssVariableValue(getComputedStyle(probeElement), variableName)) {
    return undefined;
  }

  const ownerDocument = probeElement.ownerDocument;
  const paddingProbe = ownerDocument.createElement("span");
  paddingProbe.style.position = "absolute";
  paddingProbe.style.opacity = "0";
  paddingProbe.style.pointerEvents = "none";
  paddingProbe.style.padding = `var(${variableName})`;

  appendProbeElement(probeElement, paddingProbe);

  const style = getComputedStyle(paddingProbe);
  const result = {
    value: sanitizeCssValue(style.padding),
    x: sanitizeCssValue(style.paddingRight),
    y: sanitizeCssValue(style.paddingTop),
  };
  paddingProbe.remove();

  return result;
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

function resolveReferenceInputStyle(probeElement: HTMLElement) {
  const queryRoot = resolveProbeQueryRoot(probeElement);
  const referenceInput = queryRoot.querySelector<HTMLElement>(
    "[data-foxy-field-style-probe='true'], [data-slot='input']",
  );
  if (!referenceInput) return undefined;

  const style = getComputedStyle(referenceInput);
  return {
    source: "reference" as const,
    fontFamily: sanitizeCssValue(style.fontFamily),
    fontSize: sanitizeCssValue(style.fontSize),
    lineHeight: sanitizeCssValue(style.lineHeight),
    borderRadius: sanitizeCssValue(style.borderRadius),
    paddingTop: sanitizeCssValue(style.paddingTop),
    paddingRight: sanitizeCssValue(style.paddingRight),
    paddingBottom: sanitizeCssValue(style.paddingBottom),
    paddingLeft: sanitizeCssValue(style.paddingLeft),
    height: sanitizeCssValue(style.height),
  };
}

function resolveInputProbeStyle(probeElement: HTMLElement) {
  const ownerDocument = probeElement.ownerDocument;
  const inputProbe = ownerDocument.createElement("input");
  inputProbe.type = "text";
  inputProbe.className = FIELD_STYLE_PROBE_CLASS_NAME;
  inputProbe.style.fontFamily = "var(--font-sans)";
  inputProbe.style.position = "absolute";
  inputProbe.style.opacity = "0";
  inputProbe.style.pointerEvents = "none";

  appendProbeElement(probeElement, inputProbe);

  const style = getComputedStyle(inputProbe);
  const result = {
    fontFamily: sanitizeCssValue(style.fontFamily),
    fontSize: sanitizeCssValue(style.fontSize),
    lineHeight: sanitizeCssValue(style.lineHeight),
    borderRadius: sanitizeCssValue(style.borderRadius),
    paddingTop: sanitizeCssValue(style.paddingTop),
    paddingRight: sanitizeCssValue(style.paddingRight),
    paddingBottom: sanitizeCssValue(style.paddingBottom),
    paddingLeft: sanitizeCssValue(style.paddingLeft),
  };

  inputProbe.remove();
  return result;
}

function readHostedFieldStyleAttributes(
  probeElement: HTMLElement,
  options: HostedFieldStyleResolutionOptions = {},
): HostedFieldStyleAttributes {
  const anchorStyle = getComputedStyle(probeElement);
  const ownerDocument = probeElement.ownerDocument;
  const inputProbe = ownerDocument.createElement("input");
  inputProbe.type = "text";
  inputProbe.className = FIELD_STYLE_PROBE_CLASS_NAME;
  inputProbe.style.fontFamily = "var(--font-sans)";
  inputProbe.style.position = "absolute";
  inputProbe.style.opacity = "0";
  inputProbe.style.pointerEvents = "none";

  appendProbeElement(probeElement, inputProbe);

  const style = getComputedStyle(inputProbe);
  const placeholderStyle = getComputedStyle(inputProbe, "::placeholder");
  const inputPaddingVariable = resolveCssVariablePadding(
    probeElement,
    "--input-padding",
  );
  const inputHeight =
    resolveCssVariableLength(probeElement, "--input-height", "height") ??
    normalizeToPixelValue(style.height);
  const inputPadding =
    inputPaddingVariable?.value ??
    getCssVariableValue(anchorStyle, "--input-padding");
  const inputPaddingY =
    resolveCssVariableLength(probeElement, "--input-padding-y", "padding") ??
    inputPaddingVariable?.y ??
    normalizeToPixelValue(style.paddingTop);
  const inputPaddingX =
    resolveCssVariableLength(probeElement, "--input-padding-x", "padding") ??
    inputPaddingVariable?.x ??
    normalizeToPixelValue(style.paddingRight);

  const attributes: HostedFieldStyleAttributes = {
    inputHeight,
    inputPadding:
      inputPadding ??
      (inputPaddingY && inputPaddingX
        ? `${inputPaddingY} ${inputPaddingX}`
        : undefined),
    inputPaddingX,
    inputPaddingY,
    inputBackground: sanitizeCssValue(style.backgroundColor),
    inputPlaceholderColor:
      resolveCssVariableColor(probeElement, "--input-placeholder-color") ??
      resolveCssVariableColor(probeElement, "--muted-foreground") ??
      sanitizeCssValue(placeholderStyle.color),
    inputFont: sanitizeCssValue(style.fontFamily),
    inputTextColor:
      resolveCssVariableColor(probeElement, "--input-text-color") ??
      (options.inputTextColorFallbackVariable
        ? resolveCssVariableColor(
            probeElement,
            options.inputTextColorFallbackVariable,
          )
        : undefined) ??
      sanitizeCssValue(style.color),
    inputTextColorError:
      resolveCssVariableColor(probeElement, "--input-error-text-color") ??
      resolveCssVariableColor(probeElement, "--destructive"),
    inputTextSize:
      resolveCssVariableLength(probeElement, "--input-font-size", "fontSize") ??
      (options.inputTextSizeFallbackVariable
        ? resolveCssVariableLength(
            probeElement,
            options.inputTextSizeFallbackVariable,
            "fontSize",
          )
        : undefined) ??
      normalizeToPixelValue(style.fontSize),
    inputLineHeight: sanitizeCssValue(style.lineHeight),
  };

  inputProbe.remove();
  return attributes;
}

function buildStripeAppearanceFromTokens(
  probeElement: HTMLElement,
): StripeAppearance {
  const style = getComputedStyle(probeElement);
  const referenceInputStyle = resolveReferenceInputStyle(probeElement);
  const fallbackProbeStyle = resolveInputProbeStyle(probeElement);
  const inputStyle = referenceInputStyle ?? {
    source: "probe" as const,
    ...fallbackProbeStyle,
    height: undefined,
  };

  const colorPrimary = resolveCssVariableColor(probeElement, "--primary");
  const colorBackground = resolveCssVariableColor(probeElement, "--background");
  const colorText = resolveCssVariableColor(probeElement, "--foreground");
  const colorDanger = resolveCssVariableColor(probeElement, "--destructive");
  const colorTextSecondary = resolveCssVariableColor(
    probeElement,
    "--muted-foreground",
  );
  const borderColor = resolveCssVariableColor(probeElement, "--border");
  const cardBackgroundColor = resolveCssVariableColor(probeElement, "--card");
  const colorPrimaryForeground = resolveCssVariableColor(
    probeElement,
    "--primary-foreground",
  );
  const focusColor =
    resolveCssVariableColor(probeElement, "--ring") ?? colorPrimary;
  const selectedTextColor = colorPrimaryForeground ?? colorText;

  const rootFontFamily = sanitizeCssValue(style.fontFamily);
  const rawFontFamily =
    inputStyle.fontFamily ??
    rootFontFamily ??
    getCssVariableValue(style, "--font-sans");
  const fontFamily = normalizeFontFamilyForStripe(rawFontFamily);
  const rootFontSize = sanitizeCssValue(style.fontSize);
  const preferredFontSize = inputStyle.fontSize ?? rootFontSize ?? "14px";
  const labelFontSize = preferredFontSize;
  const fontSizeBase = preferredFontSize;
  const spacingUnit = getCssVariableValue(style, "--spacing");
  const gridSpacing = spacingUnit
    ? spacingUnit.replace(
        /^([\d.]+)(.*)$/,
        (_, n, u) => `${parseFloat(n) * 5}${u}`,
      )
    : "1.25rem";
  const radiusToken = resolveCssVariableLength(
    probeElement,
    "--radius",
    "borderRadius",
  );
  const borderRadius =
    inputStyle.borderRadius && inputStyle.borderRadius !== "0px"
      ? inputStyle.borderRadius
      : radiusToken;
  const inputPaddingVertical =
    inputStyle.paddingTop ?? inputStyle.paddingBottom ?? "4px";
  const inputPaddingHorizontal =
    inputStyle.paddingRight ?? inputStyle.paddingLeft ?? "10px";
  const inputPadding = `${inputPaddingVertical} ${inputPaddingHorizontal}`;

  const variables: NonNullable<StripeAppearance["variables"]> = {
    ...(colorPrimary
      ? { colorPrimary }
      : focusColor
        ? { colorPrimary: focusColor }
        : {}),
    ...(colorBackground ? { colorBackground } : {}),
    ...(colorText ? { colorText } : {}),
    ...(colorDanger ? { colorDanger } : {}),
    ...(selectedTextColor
      ? {
          tabIconSelectedColor: selectedTextColor,
          buttonColorText: selectedTextColor,
        }
      : {}),
    ...(colorTextSecondary
      ? { colorTextSecondary, colorTextPlaceholder: colorTextSecondary }
      : {}),
    ...(colorTextSecondary
      ? {
          tabIconColor: colorTextSecondary,
          tabIconMoreColor: colorTextSecondary,
          iconColor: colorTextSecondary,
        }
      : {}),
    ...(colorText
      ? {
          tabIconHoverColor: colorText,
          tabIconSelectedColor: colorText,
          tabIconMoreHoverColor: colorText,
          iconHoverColor: colorText,
          iconMenuColor: colorText,
          iconMenuHoverColor: colorText,
          iconMenuOpenColor: colorText,
        }
      : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(fontSizeBase ? { fontSizeBase } : {}),
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    ...(spacingUnit ? { spacingUnit } : {}),
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
        ...(preferredFontSize ? { fontSize: preferredFontSize } : {}),
        ...(inputStyle.lineHeight ? { lineHeight: inputStyle.lineHeight } : {}),
        ...(borderRadius ? { borderRadius } : {}),
      },
      ".Block": {
        boxShadow: "none",
      },
      ".Label": {
        ...(fontFamily ? { fontFamily } : {}),
        ...(labelFontSize ? { fontSize: labelFontSize } : {}),
        fontWeight: "500",
        marginBottom: "0.5rem",
      },
      ".Label--focused": {
        ...(fontFamily ? { fontFamily } : {}),
        ...(labelFontSize ? { fontSize: labelFontSize } : {}),
        fontWeight: "500",
      },
      ".Label--empty": {
        ...(fontFamily ? { fontFamily } : {}),
        ...(labelFontSize ? { fontSize: labelFontSize } : {}),
        fontWeight: "500",
      },
      ".Label--invalid": {
        ...(fontFamily ? { fontFamily } : {}),
        ...(labelFontSize ? { fontSize: labelFontSize } : {}),
        fontWeight: "500",
      },
      ".Label--floating": {
        ...(fontFamily ? { fontFamily } : {}),
        ...(labelFontSize ? { fontSize: labelFontSize } : {}),
        fontWeight: "500",
      },
      ".Label--resting": {
        ...(fontFamily ? { fontFamily } : {}),
        ...(labelFontSize ? { fontSize: labelFontSize } : {}),
        fontWeight: "500",
      },
      ".TabLabel": {
        ...(labelFontSize ? { fontSize: labelFontSize } : {}),
      },
      ".TabLabel--selected": {
        ...(labelFontSize ? { fontSize: labelFontSize } : {}),
      },
      ".TabLabel--selected:hover": {
        ...(labelFontSize ? { fontSize: labelFontSize } : {}),
      },
    },
    borderColor
      ? {
          ".Tab": {
            border: `1px solid ${borderColor}`,
          },
          ".Input": {
            border: `1px solid ${borderColor}`,
          },
          ".Tab--selected": {
            border: `1px solid ${borderColor}`,
          },
        }
      : undefined,
    cardBackgroundColor
      ? {
          ".Block": {
            backgroundColor: cardBackgroundColor,
          },
          ".Tab": {
            backgroundColor: cardBackgroundColor,
          },
          ".Input": {
            backgroundColor: cardBackgroundColor,
          },
        }
      : undefined,
    borderColor
      ? {
          ".Block": {
            border: `1px solid ${borderColor}`,
          },
          ".BlockDivider": {
            backgroundColor: borderColor,
          },
        }
      : undefined,
    borderRadius
      ? {
          ".Block": {
            borderRadius,
          },
        }
      : undefined,
    colorPrimary
      ? {
          ".Tab--selected": {
            backgroundColor: colorPrimary,
          },
          ".Tab--selected:hover": {
            backgroundColor: colorPrimary,
          },
        }
      : undefined,
    colorText
      ? {
          ".Link": {
            color: colorText,
          },
          ".SecondaryLink": {
            color: colorText,
          },
          ".TermsLink": {
            color: colorText,
          },
          ".Action": {
            color: colorText,
          },
          ".Tab": {
            color: colorText,
          },
          ".TabLabel": {
            color: colorText,
          },
          ".Tab--selected": {
            color: colorText,
          },
          ".Tab--selected:hover": {
            color: colorText,
          },
          ".TabLabel--selected": {
            color: colorText,
          },
          ".TabIcon": {
            color: colorText,
            fill: colorText,
          },
          ".TabIcon--selected": {
            color: colorText,
            fill: colorText,
          },
          ".Button": {
            color: colorText,
          },
          ".MenuIcon": {
            fill: colorText,
          },
          ".MenuIcon--open": {
            fill: colorText,
          },
        }
      : undefined,
    colorPrimaryForeground
      ? {
          ".Tab--selected": {
            color: colorPrimaryForeground,
          },
          ".Tab--selected:hover": {
            color: colorPrimaryForeground,
          },
          ".TabLabel--selected": {
            color: colorPrimaryForeground,
          },
          ".TabLabel--selected:hover": {
            color: colorPrimaryForeground,
          },
          ".TabIcon--selected": {
            color: colorPrimaryForeground,
            fill: colorPrimaryForeground,
          },
        }
      : undefined,
    focusColor
      ? {
          ".Input:focus": {
            boxShadow: `0 0 0 2px ${focusColor}`,
          },
          ".Tab--selected": {
            boxShadow: `0 0 0 2px ${focusColor}`,
          },
        }
      : undefined,
    colorDanger
      ? {
          ".Input--invalid": {
            boxShadow: `0 0 0 2px ${colorDanger}`,
          },
          ".Error": {
            color: colorDanger,
          },
        }
      : undefined,
  );

  return {
    ...DEFAULT_STRIPE_APPEARANCE,
    variables,
    rules,
  };
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

export function useHostedFieldStyleAttributes() {
  const probeRef = useRef<HTMLInputElement | null>(null);
  const [styleAttributes, setStyleAttributes] =
    useState<HostedFieldStyleAttributes>({});

  useLayoutEffect(() => {
    const readStyleAttributes = () => {
      const probeElement = probeRef.current;
      if (!probeElement) return;

      const nextAttributes = readHostedFieldStyleAttributes(probeElement);

      setStyleAttributes((previousAttributes) =>
        areStyleAttributesEqual(previousAttributes, nextAttributes)
          ? previousAttributes
          : nextAttributes,
      );
    };

    readStyleAttributes();

    const rootObserver = new MutationObserver(() => readStyleAttributes());
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    window.addEventListener("resize", readStyleAttributes);

    return () => {
      rootObserver.disconnect();
      window.removeEventListener("resize", readStyleAttributes);
    };
  }, []);

  return { probeRef, styleAttributes };
}

export function useResolvedHostedFieldStyleAttributes(
  options: HostedFieldStyleResolutionOptions = {},
) {
  const probeRef = useRef<HTMLDivElement | null>(null);
  const [styleAttributes, setStyleAttributes] =
    useState<HostedFieldStyleAttributes>({});
  const [ready, setReady] = useState(false);
  const { inputTextColorFallbackVariable, inputTextSizeFallbackVariable } =
    options;

  useLayoutEffect(() => {
    const probeElement = probeRef.current;
    if (!probeElement) return;

    const readStyleAttributes = () => {
      const nextAttributes = readHostedFieldStyleAttributes(probeElement, {
        inputTextColorFallbackVariable,
        inputTextSizeFallbackVariable,
      });
      setStyleAttributes((previousAttributes) =>
        areStyleAttributesEqual(previousAttributes, nextAttributes)
          ? previousAttributes
          : nextAttributes,
      );
      setReady(true);
    };

    readStyleAttributes();

    const observers: MutationObserver[] = [];
    const observeAttributes = (element: Element | null) => {
      if (!element) return;

      const observer = new MutationObserver(() => readStyleAttributes());
      observer.observe(element, {
        attributes: true,
        attributeFilter: ["class", "style"],
      });
      observers.push(observer);
    };

    observeAttributes(document.documentElement);
    observeAttributes(resolveNearestShadowHost(probeElement));
    window.addEventListener("resize", readStyleAttributes);

    return () => {
      for (const observer of observers) observer.disconnect();
      window.removeEventListener("resize", readStyleAttributes);
    };
  }, [inputTextColorFallbackVariable, inputTextSizeFallbackVariable]);

  return { probeRef, ready, styleAttributes };
}

export function useStripeTokenAppearance(enabled: boolean) {
  const probeRef = useRef<HTMLDivElement | null>(null);
  const [appearanceState, setAppearanceState] = useState(() => {
    const signature = JSON.stringify(DEFAULT_STRIPE_APPEARANCE);
    return { appearance: DEFAULT_STRIPE_APPEARANCE, signature };
  });

  useLayoutEffect(() => {
    if (!enabled) {
      setAppearanceState((previousState) => {
        const signature = JSON.stringify(DEFAULT_STRIPE_APPEARANCE);
        if (previousState.signature === signature) return previousState;
        return { appearance: DEFAULT_STRIPE_APPEARANCE, signature };
      });
      return;
    }

    const readAppearance = () => {
      const probeElement = probeRef.current;
      if (!probeElement) return;

      const appearance = buildStripeAppearanceFromTokens(probeElement);
      const signature = JSON.stringify(appearance);

      setAppearanceState((previousState) =>
        previousState.signature === signature
          ? previousState
          : { appearance, signature },
      );
    };

    readAppearance();

    const rootObserver = new MutationObserver(() => readAppearance());
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    window.addEventListener("resize", readAppearance);

    return () => {
      rootObserver.disconnect();
      window.removeEventListener("resize", readAppearance);
    };
  }, [enabled]);

  return {
    probeRef,
    appearance: appearanceState.appearance,
    appearanceSignature: appearanceState.signature,
  };
}
