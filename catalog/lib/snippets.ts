import type { Spec } from "./specs";

export type FrameworkId = "react" | "vue" | "svelte" | "astro" | "vanilla" | "server";

export const FRAMEWORKS: { id: FrameworkId; label: string }[] = [
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "svelte", label: "Svelte" },
  { id: "astro", label: "Astro" },
  { id: "vanilla", label: "Vanilla" },
  { id: "server", label: "Server" },
];

export function snippetsFor(spec: Spec): Record<FrameworkId, string> {
  const json = JSON.stringify(spec, null, 2);
  return {
    react: `import { Chart } from "@chartkitdev/react";

const spec = ${json};

export function Panel() {
  return <Chart spec={spec} />;
}
`,
    vue: `<script setup>
import { Chart } from "@chartkitdev/vue";

const spec = ${json};
</script>

<template>
  <Chart :spec="spec" />
</template>
`,
    svelte: `<script>
  import { Chart } from "@chartkitdev/svelte";

  const spec = ${json};
</script>

<Chart {spec} />
`,
    astro: `---
import { Chart } from "@chartkitdev/astro";

const spec = ${json};
---

<Chart spec={spec} />
`,
    vanilla: `import { mount } from "@chartkitdev/vanilla";

const spec = ${json};

const chart = mount(document.querySelector("#chart"), spec);
chart.update(spec);
chart.destroy();
`,
    server: `import { render } from "@chartkitdev/core/all";

const spec = ${json};

const svg = render(spec);
`,
  };
}

export const frameworkDocs: Record<
  FrameworkId,
  { title: string; lede: string; install: string; server: string }
> = {
  react: {
    title: "React",
    lede: "The React adapter renders the same spec as the other adapters. Pass spec to Chart. The older dashboard components still exist, and their props are not spec keys.",
    install: "npm install @chartkitdev/react",
    server: `import { renderToString } from "react-dom/server";
import { Chart } from "@chartkitdev/react";

const html = renderToString(<Chart spec={spec} />);
`,
  },
  vue: {
    title: "Vue",
    lede: "Vue 3 binds the spec with :spec. Server rendering uses renderToString from @chartkitdev/vue/ssr, which goes through vue/server-renderer and includes the SVG.",
    install: "npm install @chartkitdev/vue",
    server: `import { renderToString } from "@chartkitdev/vue/ssr";

const html = await renderToString(spec);
`,
  },
  svelte: {
    title: "Svelte",
    lede: "The component uses export let, so Svelte 4 and Svelte 5 both compile it. SvelteKit SSR includes the SVG.",
    install: "npm install @chartkitdev/svelte",
    server: `// SvelteKit: the component renders the SVG during SSR.
// No extra server entry is required.
`,
  },
  astro: {
    title: "Astro",
    lede: "The component validates the spec and prints static SVG at build time. It ships no client script unless client is set, which hydrates with mount() from @chartkitdev/vanilla.",
    install: "npm install @chartkitdev/astro",
    server: `import { renderToString } from "@chartkitdev/astro";

const svg = renderToString(spec);
`,
  },
  vanilla: {
    title: "Vanilla",
    lede: "mount writes the SVG into an element you already have. update keeps that element and skips the write when the SVG is unchanged. destroy clears it. renderToString is the SVG string from core.",
    install: "npm install @chartkitdev/vanilla",
    server: `import { renderToString } from "@chartkitdev/vanilla";

const svg = renderToString(spec);
`,
  },
  server: {
    title: "Server",
    lede: "Core renders in Node with no DOM. render from @chartkitdev/core/all returns an SVG string. Pass a smaller renderer from createRenderer when a page only needs one chart.",
    install: "npm install @chartkitdev/core",
    server: `import { createRenderer } from "@chartkitdev/core";
import { line } from "@chartkitdev/core/charts/line";

const render = createRenderer([line]);
const svg = render(spec);
`,
  },
};
