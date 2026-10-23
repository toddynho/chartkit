import type { ChartRenderer } from "../render";
import { renderBarList } from "../renderers/bar-list";

/** On-demand ranked list. Not registered on the line or all renderers. */
export const barList: ChartRenderer = {
  name: "bar-list",
  types: ["bar-list"],
  render: (spec) => renderBarList(spec) ?? "",
};

export { renderBarList };
