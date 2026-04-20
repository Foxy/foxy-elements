/// <reference types="vitest/config" />
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
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
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(dirname, "./src"),
      },
    },
    build: {
      lib: {
        entry: {
          elements: path.resolve(dirname, "src/elements/index.ts"),
          "ach-field-element": path.resolve(
            dirname,
            "src/elements/ach-field-element.ts",
          ),
          "payment-card-field-element": path.resolve(
            dirname,
            "src/elements/payment-card-field-element.ts",
          ),
          "payment-method-selector-element": path.resolve(
            dirname,
            "src/elements/payment-method-selector-element.tsx",
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
