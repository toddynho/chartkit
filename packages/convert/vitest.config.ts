import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@chartkitdev/core/validate": path.resolve(__dirname, "../core/src/validate.ts"),
    },
  },
  test: { environment: "node" },
});
