/// <reference types="vitest/config" />

import pluginExternal from "vite-plugin-external";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

import { dependencies, peerDependencies } from "./package.json";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  type BuildEnvironmentOptions,
  type LibraryOptions,
  type PluginOption,
  defineConfig,
} from "vite";
import { readdirSync } from "node:fs";

export default defineConfig(({ mode }) => {
  const rolldownOptions: BuildEnvironmentOptions["rolldownOptions"] = {};
  const plugins: PluginOption[] = [react(), tailwindcss()];
  const externalPackages = [
    ...Object.keys(dependencies),
    ...Object.keys(peerDependencies ?? {}),
  ];
  const srcDir = resolve(import.meta.dirname, "./src");
  const isCDN = mode === "cdn";
  const elementsDir = resolve(srcDir, "./elements");
  const sdkBase = "https://cdn-js.foxy.io/sdk@2";

  const entry: LibraryOptions["entry"] = Object.fromEntries(
    readdirSync(elementsDir, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dir) => [dir.name, resolve(elementsDir, `./${dir.name}/index.ts`)]),
  );

  if (isCDN) {
    plugins.push(
      pluginExternal({
        externals: {
          "@foxy.io/sdk/checkout": `${sdkBase}/checkout.js`,
          "@foxy.io/sdk/checkout/client": `${sdkBase}/checkout/client.js`,
          "@foxy.io/sdk/checkout/loader": `${sdkBase}/checkout/loader.js`,
        },
      }),
    );

    rolldownOptions.output = {
      postBanner: "/* See licenses of bundled dependencies in LICENSE.md */",
    };
  } else {
    plugins.push(
      pluginExternal({
        externalizeDeps: externalPackages,
        nodeBuiltins: true,
      }),
      dts({
        tsconfigPath: "./tsconfig.app.json",
        rollupTypes: true,
      }),
    );

    entry.index = resolve(elementsDir, "./index.ts");
  }

  const certFile = resolve(import.meta.dirname, ".certs/elements.foxy.test.pem");
  const keyFile = resolve(import.meta.dirname, ".certs/elements.foxy.test-key.pem");
  const hasLocalCerts = existsSync(certFile) && existsSync(keyFile);

  return {
    plugins,
    resolve: { alias: { "@": srcDir } },
    server: hasLocalCerts
      ? { https: { cert: readFileSync(certFile), key: readFileSync(keyFile) } }
      : undefined,
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
