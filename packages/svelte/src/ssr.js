import { render as renderExtra } from "@chartkitdev/core/extra";
import { render } from "svelte/server";
import Chart from "./Chart.svelte";

/** Server HTML for a spec. This entry imports histogram through waterfall statically. */
export function renderToString(spec) {
  return render(Chart, { props: { spec, render: renderExtra } }).body;
}
