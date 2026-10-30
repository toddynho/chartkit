export const stackIds = ["react", "vue", "svelte", "vanilla", "element"] as const;

export type StackId = (typeof stackIds)[number];

export type Stack = {
  id: StackId;
  /** Full name, used as the chip title. */
  label: string;
  /** Short label in the segmented control. */
  chip: string;
  /** One-line mount. Matches the adapter's real API. */
  mount: string;
  /** Phrase in the "every target" caption. */
  blurb: string;
  install: string;
  snippet: string;
};

/**
 * Adapters you mount a chart with.
 * `@chartkitdev/markdown` is a fence plugin, not an app stack.
 * Server render is `renderToString` on these adapters, not a separate package.
 * There is no Astro adapter package.
 */
export const stacks: Stack[] = [
  {
    id: "react",
    label: "React",
    chip: "React",
    mount: "<Chart spec={spec} />",
    blurb: "React",
    install: "npm install @chartkitdev/core\nnpm install @chartkitdev/react",
    snippet: 'import { Chart } from "@chartkitdev/react";\n\nexport function Panel() {\n  return <Chart spec={spec} />;\n}',
  },
  {
    id: "vue",
    label: "Vue",
    chip: "Vue",
    mount: '<Chart :spec="spec" />',
    blurb: "Vue",
    install: "npm install @chartkitdev/core\nnpm install @chartkitdev/vue",
    snippet:
      '<script setup>\nimport { Chart } from "@chartkitdev/vue";\n</script>\n\n<template>\n  <Chart :spec="spec" />\n</template>',
  },
  {
    id: "svelte",
    label: "Svelte",
    chip: "Svelte",
    mount: "<Chart {spec} />",
    blurb: "Svelte",
    install: "npm install @chartkitdev/core\nnpm install @chartkitdev/svelte",
    snippet: '<script>\n  import { Chart } from "@chartkitdev/svelte";\n</script>\n\n<Chart {spec} />',
  },
  {
    id: "vanilla",
    label: "Vanilla",
    chip: "JS",
    mount: "mount(el, spec)",
    blurb: "vanilla JS",
    install: "npm install @chartkitdev/core\nnpm install @chartkitdev/vanilla",
    snippet:
      'import { mount } from "@chartkitdev/vanilla";\n\nconst chart = mount(document.querySelector("#chart"), spec);\nchart.update(spec);',
  },
  {
    id: "element",
    label: "Custom element",
    chip: "Element",
    mount: "el.spec = spec",
    blurb: "the custom element",
    install: "npm install @chartkitdev/core\nnpm install @chartkitdev/element",
    snippet:
      'import "@chartkitdev/element";\n\nconst chart = document.querySelector("chart-kit");\nchart.spec = spec;',
  },
];

export function isStackId(value: string | null | undefined): value is StackId {
  return stackIds.some((id) => id === value);
}
