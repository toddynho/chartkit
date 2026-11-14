import type { StackId } from "./stacks.ts";
import { mcpConfig } from "./mcp-config.ts";

export { mcpConfig };

/**
 * The chart the quick start renders, and the object inside every snippet.
 * Field names match a v1 line spec: version, type, data, encoding, a11y.alt.
 */
export const quickSpec = {
  version: "1" as const,
  type: "line" as const,
  data: [
    { week: "W1", signups: 18 },
    { week: "W2", signups: 42 },
  ],
  encoding: { x: "week" as const, y: "signups" as const },
  a11y: { alt: "Signups rose from 18 to 42." },
};

const specBlock = `const spec = {
  version: "1",
  type: "line",
  data: [
    { week: "W1", signups: 18 },
    { week: "W2", signups: 42 },
  ],
  encoding: { x: "week", y: "signups" },
  a11y: { alt: "Signups rose from 18 to 42." },
};`;

/**
 * Paste into Cursor, Claude, or ChatGPT.
 * Points at llms.txt, then validate(), repair(), and render().
 */
export const agentPrompt = `Read https://chartkit.dev/llms.txt.
Write a ChartKit spec (JSON, version "1") for this chart.
Run validate() on the spec. If validate() reports errors, run repair().
Render it with the ChartKit package for my framework, or show the rendered SVG.`;

export type QuickStack = {
  id: StackId;
  /** Full picker label. Not a shortened chip. */
  label: string;
  install: string;
  snippet: string;
  /** Code caption. */
  caption: string;
};

/**
 * Install plus a mount snippet for each adapter.
 * Names match the package entrypoints: Chart, mount, and the chart-kit element.
 * Qwik's component$ and Angular's Component and ck-chart selector match those packages' own examples.
 */
export const quickStacks: QuickStack[] = [
  {
    id: "react",
    label: "React",
    caption: "tsx",
    install: "npm install @chartkitdev/core @chartkitdev/react",
    snippet: `import { Chart } from "@chartkitdev/react";

${specBlock}

export function Panel() {
  return <Chart spec={spec} />;
}`,
  },
  {
    id: "vue",
    label: "Vue",
    caption: "vue",
    install: "npm install @chartkitdev/core @chartkitdev/vue",
    snippet: `<script setup>
import { Chart } from "@chartkitdev/vue";

${specBlock}
</script>

<template>
  <Chart :spec="spec" />
</template>`,
  },
  {
    id: "svelte",
    label: "Svelte",
    caption: "svelte",
    install: "npm install @chartkitdev/core @chartkitdev/svelte",
    snippet: `<script>
  import { Chart } from "@chartkitdev/svelte";

  ${specBlock.replaceAll("\n", "\n  ")}
</script>

<Chart {spec} />`,
  },
  {
    id: "astro",
    label: "Astro",
    caption: "astro",
    install: "npm install @chartkitdev/core @chartkitdev/astro",
    snippet: `---
import { Chart } from "@chartkitdev/astro";

${specBlock}
---

<Chart spec={spec} />`,
  },
  {
    id: "solid",
    label: "Solid",
    caption: "tsx",
    install: "npm install @chartkitdev/core @chartkitdev/solid",
    snippet: `import { Chart } from "@chartkitdev/solid";

${specBlock}

export function Panel() {
  return <Chart spec={spec} />;
}`,
  },
  {
    id: "qwik",
    label: "Qwik",
    caption: "tsx",
    install: "npm install @chartkitdev/core @chartkitdev/qwik",
    snippet: `import { component$ } from "@builder.io/qwik";
import { Chart } from "@chartkitdev/qwik";

${specBlock}

export const Panel = component$(() => {
  return <Chart spec={spec} />;
});`,
  },
  {
    id: "angular",
    label: "Angular",
    caption: "ts",
    install: "npm install @chartkitdev/core @chartkitdev/angular",
    snippet: `import { Component } from "@angular/core";
import { Chart } from "@chartkitdev/angular";

${specBlock}

@Component({
  standalone: true,
  imports: [Chart],
  template: \`<ck-chart [spec]="spec" />\`,
})
export class Panel {
  spec = spec;
}`,
  },
  {
    id: "vanilla",
    label: "Vanilla",
    caption: "js",
    install: "npm install @chartkitdev/core @chartkitdev/vanilla",
    snippet: `import { mount } from "@chartkitdev/vanilla";

${specBlock}

mount(document.querySelector("#chart"), spec);`,
  },
  {
    id: "element",
    label: "Web component",
    caption: "js",
    install: "npm install @chartkitdev/core @chartkitdev/element",
    snippet: `import "@chartkitdev/element";

${specBlock}

const chart = document.querySelector("chart-kit");
chart.spec = spec;`,
  },
];
