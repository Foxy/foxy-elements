import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/web-components-vite";
import { format } from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import htmlPlugin from "prettier/plugins/html";
import "../src/index.css";

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
  ],
};

export default preview;
