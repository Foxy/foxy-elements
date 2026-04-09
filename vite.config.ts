/// <reference types="vitest/config" />
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      global: {},
      "process.env": env,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(dirname, "./src"),
      },
    },
    build: {
      lib: {
        entry: {
          elements: path.resolve(dirname, "src/lib/elements/index.ts"),
          "ach-field-element": path.resolve(
            dirname,
            "src/lib/elements/ach-field-element.ts",
          ),
          "card-embed-element": path.resolve(
            dirname,
            "src/lib/elements/card-embed-element.ts",
          ),
          "payment-method-selector-element": path.resolve(
            dirname,
            "src/lib/elements/payment-method-selector-element.tsx",
          ),
        },
        formats: ["es"],
        fileName: (_, entryName) => `${entryName}.js`,
      },
      rollupOptions: {
        external: ["react", "react-dom"],
      },
    },
  };
});
