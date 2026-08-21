import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(dirname, "src"),
    },
  },
  // Pre-bundle the element dependency graph up front. Vite otherwise discovers
  // these lazily, and when the cache predates a newly added test or story it
  // re-optimizes mid-run and reloads the browser, which vitest reports as
  // "Vite unexpectedly reloaded a test" and fails the file with "Failed to
  // fetch dynamically imported module". Re-running passes, which makes it read
  // as a flaky suite rather than a stale cache. Add an entry here whenever a
  // run logs "dependencies optimized: ...".
  optimizeDeps: {
    include: [
      "@foxy.io/design-system/alert",
      "@foxy.io/design-system/button",
      "@foxy.io/design-system/button-group",
      "@foxy.io/design-system/calendar",
      "@foxy.io/design-system/card",
      "@foxy.io/design-system/checkbox",
      "@foxy.io/design-system/dialog",
      "@foxy.io/design-system/field",
      "@foxy.io/design-system/input",
      "@foxy.io/design-system/item",
      "@foxy.io/design-system/radio",
      "@foxy.io/design-system/select",
      "@foxy.io/design-system/skeleton",
      "@foxy.io/design-system/spinner",
      "@foxy.io/design-system/summary-table",
      "@foxy.io/design-system/theme",
      "@foxy.io/sdk/checkout/client",
      "@foxy.io/sdk/customer",
      "@stripe/react-stripe-js",
      "@stripe/stripe-js/pure",
      "lucide-react",
      "react-intl",
      "react-svg-credit-card-payment-icons",
      "react/jsx-dev-runtime",
      "styled-components",
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
