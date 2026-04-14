import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/web-components-vite";
import "../src/index.css";

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
