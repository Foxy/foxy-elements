import {
  THEME_DEFINITION_BY_ATTRIBUTE,
  type ThemeAttributeName,
} from "./theme-mixin";

type ThemeAttributeMapEntry = {
  attribute: string;
  cssVariable: `--${string}`;
  fallback: string;
};

type ThemeAttributeFallbackEntry = {
  attribute: ThemeAttributeName;
  fallback: string;
};

function readCssVarValue(
  styles: CSSStyleDeclaration,
  cssVariable: `--${string}`,
  fallback: string,
): string {
  const value = styles.getPropertyValue(cssVariable).trim();
  return value || fallback;
}

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

export function applyThemeAttributeMap(
  element: HTMLElement,
  map: ThemeAttributeMapEntry[],
): void {
  const styles = getComputedStyle(document.documentElement);

  for (const entry of map) {
    element.setAttribute(
      entry.attribute,
      readCssVarValue(styles, entry.cssVariable, entry.fallback),
    );
  }
}

export function createThemeAttributeMap(
  entries: readonly ThemeAttributeFallbackEntry[],
): ThemeAttributeMapEntry[] {
  return entries.map(({ attribute, fallback }) => {
    return {
      attribute,
      cssVariable: THEME_DEFINITION_BY_ATTRIBUTE[attribute].cssVariable,
      fallback,
    };
  });
}

export function bindThemeAttributes<T extends HTMLElement>(
  elements: T | T[],
  apply: (element: T) => void,
): void {
  const targets = Array.isArray(elements) ? elements : [elements];

  const reapply = () => {
    for (const target of targets) {
      apply(target);
    }
  };

  const stopIfDetached = () => {
    if (targets.every((target) => !target.isConnected)) {
      cleanup();
    }
  };

  const themeObserver = new MutationObserver(() => {
    reapply();
    stopIfDetached();
  });

  const themeMutationConfig: MutationObserverInit = {
    attributes: true,
    attributeFilter: ["class", "data-theme", "style"],
  };

  themeObserver.observe(document.documentElement, themeMutationConfig);
  if (document.body) {
    themeObserver.observe(document.body, themeMutationConfig);
  }

  const lifecycleObserver = new MutationObserver(() => {
    stopIfDetached();
  });

  if (document.body) {
    lifecycleObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    reapply();
    stopIfDetached();
  };

  mediaQuery.addEventListener("change", onMediaChange);

  function cleanup() {
    themeObserver.disconnect();
    lifecycleObserver.disconnect();
    mediaQuery.removeEventListener("change", onMediaChange);
  }

  reapply();
}

export type { ThemeAttributeMapEntry };
