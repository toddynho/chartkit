import path from "node:path";
import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  resolve: {
    conditions: ["browser"],
    alias: [
      { find: "@chartkitdev/core/extra", replacement: path.resolve(__dirname, "../core/src/extra.ts") },
      { find: "@chartkitdev/core/all", replacement: path.resolve(__dirname, "../core/src/all.ts") },
      { find: "@chartkitdev/core", replacement: path.resolve(__dirname, "../core/src/index.ts") },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
