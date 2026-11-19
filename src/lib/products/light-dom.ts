import { chooseMessage, format, messages } from "./messages";
import { isHttps } from "./markdown";
import { productModifiers, productOptions } from "./options";
import {
  formatPrice,
  priceRange,
  productPrice,
} from "./price";
import type { CatalogProduct, ProductImage } from "./types";

const STYLE_ID = "foxy-product-styles";

const chevron = (color: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E")`;

/**
 * The themes, as the CSS variables each one sets. `bold` is the default
 * look: the value every variable has when no theme, store setting or page
 * CSS sets it, for the variables that have one such value. The stylesheet
 * is built from this, so the two can't differ.
 *
 * A `--foxy-theme-*` variable gives way to the store's saved setting and to
 * the element's attribute of the same name; a `--foxy-product-*` variable
 * is the value itself, and is also what a page's own CSS sets.
 */
export const themes = {
  bold: {
    "--foxy-theme-font": "inherit",
    "--foxy-theme-text-color": "#111827",
    "--foxy-theme-button-color": "#111827",
    "--foxy-theme-button-text-color": "#FFFFFF",
    "--foxy-theme-button-radius": "8px",
    "--foxy-product-button-border": "0",
    "--foxy-product-button-font": "inherit",
    "--foxy-product-button-weight": "600",
    "--foxy-product-button-tracking": "0",
    "--foxy-product-button-transform": "none",
    "--foxy-product-radius": "8px",
    "--foxy-product-field-radius": "8px",
    "--foxy-product-accent-color": "#111827",
    "--foxy-product-on-accent-color": "#FFFFFF",
    "--foxy-product-body-color": "#1F2937",
    "--foxy-product-muted-color": "#6B7280",
    "--foxy-product-description-color": "#4B5563",
    "--foxy-product-border-color": "#D1D5DB",
    "--foxy-product-field-border-color": "#D1D5DB",
    "--foxy-product-divider-color": "#E5E7EB",
    "--foxy-product-surface-color": "#FFFFFF",
    "--foxy-product-panel-color": "#F3F4F6",
    "--foxy-product-header-color": "#F9FAFB",
    "--foxy-product-notice-color": "#B91C1C",
    "--foxy-product-success-color": "#15803D",
    "--foxy-product-card-border": "1px solid #E5E7EB",
    "--foxy-product-card-radius": "12px",
    "--foxy-product-card-shadow": "none",
    "--foxy-product-card-bar": "none",
    "--foxy-product-backdrop-color": "transparent",
    "--foxy-product-backdrop-padding": "0",
    "--foxy-product-text-link-background": "none",
    "--foxy-product-text-link-padding": "0",
    "--foxy-product-chevron": chevron("6B7280"),
  },
  // Square, type and space only: for a site that brings its own styling.
  // currentColor, not inherit: on a custom property, inherit takes the
  // parent's value of that property, so var() would fall through.
  plain: {
    "--foxy-theme-text-color": "currentColor",
    "--foxy-theme-button-color": "transparent",
    "--foxy-theme-button-text-color": "currentColor",
    "--foxy-theme-button-radius": "0px",
    "--foxy-product-button-border": "1px solid currentColor",
    "--foxy-product-radius": "0px",
    "--foxy-product-field-radius": "0px",
    "--foxy-product-accent-color": "currentColor",
    "--foxy-product-on-accent-color": "currentColor",
    "--foxy-product-selected-color": "transparent",
    "--foxy-product-body-color": "currentColor",
    "--foxy-product-muted-color": "currentColor",
    "--foxy-product-description-color": "currentColor",
    "--foxy-product-border-color": "currentColor",
    "--foxy-product-field-border-color": "currentColor",
    "--foxy-product-divider-color": "rgba(127, 127, 127, 0.35)",
    "--foxy-product-surface-color": "transparent",
    "--foxy-product-panel-color": "rgba(127, 127, 127, 0.14)",
    "--foxy-product-header-color": "transparent",
    "--foxy-product-card-border": "0",
    "--foxy-product-card-radius": "0px",
    "--foxy-product-card-padding": "0px",
  },
  // Foxy's purple, under the unicorn's rainbow.
  foxy: {
    "--foxy-theme-text-color": "#2B1B3D",
    "--foxy-theme-button-color": "#5B2A86",
    "--foxy-theme-button-radius": "10px",
    "--foxy-product-accent-color": "#5B2A86",
    "--foxy-product-panel-color": "#F6F1FA",
    "--foxy-product-card-border": "1px solid #E9DDF3",
    "--foxy-product-card-radius": "14px",
    "--foxy-product-card-bar": "linear-gradient(90deg, #F2798F, #F6A45C, #F4D35E, #7BC67B, #5AA9E6, #9B6DD6)",
    "--foxy-product-card-shadow": "0 6px 24px rgba(91, 42, 134, 0.10)",
  },
  bookshop: {
    "--foxy-theme-font": 'Georgia, "Times New Roman", serif',
    "--foxy-theme-text-color": "#1B2A49",
    "--foxy-theme-button-color": "#1B365D",
    "--foxy-theme-button-radius": "0px",
    "--foxy-product-button-weight": "700",
    "--foxy-product-button-tracking": "0.06em",
    "--foxy-product-button-transform": "uppercase",
    "--foxy-product-button-font": "system-ui, sans-serif",
    "--foxy-product-radius": "0px",
    "--foxy-product-field-radius": "0px",
    "--foxy-product-accent-color": "#1B365D",
    "--foxy-product-card-radius": "0px",
    "--foxy-product-card-shadow": "0 2px 8px rgba(0, 0, 0, 0.12)",
  },
  soft: {
    "--foxy-theme-font": 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    "--foxy-theme-text-color": "#1F2937",
    "--foxy-theme-button-color": "#2563EB",
    "--foxy-theme-button-radius": "12px",
    "--foxy-product-radius": "14px",
    "--foxy-product-field-radius": "10px",
    "--foxy-product-accent-color": "#2563EB",
    "--foxy-product-card-border": "0",
    "--foxy-product-card-radius": "18px",
    "--foxy-product-card-shadow": "0 1px 3px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)",
  },
  market: {
    "--foxy-theme-font": 'Georgia, "Times New Roman", serif',
    "--foxy-theme-text-color": "#3B2F2F",
    "--foxy-theme-button-color": "#B45309",
    "--foxy-theme-button-radius": "999px",
    "--foxy-product-accent-color": "#92400E",
    "--foxy-product-surface-color": "#FFFDF9",
    "--foxy-product-panel-color": "#FAF5EE",
    "--foxy-product-border-color": "#E7DCCB",
    "--foxy-product-field-border-color": "#D9CBB5",
    "--foxy-product-divider-color": "#EDE3D3",
    "--foxy-product-card-border": "1px solid #E7DCCB",
  },
  // Dark on any page: every element brings its own dark background, and
  // the button an edge that shows on a white one.
  dark: {
    "--foxy-theme-text-color": "#F9FAFB",
    "--foxy-theme-button-color": "#F9FAFB",
    "--foxy-theme-button-text-color": "#111827",
    "--foxy-product-button-border": "1px solid #9CA3AF",
    "--foxy-product-backdrop-color": "#030712",
    "--foxy-product-backdrop-padding": "24px",
    "--foxy-product-text-link-background": "#111827",
    "--foxy-product-text-link-padding": "4px 10px",
    "--foxy-product-accent-color": "#F9FAFB",
    "--foxy-product-on-accent-color": "#111827",
    "--foxy-product-body-color": "#E5E7EB",
    "--foxy-product-muted-color": "#9CA3AF",
    "--foxy-product-description-color": "#D1D5DB",
    "--foxy-product-border-color": "#4B5563",
    "--foxy-product-field-border-color": "#4B5563",
    "--foxy-product-divider-color": "#374151",
    "--foxy-product-surface-color": "#111827",
    "--foxy-product-panel-color": "#1F2937",
    "--foxy-product-header-color": "#1F2937",
    "--foxy-product-disabled-color": "#374151",
    "--foxy-product-disabled-text-color": "#D1D5DB",
    "--foxy-product-disabled-opacity": "1",
    "--foxy-product-notice-color": "#FCA5A5",
    "--foxy-product-success-color": "#86EFAC",
    "--foxy-product-card-border": "1px solid #374151",
    "--foxy-product-chevron": chevron("D1D5DB"),
  },
} as const satisfies Record<string, Record<`--foxy-${"theme" | "product"}-${string}`, string>>;

const BOLD: Record<string, string> = themes.bold;

// Each look value reads the element's own variable first (set by an attribute
// or the page's CSS), then the store's saved look, then the theme's, then the
// default look's value.
const tier = (name: string): string =>
  `var(--foxy-product-${name}, var(--foxy-store-${name}, var(--foxy-theme-${name}, ${BOLD[`--foxy-theme-${name}`]})))`;
/** A variable with the default look's value behind it. */
const v = (name: string): string => `var(--foxy-product-${name}, ${BOLD[`--foxy-product-${name}`]})`;
const font = tier("font");
const nameColor = tier("text-color");
const button = tier("button-color");
const onButton = tier("button-text-color");
const buttonRadius = tier("button-radius");
const radius = v("radius");
const fieldRadius = v("field-radius");
const accent = v("accent-color");
const onAccent = v("on-accent-color");
const body = v("body-color");
const muted = v("muted-color");
const prose = v("description-color");
const border = v("border-color");
const fieldBorder = v("field-border-color");
const divider = v("divider-color");
const surface = v("surface-color");
const panel = v("panel-color");
const header = v("header-color");
const onDisabled = "var(--foxy-product-disabled-text-color, #4B5563)";
const notice = v("notice-color");
const success = v("success-color");
// A card: the form, a tile, and each panel of the page.
const card = `border: ${v("card-border")}; border-radius: ${v("card-radius")}; box-shadow: ${v("card-shadow")}; background: ${v("card-bar")} top / 100% 4px no-repeat, ${surface};`;
const cardPadding = (size: string): string => `var(--foxy-product-card-padding, ${size})`;

/** The tallest a page's main photo gets: most of the window, so the add button stays in the first screen. */
export const PHOTO_MAX_HEIGHT = "var(--foxy-product-photo-max-height, min(70vh, 640px))";

const ELEMENTS =
  "foxy-product-link, foxy-product-form, foxy-product-tile, foxy-product-collection, foxy-product-page";

// A theme is chosen by the element's `theme` attribute, or by the store's
// saved theme when the element has none; any other value of the attribute,
// such as `bold`, is the default look. `:where()` keeps each rule as light
// as a plain element selector, so the page's CSS can set the same variables
// without out-weighing it.
const themed = (name: string): string =>
  `:is(${ELEMENTS}):where([theme="${name}"], [data-foxy-store-theme="${name}"]:not([theme]))`;

const THEMES = Object.entries(themes)
  .filter(([name]) => name !== "bold")
  .map(
    ([name, variables]) =>
      `${themed(name)} { ${Object.entries(variables)
        .map(([variable, value]) => `${variable}: ${value};`)
        .join(" ")} }`,
  )
  .join("\n");


// Everything renders into light DOM, so that 2.0's `foxycart.js` sees the
// links and forms and search engines the text. That leaves it open to the
// page's CSS, so each rule starts with the element's name inside `:is()`:
// that outweighs a theme's `button`, `label` or `.content a`, and ties are
// won by this stylesheet being added to the page last.
const STYLES = `
${THEMES}
${themed("dark")} { color-scheme: dark; }
:is(${ELEMENTS}):where([font="inherit"], [data-foxy-store-font="inherit"]:not([font])) { font-family: inherit; }
:is(${ELEMENTS}) { font-family: ${font}; color: ${body}; line-height: 1.4; }
:is(${ELEMENTS}) :where(h1, h2, h3, h4, h5, h6, p, dl, dd, fieldset, legend) { margin: 0; padding: 0; }
:is(${ELEMENTS}) :where(button, input, select) { font-family: inherit; }
:is(${ELEMENTS}) [hidden]:not([hidden="until-found"]) { display: none !important; }
:is(${ELEMENTS}) .foxy-product-sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
:is(foxy-product-link) { display: inline-block; }
:is(foxy-product-form, foxy-product-tile, foxy-product-collection, foxy-product-page) { display: block; }
/* The elements that aren't one card stand on a backdrop when the theme has one. */
:is(foxy-product-collection, foxy-product-page) {
  box-sizing: border-box; padding: ${v("backdrop-padding")}; border-radius: ${v("card-radius")};
  background: ${v("backdrop-color")};
}

:is(${ELEMENTS}) :is(a, button).foxy-product-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.35em; box-sizing: border-box;
  min-height: 48px; padding: 0 24px; border: ${v("button-border")}; border-radius: ${buttonRadius};
  background: ${button}; color: ${onButton}; font-family: ${v("button-font")}; font-size: 15px;
  font-weight: ${v("button-weight")}; line-height: 1.2; letter-spacing: ${v("button-tracking")};
  text-transform: ${v("button-transform")}; text-align: center; text-decoration: none; cursor: pointer;
  transition: opacity 0.15s;
}
:is(${ELEMENTS}) :is(a, button).foxy-product-button:is([href], :enabled):hover { opacity: 0.88; }
:is(${ELEMENTS}) :is(a, button).foxy-product-button:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
:is(${ELEMENTS}) :is(a, button).foxy-product-button.foxy-product-button-secondary {
  border: 1px solid ${border}; background: ${surface}; color: ${nameColor};
}
:is(${ELEMENTS}) :is(a, button).foxy-product-button:is([aria-disabled="true"], :disabled) {
  background: var(--foxy-product-disabled-color, ${button}); color: var(--foxy-product-disabled-text-color, ${onButton});
  opacity: var(--foxy-product-disabled-opacity, 0.45); cursor: not-allowed;
}
:is(foxy-product-link) a.foxy-product-text-link {
  padding: ${v("text-link-padding")}; border-radius: ${fieldRadius};
  background: ${v("text-link-background")}; color: ${accent}; font-size: 15px; text-decoration: underline;
}
:is(foxy-product-link) a.foxy-product-text-link[aria-disabled="true"] { text-decoration: none; cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-button s { color: inherit; opacity: 0.75; }
/* Without room for the label and the price on one line, the price wraps to a
   line of its own that has no height, and is cut off. The label wraps only
   when it doesn't fit by itself. The text is rebuilt when a field changes on
   blur, which can fall between a press and its release, so the press and
   release both land on the button itself and still make a click. */
:is(${ELEMENTS}) .foxy-product-button .foxy-product-button-text {
  display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; column-gap: 0.35em; min-width: 0; overflow: hidden;
  pointer-events: none;
}
:is(${ELEMENTS}) .foxy-product-button .foxy-product-button-price { height: 0; }

:is(${ELEMENTS}) .foxy-product-price { color: var(--foxy-product-price-color, ${nameColor}); }
:is(${ELEMENTS}) .foxy-product-list-price {
  margin-inline-start: 8px; color: var(--foxy-product-list-price-color, ${muted}); font-size: var(--foxy-product-list-price-size, 0.82em);
}
:is(${ELEMENTS}) :is(.foxy-product-button, .foxy-product-text-link) .foxy-product-price { color: inherit; }
:is(${ELEMENTS}) .foxy-product-brand { color: ${muted}; font-size: 13px; }
:is(${ELEMENTS}) .foxy-product-name { color: ${nameColor}; font-weight: 500; }
:is(${ELEMENTS}) .foxy-product-note { color: ${success}; font-size: 13px; }
:is(${ELEMENTS}) .foxy-product-note[data-tone="notice"] { color: ${notice}; }

:is(foxy-product-tile) { height: 100%; max-width: var(--foxy-product-tile-width, 280px); }
:is(foxy-product-collection) foxy-product-tile { max-width: none; }
:is(foxy-product-tile) .foxy-product-tile { display: flex; flex-direction: column; box-sizing: border-box; height: 100%; overflow: hidden; ${card} }
:is(foxy-product-tile) .foxy-product-tile-media {
  display: block; aspect-ratio: var(--foxy-product-tile-aspect, 4 / 5); overflow: hidden;
  background: ${panel};
}
:is(foxy-product-tile) .foxy-product-tile-media:empty {
  background: ${panel} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='16' rx='2'/%3E%3Ccircle cx='8.5' cy='9.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5-9 10'/%3E%3C/svg%3E") center no-repeat;
}
:is(foxy-product-tile) .foxy-product-tile-media img { display: block; width: 100%; height: 100%; object-fit: cover; }
:is(foxy-product-tile) .foxy-product-tile-body { display: flex; flex-direction: column; flex-grow: 1; gap: 6px; padding: ${cardPadding("16px")}; }
:is(foxy-product-tile) .foxy-product-brand { margin-top: -4px; font-size: 13px; }
:is(foxy-product-tile) .foxy-product-tile-swatches { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 2px 0 0; padding: 0; list-style: none; }
:is(foxy-product-tile) .foxy-product-tile-swatch {
  display: block; width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2), 0 0 0 1px ${surface};
}
:is(foxy-product-tile) .foxy-product-tile-more { color: ${muted}; font-size: 12px; line-height: 14px; }
:is(foxy-product-tile) .foxy-product-name { font-size: 16px; line-height: 1.35; }
:is(foxy-product-tile) .foxy-product-name a { color: inherit; text-decoration: none; }
:is(foxy-product-tile) .foxy-product-name a:hover { text-decoration: underline; }
:is(foxy-product-tile) .foxy-product-tile-price { font-size: var(--foxy-product-price-size, 16px); }
:is(foxy-product-tile) .foxy-product-note { font-size: 12px; }
:is(foxy-product-tile) .foxy-product-tile-action { display: flex; margin-top: auto; padding-top: 10px; }
:is(foxy-product-tile) .foxy-product-tile-action a.foxy-product-button { flex: 1; min-height: 44px; padding: 0 12px; font-size: 14px; }

:is(foxy-product-collection) { --foxy-product-tile-aspect: 1 / 1; }
:is(foxy-product-collection) .foxy-product-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
:is(foxy-product-collection) .foxy-product-toolbar:empty { display: none; }
:is(foxy-product-collection) .foxy-product-count { color: ${muted}; font-size: 14px; }
:is(foxy-product-collection) .foxy-product-sort { display: flex; align-items: center; gap: 10px; margin-inline-start: auto; color: ${prose}; font-size: 14px; }
:is(foxy-product-collection) .foxy-product-grid {
  display: grid; gap: var(--foxy-product-grid-gap, 24px); margin: 0; padding: 0; list-style: none;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--foxy-product-tile-width, 220px)), 1fr));
}
:is(foxy-product-collection) .foxy-product-status:empty { display: none; }
:is(foxy-product-collection) .foxy-product-status { color: ${prose}; font-size: 14px; }
:is(foxy-product-collection) .foxy-product-more { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 24px; }
:is(foxy-product-collection) .foxy-product-more:empty { display: none; }
:is(foxy-product-collection) .foxy-product-more button.foxy-product-button { min-height: 44px; padding: 0 28px; font-size: 14px; }
:is(foxy-product-collection) .foxy-product-showing { color: ${muted}; font-size: 12px; }

:is(foxy-product-form) .foxy-product-form {
  display: flex; flex-direction: column; gap: 18px; box-sizing: border-box; max-width: var(--foxy-product-form-width, 420px);
  padding: ${cardPadding("24px")}; ${card}
}
:is(${ELEMENTS}) .foxy-product-summary { display: flex; flex-direction: column; gap: 4px; }
:is(foxy-product-form) .foxy-product-name { font-size: 22px; line-height: 1.25; }
:is(foxy-product-form) .foxy-product-summary .foxy-product-price { font-size: var(--foxy-product-price-size, 20px); }

:is(${ELEMENTS}) .foxy-product-controls { display: flex; flex-direction: column; gap: 18px; margin: 0; }
:is(${ELEMENTS}) .foxy-product-choices { display: flex; flex-direction: column; gap: inherit; }
/* On a page, what there is to choose sits on a tint of its own. */
:is(foxy-product-page) .foxy-product-choices { padding: 20px; border-radius: ${radius}; background: ${panel}; }
:is(${ELEMENTS}) .foxy-product-field { display: flex; flex-direction: column; gap: 6px; }
:is(${ELEMENTS}) .foxy-product-field-label { font-size: 14px; font-weight: 600; }
:is(${ELEMENTS}) .foxy-product-hint { color: ${muted}; font-weight: 400; }
:is(${ELEMENTS}) .foxy-product-hint[data-tone="notice"] { color: ${notice}; }
:is(${ELEMENTS}) .foxy-product-input {
  box-sizing: border-box; width: 100%; height: 44px; padding: 0 12px; border: 1px solid ${fieldBorder}; border-radius: ${fieldRadius};
  background: ${surface}; color: ${body}; font-size: 15px;
}
:is(${ELEMENTS}) select.foxy-product-input {
  appearance: none; padding-inline-end: 36px; text-overflow: ellipsis; cursor: pointer;
  background-image: ${v("chevron")}; background-repeat: no-repeat; background-position: right 14px center;
}
:is(${ELEMENTS}) .foxy-product-add { width: 100%; }
:is(${ELEMENTS}) .foxy-product-input[aria-invalid="true"] { border-color: ${notice}; }
:is(${ELEMENTS}) .foxy-product-input:focus-visible { outline: 2px solid ${accent}; outline-offset: 1px; }
:is(${ELEMENTS}) .foxy-product-counter { color: ${muted}; font-size: 12px; text-align: right; }
:is(${ELEMENTS}) .foxy-product-error { color: ${notice}; font-size: 13px; }
:is(${ELEMENTS}) .foxy-product-option { display: flex; flex-direction: column; min-width: 0; border: 0; }
:is(${ELEMENTS}) .foxy-product-option legend { margin-bottom: 10px; font-size: 14px; font-weight: 600; }
:is(${ELEMENTS}) .foxy-product-values { display: flex; flex-wrap: wrap; gap: 8px; }
:is(${ELEMENTS}) .foxy-product-values[data-swatches] { gap: 12px; }
:is(${ELEMENTS}) .foxy-product-radio { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); opacity: 0; }
:is(${ELEMENTS}) .foxy-product-pill {
  display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
  min-width: 52px; height: 44px; padding: 0 14px; border: 1px solid ${border}; border-radius: ${buttonRadius};
  background: ${surface}; color: ${nameColor}; font-size: 15px; cursor: pointer;
}
:is(${ELEMENTS}) .foxy-product-radio:checked + .foxy-product-pill { border-color: ${accent}; background: var(--foxy-product-selected-color, ${accent}); box-shadow: inset 0 0 0 1px ${accent}; color: ${onAccent}; }
:is(${ELEMENTS}) .foxy-product-radio:disabled + .foxy-product-pill { border-style: dashed; border-color: ${fieldBorder}; background: ${header}; color: ${muted}; cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-radio:focus-visible + :is(.foxy-product-pill, .foxy-product-swatch, .foxy-product-row) { outline: 2px solid ${accent}; outline-offset: 2px; }
:is(${ELEMENTS}) .foxy-product-swatch { display: flex; flex-direction: column; align-items: center; gap: 6px; color: ${prose}; font-size: 12px; cursor: pointer; }
:is(${ELEMENTS}) .foxy-product-swatch-ring { display: block; box-sizing: border-box; width: 48px; height: 48px; padding: 4px; border: 2px solid ${border}; border-radius: 50%; background: ${surface}; }
:is(${ELEMENTS}) .foxy-product-swatch-dot { display: block; width: 100%; height: 100%; overflow: hidden; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15); }
:is(${ELEMENTS}) .foxy-product-swatch-dot img { display: block; width: 100%; height: 100%; object-fit: cover; }
:is(${ELEMENTS}) .foxy-product-radio:checked + .foxy-product-swatch .foxy-product-swatch-ring { border-color: ${accent}; }
:is(${ELEMENTS}) .foxy-product-radio:disabled + .foxy-product-swatch { cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-radio:disabled + .foxy-product-swatch .foxy-product-swatch-ring { opacity: 0.4; }
:is(${ELEMENTS}) .foxy-product-stepper { display: flex; align-items: stretch; align-self: flex-start; overflow: hidden; border: 1px solid ${border}; border-radius: ${fieldRadius}; }
:is(${ELEMENTS}) .foxy-product-stepper button { width: 44px; height: 44px; padding: 0; border: 0; border-radius: 0; background: ${panel}; color: ${onDisabled}; font-size: 18px; cursor: pointer; }
:is(${ELEMENTS}) .foxy-product-stepper button:disabled { opacity: 0.45; cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-stepper input { box-sizing: border-box; width: 52px; padding: 0; border: 0; border-radius: 0; background: ${surface}; color: ${body}; font-size: 15px; text-align: center; }

:is(${ELEMENTS}) .foxy-product-rows { display: flex; flex-direction: column; overflow: hidden; border: 1px solid ${border}; border-radius: ${fieldRadius}; }
:is(${ELEMENTS}) .foxy-product-row {
  display: flex; align-items: center; gap: 12px; box-sizing: border-box; min-height: 52px; padding: 8px 14px;
  background: ${surface}; color: ${nameColor}; font-size: 15px; cursor: pointer;
}
:is(${ELEMENTS}) .foxy-product-row + .foxy-product-radio + .foxy-product-row { border-top: 1px solid ${divider}; }
:is(${ELEMENTS}) .foxy-product-row::before { content: ""; flex: none; box-sizing: border-box; width: 18px; height: 18px; border: 2px solid ${border}; border-radius: 50%; }
:is(${ELEMENTS}) .foxy-product-radio:checked + .foxy-product-row { background: ${panel}; font-weight: 600; }
:is(${ELEMENTS}) .foxy-product-radio:checked + .foxy-product-row::before { border: 6px solid ${accent}; }
:is(${ELEMENTS}) .foxy-product-radio:focus-visible + .foxy-product-row { outline-offset: -2px; }
:is(${ELEMENTS}) .foxy-product-radio:disabled + .foxy-product-row { color: ${muted}; cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-row-media { flex: none; width: 40px; height: 40px; overflow: hidden; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15); }
:is(${ELEMENTS}) .foxy-product-row-media img { display: block; width: 100%; height: 100%; object-fit: cover; }
:is(${ELEMENTS}) .foxy-product-row-label { flex: 1; min-width: 0; }
:is(${ELEMENTS}) .foxy-product-row-price { flex: none; color: ${nameColor}; font-weight: 600; font-variant-numeric: tabular-nums; }

:is(foxy-product-page) .foxy-product-page { display: flex; flex-direction: column; gap: 24px; }
/* Its columns follow its own width, not the window's: it sits in pages of any width. */
:is(foxy-product-page) { container-type: inline-size; }
:is(foxy-product-page) .foxy-product-main {
  display: grid; grid-template-columns: minmax(0, 1fr); align-items: start; gap: 32px; box-sizing: border-box;
  padding: ${cardPadding("32px")}; ${card}
}
@container (min-width: 720px) {
  :is(foxy-product-page) .foxy-product-main { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; }
  /* What is bought stays in view while a tall gallery scrolls. */
  :is(foxy-product-page) .foxy-product-info { position: sticky; top: var(--foxy-product-sticky-top, 16px); }
}
@container (min-width: 960px) {
  :is(foxy-product-page) .foxy-product-main { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
}
:is(foxy-product-page) .foxy-product-gallery { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
:is(foxy-product-page) .foxy-product-gallery[hidden] + .foxy-product-info { grid-column: 1 / -1; max-width: 560px; }
/* The element gives the frame the main photo's shape and width; a photo of
   another shape is fitted inside it. */
:is(foxy-product-page) .foxy-product-hero { width: 100%; max-height: ${PHOTO_MAX_HEIGHT}; margin-inline: auto; overflow: hidden; border-radius: ${radius}; }
:is(foxy-product-page) .foxy-product-hero img {
  display: block; width: 100%; height: 100%; max-height: ${PHOTO_MAX_HEIGHT}; object-fit: var(--foxy-product-photo-fit, contain);
}
:is(foxy-product-page) .foxy-product-thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 10px; }
:is(foxy-product-page) .foxy-product-thumbs button { aspect-ratio: 1 / 1; padding: 0; overflow: hidden; border: 2px solid ${divider}; border-radius: ${radius}; background: ${panel}; cursor: pointer; }
:is(foxy-product-page) .foxy-product-thumbs button[aria-current="true"] { border-color: ${accent}; }
:is(foxy-product-page) .foxy-product-thumbs button:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
:is(foxy-product-page) .foxy-product-thumbs img { display: block; width: 100%; height: 100%; object-fit: cover; }
:is(foxy-product-page) .foxy-product-info { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
:is(foxy-product-page) .foxy-product-summary { gap: 6px; }
:is(foxy-product-page) .foxy-product-brand { color: ${accent}; font-size: 16px; font-weight: 500; }
:is(foxy-product-page) .foxy-product-name { font-size: clamp(28px, 4.2cqi, 40px); line-height: 1.15; }
:is(foxy-product-page) .foxy-product-price-row { margin-top: 10px; }
:is(foxy-product-page) .foxy-product-lead { margin-top: 10px; color: ${prose}; font-size: 15px; line-height: 1.6; }
:is(foxy-product-page) .foxy-product-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 10px; padding: 0; list-style: none; }
:is(foxy-product-page) .foxy-product-chip {
  display: inline-block; padding: 3px 10px; border: 1px solid ${border}; border-radius: 999px; background: ${panel};
  color: ${prose}; font-size: 12px; line-height: 1.4; text-decoration: none;
}
:is(foxy-product-page) a.foxy-product-chip:hover { border-color: ${accent}; color: ${nameColor}; }
:is(foxy-product-page) a.foxy-product-chip:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
:is(foxy-product-page) .foxy-product-price-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; }
:is(foxy-product-page) .foxy-product-summary .foxy-product-price { font-size: var(--foxy-product-price-size, 26px); }
:is(foxy-product-page) .foxy-product-note { font-size: 14px; }
:is(foxy-product-page) .foxy-product-controls { gap: 20px; }
:is(foxy-product-page) button.foxy-product-button { min-height: 52px; font-size: 16px; letter-spacing: 0.02em; }
:is(foxy-product-page) .foxy-product-below { display: flex; flex-wrap: wrap; gap: 24px; }
:is(foxy-product-page) .foxy-product-description {
  display: flex; flex: 2 1 520px; flex-direction: column; gap: 14px; box-sizing: border-box; min-width: 0; padding: ${cardPadding("32px")};
  ${card} color: ${prose}; font-size: 15px; line-height: 1.6; overflow-x: auto;
}
:is(foxy-product-page) .foxy-product-description :where(h2, h3, h4, h5, h6) { color: ${nameColor}; font-size: 22px; font-weight: 500; line-height: 1.25; }
:is(foxy-product-page) .foxy-product-description :where(ul, ol) { margin: 0; padding-left: 20px; }
:is(foxy-product-page) .foxy-product-description table { border-collapse: collapse; font-size: 14px; }
:is(foxy-product-page) .foxy-product-description :where(th, td) { padding: 8px 16px; text-align: left; }
:is(foxy-product-page) .foxy-product-description thead tr { background: ${header}; }
:is(foxy-product-page) .foxy-product-description tbody tr { border-top: 1px solid ${divider}; }
:is(foxy-product-page) .foxy-product-description a { color: inherit; }
:is(foxy-product-page) .foxy-product-details { display: flex; flex: 1 1 300px; flex-direction: column; gap: 14px; box-sizing: border-box; min-width: 0; padding: ${cardPadding("32px")}; ${card} }
:is(foxy-product-page) .foxy-product-details h2 { color: ${nameColor}; font-size: 22px; font-weight: 500; }
/* Each label takes the width it needs, up to two fifths, so its value sits
   close by; every other row is tinted to lead the eye across. */
:is(foxy-product-page) .foxy-product-detail-list { display: grid; grid-template-columns: fit-content(40%) minmax(0, 1fr); font-size: 14px; line-height: 1.45; }
:is(foxy-product-page) .foxy-product-detail-list > div {
  display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; gap: 20px; padding: 8px 12px; border-radius: ${fieldRadius};
}
:is(foxy-product-page) .foxy-product-detail-list > div:nth-child(odd) { background: ${panel}; }
:is(foxy-product-page) .foxy-product-detail-list dt { color: ${prose}; }
:is(foxy-product-page) .foxy-product-detail-list dd { color: ${body}; overflow-wrap: anywhere; }

:is(foxy-product-page) .foxy-product-sections {
  flex: 1 1 100%; box-sizing: border-box; min-width: 0; padding: ${cardPadding("8px 32px 32px")}; ${card}
  color: ${prose}; font-size: 15px; line-height: 1.6;
}
:is(foxy-product-page) .foxy-product-panel { display: flex; flex-direction: column; gap: 14px; overflow-x: auto; }
:is(foxy-product-page) .foxy-product-panel :where(h2, h3, h4, h5, h6) { color: ${nameColor}; font-size: 18px; font-weight: 500; line-height: 1.3; }
:is(foxy-product-page) .foxy-product-panel :where(ul, ol) { margin: 0; padding-left: 20px; }
:is(foxy-product-page) .foxy-product-panel table { border-collapse: collapse; font-size: 14px; }
:is(foxy-product-page) .foxy-product-panel :where(th, td) { padding: 8px 16px; text-align: left; }
:is(foxy-product-page) .foxy-product-panel thead tr { background: ${header}; }
:is(foxy-product-page) .foxy-product-panel tbody tr { border-top: 1px solid ${divider}; }
:is(foxy-product-page) .foxy-product-panel a { color: inherit; }
:is(foxy-product-page) .foxy-product-tablist { display: flex; gap: 4px; margin-bottom: 24px; overflow-x: auto; border-bottom: 1px solid ${divider}; }
:is(foxy-product-page) .foxy-product-tab {
  flex: none; margin-bottom: -1px; padding: 16px 14px 14px; border: 0; border-bottom: 2px solid transparent; background: none;
  color: ${muted}; font-size: 15px; font-weight: 500; cursor: pointer;
}
:is(foxy-product-page) .foxy-product-tab[aria-selected="true"] { border-bottom-color: ${accent}; color: ${nameColor}; }
:is(foxy-product-page) .foxy-product-tab:hover { color: ${nameColor}; }
:is(foxy-product-page) .foxy-product-tab:focus-visible { outline: 2px solid ${accent}; outline-offset: -2px; }
:is(foxy-product-page) .foxy-product-panel:focus-visible { outline: 2px solid ${accent}; outline-offset: 4px; }
:is(foxy-product-page) .foxy-product-sections[data-layout="accordion"] { padding-top: 0; padding-bottom: 0; }
:is(foxy-product-page) .foxy-product-section + .foxy-product-section { border-top: 1px solid ${divider}; }
:is(foxy-product-page) .foxy-product-section summary {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 0; list-style: none; cursor: pointer;
}
:is(foxy-product-page) .foxy-product-section summary::-webkit-details-marker { display: none; }
:is(foxy-product-page) .foxy-product-section summary::after {
  content: ""; flex: none; width: 12px; height: 8px; background: ${v("chevron")} center / contain no-repeat; transition: transform 0.15s;
}
:is(foxy-product-page) .foxy-product-section[open] summary::after { transform: rotate(180deg); }
:is(foxy-product-page) .foxy-product-section summary:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
:is(foxy-product-page) .foxy-product-section-title { color: ${nameColor}; font-size: 17px; font-weight: 500; }
:is(foxy-product-page) .foxy-product-section .foxy-product-panel { padding-bottom: 20px; }
`;

/**
 * Adds the shared stylesheet once to the document, or to the shadow root the
 * element sits in when a merchant's own component holds it.
 */
export function ensureStyles(element: Element): void {
  const root = element.getRootNode();
  const target = root instanceof ShadowRoot ? root : document.head;
  if (target.querySelector(`style#${STYLE_ID}`)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES;
  // Before the store's own CSS, which has to win over these defaults.
  target.insertBefore(style, target.querySelector("style[data-foxy-store-css]"));
}

/** `$24.95`, with a struck-through list price beside it when there is one. */
export function priceNodes(
  price: number,
  listPrice: number | null,
  currency: string | null,
  locale: string,
): Array<Node | string> {
  const nodes: Array<Node | string> = [formatPrice(price, currency, locale)];
  if (listPrice !== null && listPrice > price) {
    const was = document.createElement("s");
    was.className = "foxy-product-list-price";
    was.textContent = formatPrice(listPrice, currency, locale);
    was.setAttribute("aria-label", format(locale, messages.priceWas, {
      price: formatPrice(listPrice, currency, locale),
    }));
    nodes.push(" ", was);
  }
  return nodes;
}

/** A button's text, `Add to cart · $24.95`, with the price in its own part that gives way when space is short. */
export function buttonText(label: string, price?: Node | string): HTMLSpanElement {
  const text = document.createElement("span");
  text.className = "foxy-product-button-text";
  const name = document.createElement("span");
  name.className = "foxy-product-label";
  name.textContent = label;
  text.append(name);
  if (price) {
    const after = document.createElement("span");
    after.className = "foxy-product-button-price";
    after.append(" · ", price);
    text.append(after);
  }
  return text;
}

/**
 * The price as text nodes: `$24.95`, a struck-through list price beside it,
 * or `$22.00 – $26.00` for a parent whose variants differ. Each amount is
 * formatted in the currency it is in, which `requested` only asks for.
 */
export function renderPrice(
  product: CatalogProduct,
  requested: string | null,
  locale: string,
): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "foxy-product-price";

  const range = priceRange(product, requested);
  if (product.product_type === "parent" && range && range.min !== range.max) {
    span.textContent = format(locale, messages.priceRange, {
      min: formatPrice(range.min, range.currency, locale),
      max: formatPrice(range.max, range.currency, locale),
    });
    return span;
  }

  const isParent = product.product_type === "parent";
  if (isParent && range) span.append(...priceNodes(range.min, null, range.currency, locale));
  else {
    const { price, listPrice, currency } = productPrice(product, requested);
    if (price !== null) span.append(...priceNodes(price, isParent ? null : listPrice, currency, locale));
  }
  return span;
}

/**
 * What to say about stock: sold out, or how few are left once that is at or
 * below the low-stock threshold: the product's own when it sets one (a
 * variant's definition includes its parent's), else the store's.
 * `null` when there's nothing to say.
 */
export function stockNote(
  product: CatalogProduct,
  storeLowStock: number,
  locale: string,
): { text: string; tone: "notice" | "success" } | null {
  if (!product.is_in_stock) return { text: format(locale, messages.soldOut), tone: "notice" };
  const left = product.stock_level;
  const own = product.definition.low_stock_threshold;
  const lowStock = typeof own === "number" ? own : storeLowStock;
  if (typeof left === "number" && left > 0 && left <= lowStock) {
    return { text: format(locale, messages.onlyLeft, { count: left }), tone: "success" };
  }
  return null;
}

/**
 * What is left to choose before one click can add it: a parent's options,
 * or else the required modifiers without a value in `modifiers` (a
 * variant's options are already its own values). "Choose size and colour"
 * for one or two; "Choose options" otherwise.
 */
export function chooseLabel(product: CatalogProduct, locale: string, modifiers: Record<string, string> = {}): string {
  const missing = product.product_type === "parent"
    ? productOptions(product)
    : productModifiers(product).filter(({ name, required }) => required && !modifiers[name]);
  const [first, second, ...more] = missing.map(({ name, label }) => (label || name).toLowerCase());
  if (first && second && !more.length) return format(locale, messages.chooseTwo, { first, second });
  if (first && !second) return format(locale, chooseMessage(first), { option: first });
  return format(locale, messages.chooseOptions);
}

/** An `<img>` for a catalog image; `null` unless its address is `https`. */
export function productImage(image: ProductImage | undefined, lazy: boolean): HTMLImageElement | null {
  if (!image || !isHttps(image.src)) return null;
  const img = document.createElement("img");
  img.src = image.src;
  img.alt = image.alt ?? "";
  if (lazy) img.loading = "lazy";
  if (image.width) img.width = image.width;
  if (image.height) img.height = image.height;
  return img;
}

/** schema.org data as a script element, with `<` escaped so a name can't close it. */
export function jsonLdScript(data: Record<string, unknown>): HTMLScriptElement {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
  return script;
}

/**
 * A cart URL for one click: `https://<store>/cart?sku=…`, never `name` or
 * `price`, which the cart takes from the catalog.
 */
export function addToCartHref(
  store: string,
  sku: string,
  extra: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams({ sku });
  for (const [name, value] of Object.entries(extra)) {
    if (value) params.set(name, value);
  }
  return `https://${store}/cart?${params}`;
}

export type Foxy2Event = "ready" | "cart-submit";

const watchers = new Set<(event: Foxy2Event) => void>();
let watching = false;

/**
 * Calls `callback` whenever the 2.0 cart session may have changed what the
 * element shows (its currency comes from the session's template set): once
 * the cart has loaded (`ready`) and after each add to it (`cart-submit`). 2.0
 * fills `FC.json` after `foxycart.js` loads, which may be after the element,
 * so this waits for `FC.client` for up to 15 seconds. Returns an unsubscribe.
 */
export function watchFoxy2Session(callback: (event: Foxy2Event) => void): () => void {
  watchers.add(callback);
  if (!watching) {
    watching = true;
    let tries = 0;
    const attach = (): void => {
      const on = window.FC?.client?.on;
      if (typeof on === "function") {
        const notify = (event: Foxy2Event) => (): void => watchers.forEach((watcher) => watcher(event));
        on.call(window.FC!.client, "ready.done", notify("ready"));
        on.call(window.FC!.client, "cart-submit.done", notify("cart-submit"));
        if (window.FC?.json?.locale_info) notify("ready")();
      } else if (++tries < 60) {
        setTimeout(attach, 250);
      }
    };
    attach();
  }
  return () => watchers.delete(callback);
}

/** Forgets the 2.0 session and everyone watching it. For tests. */
export function forgetFoxy2Session(): void {
  watchers.clear();
  watching = false;
}

/**
 * Runs `callback` once the element's children have been parsed. A script
 * that runs while the page is still parsing (not a module, not deferred)
 * connects the element before its children exist, and those children are
 * the merchant's fallback.
 */
export function whenParsed(callback: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}
