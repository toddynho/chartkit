import path from "node:path";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [qwikVite()],
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [/^@builder.io\/qwik(\/|$)/, /^@chartkitdev\/core(\/|$)/, /^@chartkitdev\/vanilla(\/|$)/],
    },
  },
});
