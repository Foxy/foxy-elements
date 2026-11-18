import { format, messages } from "./messages";
import { isHttps } from "./markdown";
import {
  formatPrice,
  priceRange,
  productPrice,
} from "./price";
import type { CatalogProduct, ProductImage } from "./types";

const STYLE_ID = "foxy-product-styles";

// Each look value reads the element's own variable first (set by an attribute
// or the page's CSS), then the store's saved look, then the theme's, then the
// default theme's value.
const tier = (name: string, fallback: string): string =>
  `var(--foxy-product-${name}, var(--foxy-store-${name}, var(--foxy-theme-${name}, ${fallback})))`;
const font = tier("font", "inherit");
const nameColor = tier("text-color", "#111827");
const button = tier("button-color", "#111827");
const onButton = tier("button-text-color", "#FFFFFF");
const buttonRadius = tier("button-radius", "8px");
const radius = "var(--foxy-product-radius, 8px)";
const fieldRadius = "var(--foxy-product-field-radius, 8px)";
const accent = "var(--foxy-product-accent-color, #111827)";
const onAccent = "var(--foxy-product-on-accent-color, #FFFFFF)";
const body = "var(--foxy-product-body-color, #1F2937)";
const muted = "var(--foxy-product-muted-color, #6B7280)";
const prose = "var(--foxy-product-description-color, #4B5563)";
const border = "var(--foxy-product-border-color, #D1D5DB)";
const fieldBorder = "var(--foxy-product-field-border-color, #D1D5DB)";
const divider = "var(--foxy-product-divider-color, #E5E7EB)";
const surface = "var(--foxy-product-surface-color, #FFFFFF)";
const panel = "var(--foxy-product-panel-color, #F3F4F6)";
const header = "var(--foxy-product-header-color, #F9FAFB)";
const onDisabled = "var(--foxy-product-disabled-text-color, #4B5563)";
const notice = "var(--foxy-product-notice-color, #B91C1C)";
const success = "var(--foxy-product-success-color, #15803D)";
// A card: the form, a tile, and each panel of the page.
const card = `border: var(--foxy-product-card-border, 1px solid #E5E7EB); border-radius: var(--foxy-product-card-radius, 12px); box-shadow: var(--foxy-product-card-shadow, none); background: var(--foxy-product-card-bar, none) top / 100% 4px no-repeat, ${surface};`;
const cardPadding = (size: string): string => `var(--foxy-product-card-padding, ${size})`;
const chevron = (color: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E")`;

const ELEMENTS =
  "foxy-product-link, foxy-product-form, foxy-product-tile, foxy-product-collection, foxy-product-page";

// A theme is a set of variables chosen by the element's `theme` attribute.
// `:where()` keeps each rule as light as a plain element selector, so the
// page's CSS can set the same variables without out-weighing it.
const theme = (name: string, variables: Record<string, string>): string =>
  `:is(${ELEMENTS}):where([theme="${name}"]) { ${Object.entries(variables)
    .map(([key, value]) => `--foxy-${key}: ${value};`)
    .join(" ")} }`;

const THEMES = [
  // Square, type and space only: for a site that brings its own styling.
  // currentColor, not inherit: on a custom property, inherit takes the
  // parent's value of that property, so var() would fall through.
  theme("plain", {
    "theme-text-color": "currentColor",
    "theme-button-color": "transparent",
    "theme-button-text-color": "currentColor",
    "theme-button-radius": "0px",
    "product-button-border": "1px solid currentColor",
    "product-radius": "0px",
    "product-field-radius": "0px",
    "product-accent-color": "currentColor",
    "product-on-accent-color": "currentColor",
    "product-selected-color": "transparent",
    "product-body-color": "currentColor",
    "product-muted-color": "currentColor",
    "product-description-color": "currentColor",
    "product-border-color": "currentColor",
    "product-field-border-color": "currentColor",
    "product-divider-color": "rgba(127, 127, 127, 0.35)",
    "product-surface-color": "transparent",
    "product-panel-color": "rgba(127, 127, 127, 0.14)",
    "product-header-color": "transparent",
    "product-card-border": "0",
    "product-card-radius": "0px",
    "product-card-padding": "0px",
  }),
  // Foxy's purple, under the unicorn's rainbow.
  theme("foxy", {
    "theme-text-color": "#2B1B3D",
    "theme-button-color": "#5B2A86",
    "theme-button-radius": "10px",
    "product-accent-color": "#5B2A86",
    "product-panel-color": "#F6F1FA",
    "product-card-border": "1px solid #E9DDF3",
    "product-card-radius": "14px",
    "product-card-bar": "linear-gradient(90deg, #F2798F, #F6A45C, #F4D35E, #7BC67B, #5AA9E6, #9B6DD6)",
    "product-card-shadow": "0 6px 24px rgba(91, 42, 134, 0.10)",
  }),
  // The 2.0 cart and checkout: green, square, Helvetica.
  theme("cart", {
    "theme-font": '"Helvetica Neue", Helvetica, Arial, sans-serif',
    "theme-text-color": "#333333",
    "theme-button-color": "#3F8A2E",
    "theme-button-radius": "0px",
    "product-button-weight": "400",
    "product-radius": "0px",
    "product-field-radius": "0px",
    "product-accent-color": "#666666",
    "product-border-color": "#D5D5D5",
    "product-field-border-color": "#CCCCCC",
    "product-card-border": "0",
    "product-card-radius": "0px",
  }),
  theme("bookshop", {
    "theme-font": 'Georgia, "Times New Roman", serif',
    "theme-text-color": "#1B2A49",
    "theme-button-color": "#1B365D",
    "theme-button-radius": "0px",
    "product-button-weight": "700",
    "product-button-tracking": "0.06em",
    "product-button-transform": "uppercase",
    "product-button-font": "system-ui, sans-serif",
    "product-radius": "0px",
    "product-field-radius": "0px",
    "product-accent-color": "#1B365D",
    "product-card-radius": "0px",
    "product-card-shadow": "0 2px 8px rgba(0, 0, 0, 0.12)",
  }),
  theme("soft", {
    "theme-font": 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    "theme-text-color": "#1F2937",
    "theme-button-color": "#2563EB",
    "theme-button-radius": "12px",
    "product-radius": "14px",
    "product-field-radius": "10px",
    "product-accent-color": "#2563EB",
    "product-card-border": "0",
    "product-card-radius": "18px",
    "product-card-shadow": "0 1px 3px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)",
  }),
  theme("market", {
    "theme-font": 'Georgia, "Times New Roman", serif',
    "theme-text-color": "#3B2F2F",
    "theme-button-color": "#B45309",
    "theme-button-radius": "999px",
    "product-accent-color": "#92400E",
    "product-surface-color": "#FFFDF9",
    "product-panel-color": "#FAF5EE",
    "product-border-color": "#E7DCCB",
    "product-field-border-color": "#D9CBB5",
    "product-divider-color": "#EDE3D3",
    "product-card-border": "1px solid #E7DCCB",
  }),
  // For a page with a dark background.
  theme("dark", {
    "theme-text-color": "#F9FAFB",
    "theme-button-color": "#F9FAFB",
    "theme-button-text-color": "#111827",
    "product-accent-color": "#F9FAFB",
    "product-on-accent-color": "#111827",
    "product-body-color": "#E5E7EB",
    "product-muted-color": "#9CA3AF",
    "product-description-color": "#D1D5DB",
    "product-border-color": "#4B5563",
    "product-field-border-color": "#4B5563",
    "product-divider-color": "#374151",
    "product-surface-color": "#111827",
    "product-panel-color": "#1F2937",
    "product-header-color": "#1F2937",
    "product-disabled-color": "#374151",
    "product-disabled-text-color": "#D1D5DB",
    "product-disabled-opacity": "1",
    "product-notice-color": "#FCA5A5",
    "product-success-color": "#86EFAC",
    "product-card-border": "1px solid #374151",
    "product-chevron": chevron("D1D5DB"),
  }),
].join("\n");

// Everything renders into light DOM, so that 2.0's `foxycart.js` sees the
// links and forms and search engines the text. That leaves it open to the
// page's CSS, so each rule starts with the element's name inside `:is()`:
// that outweighs a theme's `button`, `label` or `.content a`, and ties are
// won by this stylesheet being added to the page last.
const STYLES = `
${THEMES}
:is(${ELEMENTS}):where([theme="dark"]) { color-scheme: dark; }
:is(${ELEMENTS}):where([font="inherit"], [data-foxy-store-font="inherit"]:not([font])) { font-family: inherit; }
:is(${ELEMENTS}) { font-family: ${font}; color: ${body}; line-height: 1.4; }
:is(${ELEMENTS}) :where(h1, h2, h3, h4, h5, h6, p, dl, dd, fieldset, legend) { margin: 0; padding: 0; }
:is(${ELEMENTS}) :where(button, input, select) { font-family: inherit; }
:is(${ELEMENTS}) [hidden] { display: none !important; }
:is(foxy-product-link) { display: inline-block; }
:is(foxy-product-form, foxy-product-tile, foxy-product-collection, foxy-product-page) { display: block; }

:is(${ELEMENTS}) :is(a, button).foxy-product-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.35em; box-sizing: border-box;
  min-height: 48px; padding: 0 24px; border: var(--foxy-product-button-border, 0); border-radius: ${buttonRadius};
  background: ${button}; color: ${onButton}; font-family: var(--foxy-product-button-font, inherit); font-size: 15px;
  font-weight: var(--foxy-product-button-weight, 600); line-height: 1.2; letter-spacing: var(--foxy-product-button-tracking, 0);
  text-transform: var(--foxy-product-button-transform, none); text-align: center; text-decoration: none; cursor: pointer;
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
:is(foxy-product-link) a.foxy-product-text-link { color: ${accent}; font-size: 15px; text-decoration: underline; }
:is(foxy-product-link) a.foxy-product-text-link[aria-disabled="true"] { text-decoration: none; cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-button s { color: inherit; opacity: 0.75; }

:is(${ELEMENTS}) .foxy-product-price { color: ${nameColor}; }
:is(${ELEMENTS}) .foxy-product-price s { margin-inline-start: 8px; color: ${muted}; font-size: 0.82em; }
:is(${ELEMENTS}) :is(.foxy-product-button, .foxy-product-text-link) .foxy-product-price { color: inherit; }
:is(${ELEMENTS}) .foxy-product-brand { color: ${muted}; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; }
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
:is(foxy-product-tile) .foxy-product-brand { font-size: 11px; }
:is(foxy-product-tile) .foxy-product-name { font-size: 16px; line-height: 1.35; }
:is(foxy-product-tile) .foxy-product-name a { color: inherit; text-decoration: none; }
:is(foxy-product-tile) .foxy-product-name a:hover { text-decoration: underline; }
:is(foxy-product-tile) .foxy-product-tile-price { font-size: 16px; }
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
:is(foxy-product-form) .foxy-product-summary .foxy-product-price { font-size: 20px; }

:is(${ELEMENTS}) .foxy-product-controls { display: flex; flex-direction: column; gap: 18px; margin: 0; }
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
  background-image: var(--foxy-product-chevron, ${chevron("6B7280")}); background-repeat: no-repeat; background-position: right 14px center;
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
:is(foxy-product-page) .foxy-product-main { display: flex; flex-wrap: wrap; gap: 40px; box-sizing: border-box; padding: ${cardPadding("32px")}; ${card} }
:is(foxy-product-page) .foxy-product-gallery { display: flex; flex: 1 1 460px; flex-direction: column; gap: 12px; min-width: 0; }
:is(foxy-product-page) .foxy-product-hero { aspect-ratio: 1 / 1; overflow: hidden; border-radius: ${radius}; background: ${panel}; }
:is(foxy-product-page) .foxy-product-hero img { display: block; width: 100%; height: 100%; object-fit: var(--foxy-product-photo-fit, contain); }
:is(foxy-product-page) .foxy-product-thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 10px; }
:is(foxy-product-page) .foxy-product-thumbs button { aspect-ratio: 1 / 1; padding: 0; overflow: hidden; border: 2px solid ${divider}; border-radius: ${radius}; background: ${panel}; cursor: pointer; }
:is(foxy-product-page) .foxy-product-thumbs button[aria-current="true"] { border-color: ${accent}; }
:is(foxy-product-page) .foxy-product-thumbs button:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
:is(foxy-product-page) .foxy-product-thumbs img { display: block; width: 100%; height: 100%; object-fit: cover; }
:is(foxy-product-page) .foxy-product-info { display: flex; flex: 1 1 340px; flex-direction: column; gap: 20px; min-width: 0; max-width: 480px; }
:is(foxy-product-page) .foxy-product-summary { gap: 6px; }
:is(foxy-product-page) .foxy-product-brand { font-size: 13px; }
:is(foxy-product-page) .foxy-product-name { font-size: 32px; line-height: 1.2; }
:is(foxy-product-page) .foxy-product-price-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; }
:is(foxy-product-page) .foxy-product-summary .foxy-product-price { font-size: 26px; }
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
:is(foxy-product-page) .foxy-product-details dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; font-size: 14px; }
:is(foxy-product-page) .foxy-product-details dt { color: ${muted}; }
:is(foxy-product-page) .foxy-product-details dd { overflow-wrap: anywhere; }
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
    was.textContent = formatPrice(listPrice, currency, locale);
    was.setAttribute("aria-label", format(locale, messages.priceWas, {
      price: formatPrice(listPrice, currency, locale),
    }));
    nodes.push(" ", was);
  }
  return nodes;
}

/**
 * The price as text nodes: `$24.95`, a struck-through list price beside it,
 * or `$22.00 – $26.00` for a parent whose variants differ.
 */
export function renderPrice(
  product: CatalogProduct,
  currency: string | null,
  locale: string,
): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "foxy-product-price";

  const range = priceRange(product, currency);
  if (product.product_type === "parent" && range && range.min !== range.max) {
    span.textContent = format(locale, messages.priceRange, {
      min: formatPrice(range.min, currency, locale),
      max: formatPrice(range.max, currency, locale),
    });
    return span;
  }

  const { price, listPrice } = productPrice(product, currency);
  const isParent = product.product_type === "parent";
  const amount = isParent ? range?.min ?? price : price;
  if (amount !== null) span.append(...priceNodes(amount, isParent ? null : listPrice, currency, locale));
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

const watchers = new Set<() => void>();
let watching = false;

/**
 * Calls `callback` whenever the 2.0 cart session may have changed what the
 * element shows (its currency comes from the session's template set). 2.0
 * fills `FC.json` after `foxycart.js` loads, which may be after the element,
 * so this waits for `FC.client` for up to 15 seconds. Returns an unsubscribe.
 */
export function watchFoxy2Session(callback: () => void): () => void {
  watchers.add(callback);
  if (!watching) {
    watching = true;
    let tries = 0;
    const attach = (): void => {
      const on = window.FC?.client?.on;
      if (typeof on === "function") {
        const notify = (): void => watchers.forEach((watcher) => watcher());
        on.call(window.FC!.client, "ready.done", notify);
        on.call(window.FC!.client, "cart-submit.done", notify);
        if (window.FC?.json?.locale_info) notify();
      } else if (++tries < 60) {
        setTimeout(attach, 250);
      }
    };
    attach();
  }
  return () => watchers.delete(callback);
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
