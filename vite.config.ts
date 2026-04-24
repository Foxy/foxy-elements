/// <reference types="vitest/config" />

import pluginExternal from "vite-plugin-external";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

import { dependencies } from "./package.json";
import { resolve } from "node:path";

import {
  type BuildEnvironmentOptions,
  type LibraryOptions,
  type PluginOption,
  defineConfig,
} from "vite";

export default defineConfig(({ mode }) => {
  const rolldownOptions: BuildEnvironmentOptions["rolldownOptions"] = {};
  const plugins: PluginOption[] = [react(), tailwindcss()];
  const srcDir = resolve(import.meta.dirname, "./src");
  const elementsDir = resolve(srcDir, "./elements");
  const entry: LibraryOptions["entry"] = {};
  const isCDN = mode === "cdn";

  entry["foxy-ach-field"] = resolve(elementsDir, "./ach-field-element.ts");
  entry["foxy-payment-card-field"] = resolve(
    elementsDir,
    "./payment-card-field-element.ts",
  );
  entry["foxy-payment-method-selector"] = resolve(
    elementsDir,
    "./payment-method-selector-element.tsx",
  );

  if (isCDN) {
    plugins.push(
      pluginExternal({
        externals: {
          "@foxy.io/sdk/checkout": "https://cdn-js.foxy.io/sdk@2/checkout.js",
          "@foxy.io/sdk/checkout/client": "https://cdn-js.foxy.io/sdk@2/checkout/client.js",
          "@foxy.io/sdk/checkout/loader": "https://cdn-js.foxy.io/sdk@2/checkout/loader.js",
        },
      }),
    );
  } else {
    plugins.push(
      pluginExternal({
        externalizeDeps: Object.keys(dependencies),
        nodeBuiltins: true,
      }),
      dts({
        tsconfigPath: "./tsconfig.app.json",
        rollupTypes: true,
      }),
    );

    rolldownOptions.output = {
      postBanner: "/* See licenses of bundled dependencies in LICENSE.md */",
    };

    entry.index = resolve(elementsDir, "./index.ts");
  }

  return {
    plugins,
    resolve: { alias: { "@": srcDir } },
    build: {
      rolldownOptions,
      sourcemap: !isCDN,
      license: isCDN && { fileName: "LICENSE.md" },
      minify: isCDN,
      outDir: `dist/${isCDN ? "cdn" : "npm"}`,
      lib: {
        fileName: (_, entryName) => `${entryName}.js`,
        formats: ["es"],
        entry,
      },
    },
  };
});
