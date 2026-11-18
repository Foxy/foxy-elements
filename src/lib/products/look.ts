import { getJson } from "./catalog";

/**
 * The look a store saved for its product elements, as the public catalog
 * serves it. `null` means the store didn't set it.
 */
export interface StoreLook {
  /** Stock at or below this reads "Only N left"; 0 means nothing does. */
  lowStockThreshold: number;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  /** CSS pixels. */
  buttonRadius: number | null;
  buttonText: string | null;
  /** `inherit` is the page's own font. */
  font: "inherit" | keyof typeof FONT_STACKS | null;
  customCss: string | null;
}

export const DEFAULT_LOOK: StoreLook = {
  lowStockThreshold: 5,
  textColor: null,
  buttonColor: null,
  buttonTextColor: null,
  buttonRadius: null,
  buttonText: null,
  font: null,
  customCss: null,
};

const FONT_STACKS = {
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
};

const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Where a store's look is served: beside its public catalog. */
export function lookUrl(store: string): string {
  return `https://${store}/s/products/store/settings`;
}

/**
 * Reads the endpoint's body, keeping only values of the shape the contract
 * allows. The body is untrusted: anything else becomes "not set".
 */
export function parseLook(body: unknown): StoreLook {
  const data = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const color = (value: unknown) =>
    typeof value === "string" && HEX_COLOR.test(value) ? value : null;
  const threshold = data.low_stock_threshold;
  const radius = data.button_radius;
  const text = typeof data.button_text === "string" ? data.button_text.trim() : "";
  const css = data.custom_css;

  return {
    lowStockThreshold:
      Number.isInteger(threshold) && (threshold as number) >= 0
        ? (threshold as number)
        : DEFAULT_LOOK.lowStockThreshold,
    textColor: color(data.text_color),
    buttonColor: color(data.button_color),
    buttonTextColor: color(data.button_text_color),
    buttonRadius:
      Number.isInteger(radius) && (radius as number) >= 0 && (radius as number) <= 999
        ? (radius as number)
        : null,
    buttonText: text && text.length <= 40 && !/[<>\p{Cc}]/u.test(text) ? text : null,
    font:
      data.font === "inherit" || (typeof data.font === "string" && Object.hasOwn(FONT_STACKS, data.font))
        ? (data.font as StoreLook["font"])
        : null,
    customCss: typeof css === "string" && css.trim() && css.length <= 10000 ? css : null,
  };
}

const lookCache = new Map<string, Promise<StoreLook>>();

/**
 * The store's look, fetched once per store per page and shared by every
 * element. Never rejects: a store that can't be read gets the defaults.
 */
export function fetchLook(store: string): Promise<StoreLook> {
  let request = lookCache.get(store);
  if (!request) {
    request = getJson<unknown>(lookUrl(store)).then(parseLook, (error: unknown) => {
      console.warn(error);
      return DEFAULT_LOOK;
    });
    lookCache.set(store, request);
  }
  return request;
}

/** Forgets every fetched look. For tests and stories. */
export function clearLookCache(): void {
  lookCache.clear();
}

const STORE_VARIABLES = [
  "--foxy-store-text-color",
  "--foxy-store-button-color",
  "--foxy-store-button-text-color",
  "--foxy-store-button-radius",
  "--foxy-store-font",
];

/**
 * Puts the store's look on the element as `--foxy-store-*` variables. The
 * stylesheet reads each `--foxy-product-*` variable first, so one set by an
 * attribute or by the page's CSS wins over the store's.
 */
export function applyLook(element: HTMLElement, store: string, look: StoreLook): void {
  const values = [
    look.textColor,
    look.buttonColor,
    look.buttonTextColor,
    look.buttonRadius === null ? null : `${look.buttonRadius}px`,
    look.font && look.font !== "inherit" ? FONT_STACKS[look.font] : null,
  ];
  // The page's font is a rule in the stylesheet: `inherit` in a variable
  // would mean the variable's own inherited value.
  if (look.font === "inherit") element.dataset.foxyStoreFont = "inherit";
  else delete element.dataset.foxyStoreFont;
  STORE_VARIABLES.forEach((name, index) => {
    const value = values[index];
    if (value) element.style.setProperty(name, value);
    else element.style.removeProperty(name);
  });
  applyCustomCss(element, store, look.customCss);
}

/**
 * The merchant's CSS, once per store in the element's document or shadow
 * root, as the text of a `<style>` at the end of it, so it comes after the
 * elements' own stylesheet. It isn't scoped: it applies to the page like
 * the merchant's other CSS.
 */
function applyCustomCss(element: Element, store: string, css: string | null): void {
  const root = element.getRootNode();
  const target = root instanceof ShadowRoot ? root : document.head;
  let style = [...target.querySelectorAll<HTMLStyleElement>("style[data-foxy-store-css]")].find(
    (candidate) => candidate.dataset.foxyStoreCss === store,
  );
  if (!css) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.dataset.foxyStoreCss = store;
    target.append(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

/** Attributes that set the look for one element, and the variable each sets. */
export const LOOK_ATTRIBUTES: Record<string, string> = {
  font: "--foxy-product-font",
  "text-color": "--foxy-product-text-color",
  "button-color": "--foxy-product-button-color",
  "button-text-color": "--foxy-product-button-text-color",
  "button-radius": "--foxy-product-button-radius",
  "accent-color": "--foxy-product-accent-color",
  "tile-width": "--foxy-product-tile-width",
  "tile-gap": "--foxy-product-grid-gap",
  "image-ratio": "--foxy-product-tile-aspect",
};

const PIXEL_ATTRIBUTES = ["button-radius", "tile-width", "tile-gap"];

/** Copies the look attributes onto the element as `--foxy-product-*` variables. */
export function syncLookAttributes(element: HTMLElement): void {
  for (const [attribute, variable] of Object.entries(LOOK_ATTRIBUTES)) {
    let value = element.getAttribute(attribute)?.trim() ?? "";
    if (attribute === "font") {
      value = value === "inherit" ? "" : Object.hasOwn(FONT_STACKS, value) ? FONT_STACKS[value as keyof typeof FONT_STACKS] : value;
    }
    if (PIXEL_ATTRIBUTES.includes(attribute) && /^\d+(\.\d+)?$/.test(value)) value += "px";
    if (value) element.style.setProperty(variable, value);
    else element.style.removeProperty(variable);
  }
}
