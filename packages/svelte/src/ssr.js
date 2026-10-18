import { render as renderExtra } from "@chartkitdev/core/extra";
import { render } from "svelte/server";
import Chart from "./Chart.svelte";

/** Server HTML for a spec. This entry imports the extra charts, including gantt through journey, statically. */
export function renderToString(spec) {
  return render(Chart, { props: { spec, render: renderExtra } }).body;
}
