export const stackIds = ["react", "vue", "svelte", "vanilla"] as const;

export type StackId = (typeof stackIds)[number];

export type Stack = {
  id: StackId;
  label: string;
  install: string;
  snippet: string;
};

export const stacks: Stack[] = [
  {
    id: "react",
    label: "React",
    install: "npm install @chartkitdev/core\nnpm install @chartkitdev/react",
    snippet: 'import { Chart } from "@chartkitdev/react";\n\nexport function Panel() {\n  return <Chart spec={spec} />;\n}',
  },
  {
    id: "vue",
    label: "Vue",
    install: "npm install @chartkitdev/core\nnpm install @chartkitdev/vue",
    snippet:
      '<script setup>\nimport { Chart } from "@chartkitdev/vue";\n</script>\n\n<template>\n  <Chart :spec="spec" />\n</template>',
  },
  {
    id: "svelte",
    label: "Svelte",
    install: "npm install @chartkitdev/core\nnpm install @chartkitdev/svelte",
    snippet: '<script>\n  import { Chart } from "@chartkitdev/svelte";\n</script>\n\n<Chart {spec} />',
  },
  {
    id: "vanilla",
    label: "Vanilla",
    install: "npm install @chartkitdev/core\nnpm install @chartkitdev/vanilla",
    snippet:
      'import { mount } from "@chartkitdev/vanilla";\n\nconst chart = mount(document.querySelector("#chart"), spec);\nchart.update(spec);',
  },
];

export function isStackId(value: string | null | undefined): value is StackId {
  return stackIds.some((id) => id === value);
}
