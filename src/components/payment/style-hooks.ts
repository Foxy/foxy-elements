import { useLayoutEffect, useRef, useState } from "react";
import type { StripeElementsOptions } from "@stripe/stripe-js";

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
    left.inputTextSize === right.inputTextSize
  );
}

function resolveCssVariableColor(
  probeElement: HTMLElement,
  variableName: string,
): string | undefined {
  const ownerDocument = probeElement.ownerDocument;
  const colorProbe = ownerDocument.createElement("span");
  colorProbe.style.position = "absolute";
  colorProbe.style.opacity = "0";
  colorProbe.style.pointerEvents = "none";
  colorProbe.style.color = `var(${variableName})`;

  const rootNode = probeElement.getRootNode();
  if (rootNode instanceof ShadowRoot) {
    rootNode.append(colorProbe);
  } else {
    ownerDocument.body.append(colorProbe);
  }

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

  const rootNode = probeElement.getRootNode();
  if (rootNode instanceof ShadowRoot) {
    rootNode.append(fallbackProbe);
  } else {
    ownerDocument.body.append(fallbackProbe);
  }

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
  cssProperty: "borderRadius" | "padding" | "fontSize",
): string | undefined {
  const ownerDocument = probeElement.ownerDocument;
  const lengthProbe = ownerDocument.createElement("span");
  lengthProbe.style.position = "absolute";
  lengthProbe.style.opacity = "0";
  lengthProbe.style.pointerEvents = "none";
  lengthProbe.style[cssProperty] = `var(${variableName})`;

  const rootNode = probeElement.getRootNode();
  if (rootNode instanceof ShadowRoot) {
    rootNode.append(lengthProbe);
  } else {
    ownerDocument.body.append(lengthProbe);
  }

  const resolved = sanitizeCssValue(getComputedStyle(lengthProbe)[cssProperty]);
  lengthProbe.remove();

  return resolved;
}

function incrementPx(
  value: string | undefined,
  increment: number,
): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized.endsWith("px")) return undefined;
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return undefined;
  return `${parsed + increment}px`;
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
  const rootNode = probeElement.getRootNode();
  const queryRoot =
    rootNode instanceof ShadowRoot ? rootNode : probeElement.ownerDocument;
  const referenceInput = queryRoot.querySelector<HTMLElement>(
    "[data-slot='input']",
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
  inputProbe.className =
    "h-8 rounded-lg border px-2.5 py-1 text-base md:text-sm font-sans";
  inputProbe.style.position = "absolute";
  inputProbe.style.opacity = "0";
  inputProbe.style.pointerEvents = "none";

  const rootNode = probeElement.getRootNode();
  if (rootNode instanceof ShadowRoot) {
    rootNode.append(inputProbe);
  } else {
    ownerDocument.body.append(inputProbe);
  }

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
    incrementPx(inputStyle.paddingTop, 1) ??
    incrementPx(inputStyle.paddingBottom, 1) ??
    "5px";
  const inputPaddingHorizontal =
    inputStyle.paddingRight ?? inputStyle.paddingLeft ?? "10px";
  const inputPadding = `${inputPaddingVertical} ${inputPaddingHorizontal}`;

  const variables: NonNullable<StripeAppearance["variables"]> = {
    ...(focusColor
      ? { colorPrimary: focusColor }
      : colorPrimary
        ? { colorPrimary }
        : {}),
    ...(colorBackground ? { colorBackground } : {}),
    ...(colorText ? { colorText } : {}),
    ...(colorDanger ? { colorDanger } : {}),
    ...(colorText
      ? {
          tabIconSelectedColor: colorText,
          buttonColorText: colorText,
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
    fontWeightNormal: "500",
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

      const style = getComputedStyle(probeElement);
      const placeholderStyle = getComputedStyle(probeElement, "::placeholder");
      const inputHeight = normalizeToPixelValue(style.height);
      const inputPaddingY = normalizeToPixelValue(style.paddingTop);
      const inputPaddingX = normalizeToPixelValue(style.paddingRight);

      const nextAttributes: HostedFieldStyleAttributes = {
        inputHeight,
        inputPadding:
          inputPaddingY && inputPaddingX
            ? `${inputPaddingY} ${inputPaddingX}`
            : undefined,
        inputPaddingX,
        inputPaddingY,
        inputBackground: sanitizeCssValue(style.backgroundColor),
        inputPlaceholderColor:
          sanitizeCssValue(placeholderStyle.color) ??
          resolveCssVariableColor(probeElement, "--muted-foreground"),
        inputFont: sanitizeCssValue(style.fontFamily),
        inputTextColor: sanitizeCssValue(style.color),
        inputTextColorError: resolveCssVariableColor(
          probeElement,
          "--destructive",
        ),
        inputTextSize: normalizeToPixelValue(style.fontSize),
      };

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
