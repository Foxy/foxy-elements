import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/web-components-vite";
import { useEffect } from "storybook/preview-api";
import { format } from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import htmlPlugin from "prettier/plugins/html";
import { THEME_PROPERTY_TO_ATTRIBUTE, type ThemePropertyName } from "../src/lib/theme-mixin";
import "../src/index.css";

/**
 * Tag names for every element in this repo that extends `ThemeMixin` --
 * kept as a literal list rather than a generic `[setThemeProperty]` duck-type
 * scan so this list is the one place a new themeable element needs adding.
 */
const THEMEABLE_TAGS = [
  "foxy-customer-portal",
  "foxy-payment-method-selector",
  "foxy-ach-field",
  "foxy-payment-card-field",
] as const;

type ThemePreset = Partial<Record<ThemePropertyName, string>>;

/**
 * Values for each demo theme, expressed as `ThemeMixin` property overrides
 * (same 17 tokens `.storybook/preview-head.html`'s CSS custom properties set
 * on `:root`) rather than relying on that CSS to reach a themeable element on
 * its own. It would, eventually -- `getThemeProperty` does fall back to a
 * `--`-prefixed custom property on `document.documentElement` -- but
 * `withThemeByClassName` toggles that class from a `useEffect`, which runs
 * *after* the story's own render commits. A `foxy-customer-portal` (or any
 * other themeable element) that already mounted before that effect fires
 * caught the previous/default value and has no reason to render again: an
 * ancestor's CSS class changing isn't an event a custom element observes.
 * Setting the attribute directly, below, is -- `attributeChangedCallback`
 * fires synchronously and reliably, which is exactly why `theme-mixin.ts`'s
 * own tests exercise the attribute path, not the CSS-var one, to prove a
 * theme override reaches rendered shadow DOM.
 *
 * `themeBackgroundButtonPrimary` stays light/bright in every theme,
 * including the two dark ones: it pairs with `defaultTheme.color
 * .onButtonPrimary`, a fixed dark color with no `ThemeMixin` override, so a
 * dark button background here would make its own text unreadable.
 */
const THEME_PRESETS: Record<string, ThemePreset> = {
  Default: {},
  "Neo Brutalism": {
    themeBackgroundSurface: "#ffffff",
    themeBackgroundField: "#ffffff",
    themeBackgroundDisabledField: "#e5e5e5",
    themeColorBody: "#000000",
    themeColorPrimary: "#ff3b30",
    themeColorSecondary: "#000000",
    themeColorError: "#000000",
    themeColorOnPrimary: "#ffffff",
    themeBackgroundButtonPrimary: "#ffd600",
    themeBackgroundError: "#000000",
    themeBorderField: "0.25rem solid #000000",
    themeOutlinePrimary: "0.25rem solid #000000",
    themeFontBody: "700 1rem/1.4 'DM Sans', sans-serif",
    themeBorderRadiusSm: "0rem",
    themeSpaceMd: "0.75rem",
    themeSizeControl: "2.75rem",
    themeSizeBorderWidth: "0.1875rem",
  },
  "Quantum Rose": {
    themeBackgroundSurface: "#fdf2f8",
    themeBackgroundField: "#fff5fa",
    themeBackgroundDisabledField: "#f5e4ed",
    themeColorBody: "#4a1942",
    themeColorPrimary: "#e0115f",
    themeColorSecondary: "#a34d78",
    themeColorError: "#c1272d",
    themeColorOnPrimary: "#ffffff",
    themeBackgroundButtonPrimary: "#f6a8c9",
    themeBackgroundError: "rgba(193, 39, 45, 0.1)",
    themeBorderField: "0.125rem solid #f0a8c4",
    themeOutlinePrimary: "0.1875rem solid #f7d3e3",
    themeFontBody: "400 1rem/1.5 'Poppins', sans-serif",
    themeBorderRadiusSm: "0.75rem",
    themeSpaceMd: "0.75rem",
    themeSizeControl: "2.5rem",
    themeSizeBorderWidth: "0.125rem",
  },
  "Amethyst Haze": {
    themeBackgroundSurface: "#f7f5fb",
    themeBackgroundField: "#ffffff",
    themeBackgroundDisabledField: "#eae6f0",
    themeColorBody: "#3a3348",
    themeColorPrimary: "#8b7bae",
    themeColorSecondary: "#6f6785",
    themeColorError: "#b5484f",
    themeColorOnPrimary: "#f7f5fb",
    themeBackgroundButtonPrimary: "#d8cde8",
    themeBackgroundError: "rgba(181, 72, 79, 0.08)",
    themeBorderField: "0.125rem solid #d3c9e3",
    themeOutlinePrimary: "0.1875rem solid #e4dcf0",
    themeFontBody: "400 1rem/1.5 'Manrope', sans-serif",
    themeBorderRadiusSm: "0.625rem",
    themeSpaceMd: "0.75rem",
    themeSizeControl: "2.5rem",
    themeSizeBorderWidth: "0.125rem",
  },
  "Midnight Slate": {
    themeBackgroundSurface: "#23262f",
    themeBackgroundField: "#2b2e38",
    themeBackgroundDisabledField: "#363a46",
    themeColorBody: "#edf1f7",
    themeColorPrimary: "#6fb3e0",
    themeColorSecondary: "#a7afc4",
    themeColorError: "#e2665a",
    themeColorOnPrimary: "#14161f",
    themeBackgroundButtonPrimary: "#8fc7ea",
    themeBackgroundError: "rgba(226, 102, 90, 0.18)",
    themeBorderField: "0.125rem solid #4a4f5e",
    themeOutlinePrimary: "0.1875rem solid #3a6e8f",
    themeFontBody: "400 1rem/1.5 'IBM Plex Sans', sans-serif",
    themeBorderRadiusSm: "0.625rem",
    themeSpaceMd: "0.75rem",
    themeSizeControl: "2.5rem",
    themeSizeBorderWidth: "0.125rem",
  },
  "High Contrast Dark": {
    themeBackgroundSurface: "#0a0b10",
    themeBackgroundField: "#17181f",
    themeBackgroundDisabledField: "#24262e",
    themeColorBody: "#ffffff",
    themeColorPrimary: "#7ec8ff",
    themeColorSecondary: "#d6dae3",
    themeColorError: "#ff8a73",
    themeColorOnPrimary: "#000000",
    themeBackgroundButtonPrimary: "#9ad1ff",
    themeBackgroundError: "rgba(255, 138, 115, 0.22)",
    themeBorderField: "0.1875rem solid #9fa6b5",
    themeOutlinePrimary: "0.25rem solid #7ec8ff",
    themeFontBody: "500 1rem/1.5 'IBM Plex Sans', sans-serif",
    themeBorderRadiusSm: "0.375rem",
    themeSpaceMd: "0.75rem",
    themeSizeControl: "2.75rem",
    themeSizeBorderWidth: "0.1875rem",
  },
};

const THEME_PROPERTY_NAMES = Object.keys(
  THEME_PROPERTY_TO_ATTRIBUTE,
) as ThemePropertyName[];

type ThemeElementLike = HTMLElement & {
  setThemeProperty(name: ThemePropertyName, value: string | undefined): void;
};

function applyThemePreset(themeName: string): void {
  const preset = THEME_PRESETS[themeName] ?? {};

  for (const tag of THEMEABLE_TAGS) {
    for (const element of document.querySelectorAll(tag)) {
      const themeElement = element as ThemeElementLike;
      for (const property of THEME_PROPERTY_NAMES) {
        themeElement.setThemeProperty(property, preset[property]);
      }
    }
  }

  // `themeColorBody` is plain page text -- headings, outline-button labels,
  // the pagination counter -- rendered directly on the page background, not
  // inside a `background.surface` card. The two dark presets set it to
  // white, which is invisible without a dark page behind it. `preview-head
  // .html` used to darken the page via `:root.demo-theme-dark body { ... }`,
  // driven by the same CSS custom property/class-toggle mechanism this
  // decorator's own doc comment above explains is too late for an
  // already-mounted element -- and empirically, that rule's *own* value
  // sometimes failed to repaint even once applied, which a directly-set
  // inline style (as below) does not. Setting `.style.backgroundColor`
  // imperatively is the same proven-reliable mechanism `setThemeProperty`
  // itself already uses (an attribute/property mutation, not a bare CSS
  // cascade change), just aimed at the page instead of a custom element.
  document.body.style.backgroundColor = preset.themeBackgroundSurface ?? "";
}

function humanizeHtmlTextNodes(source: string): string {
  // Expand common single-line text nodes so labels and notes read like hand-written markup.
  const normalizedInlineText = source.replace(
    /^(\s*)<((?:label|p|button|span|legend|h[1-6]))([^>]*)>([^<\n][^<]*?)<\/\2>$/gm,
    (_match, indent: string, tag: string, attrs: string, text: string) => {
      const cleanText = text.trim();

      if (!cleanText) {
        return `${indent}<${tag}${attrs}></${tag}>`;
      }

      return `${indent}<${tag}${attrs}>\n${indent}  ${cleanText}\n${indent}</${tag}>`;
    },
  );

  // Storybook sometimes wraps the closing bracket onto the next line:
  // `>Text</label\n  ><next-tag`.
  const normalizedWrappedClosers = normalizedInlineText.replace(
    />\s*([^<\n][^<]*?)<\/([a-z0-9-]+)\s*>/gi,
    (match, text: string, tag: string, offset: number, full: string) => {
      const lineStart = full.lastIndexOf("\n", offset) + 1;
      const linePrefix = full.slice(lineStart, offset);
      const indentMatch = linePrefix.match(/^\s*/);
      const indent = indentMatch?.[0] ?? "";
      const cleanText = text.trim();

      if (!cleanText) {
        return match;
      }

      return `>\n${indent}  ${cleanText}\n${indent}</${tag}>`;
    },
  );

  return normalizedWrappedClosers.replace(
    /(<\/(?:label|p|button|span|legend|h[1-6])>)</gi,
    "$1\n<",
  );
}

async function formatStorySource(source: string): Promise<string> {
  const trimmed = source.trim();

  if (!trimmed) {
    return source;
  }

  try {
    const parser = trimmed.startsWith("<") ? "html" : "babel";
    const formatted = await format(trimmed, {
      parser,
      plugins: [babelPlugin, estreePlugin, htmlPlugin],
      printWidth: 100,
    });

    if (parser === "html") {
      return humanizeHtmlTextNodes(formatted);
    }

    return formatted;
  } catch {
    return source;
  }
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    options: {
      storySort: {
        order: ["Introduction", "*"],
      },
    },
    docs: {
      source: {
        transform: async (source: string): Promise<string> => formatStorySource(source),
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        Default: "",
        "Neo Brutalism": "demo-theme-one",
        "Quantum Rose": "demo-theme-two",
        "Amethyst Haze": "demo-theme-three",
        "Midnight Slate": "demo-theme-dark",
        "High Contrast Dark": "demo-theme-dark-hc",
      },
      defaultTheme: "Default",
    }),
    // Reuses `withThemeByClassName`'s own toolbar/global (`context.globals.theme`)
    // rather than defining a second one, so its dropdown remains the single
    // source of the selected theme name. See `applyThemePreset`'s doc comment
    // for why this attribute-setting effect is what actually makes switching
    // themes visible, not the CSS class/custom-properties `preview-head.html`
    // sets (those still apply, for anyone reading rendered markup, but a
    // themeable element that already mounted has no reason to notice them).
    (storyFn, context) => {
      const themeName = (context.globals as { theme?: string }).theme ?? "Default";

      // No dependency array: this must re-run on every story mount, not only
      // when `themeName` changes. Navigating to a *different* story while a
      // theme is already selected mounts a brand-new themeable element with
      // none of the previous one's attributes -- deps-gated on `themeName`
      // alone would skip it, since the theme itself didn't change. The cost
      // of running unconditionally is a handful of attribute sets on at most
      // a few custom elements per story.
      useEffect(() => {
        applyThemePreset(themeName);
      });

      return storyFn();
    },
  ],
};

export default preview;
