import type { ChartRenderer } from "../render";
import { renderTree } from "../renderers/extra/tree";

export const tree: ChartRenderer = {
  name: "tree",
  types: ["tree"],
  render: renderTree,
};
