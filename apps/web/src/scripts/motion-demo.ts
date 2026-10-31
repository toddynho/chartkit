import type { ChartSpec } from "@chartkitdev/core";
import { lastPaintProfile } from "@chartkitdev/core/canvas/hydrate";
import { mount } from "@chartkitdev/vanilla";
import { seriesSpecs, sortSpecs, STREAM_POINTS, STREAM_STEP, streamSpec, valueSpecs } from "../data/motion-demo";

function cycle(host: HTMLElement, states: ChartSpec[]): void {
  const chart = mount(host, states[0]);
  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % states.length;
    chart.update(states[index]);
  }, 1800);
}

const value = document.querySelector<HTMLElement>('[data-motion="value"]');
const sort = document.querySelector<HTMLElement>('[data-motion="sort"]');
const series = document.querySelector<HTMLElement>('[data-motion="series"]');
if (value) cycle(value, valueSpecs());
if (sort) cycle(sort, sortSpecs());
if (series) cycle(series, seriesSpecs());

const stream = document.querySelector<HTMLElement>('[data-motion="stream"]');
const readout = document.querySelector<HTMLElement>("[data-stream-readout]");
if (stream && readout) {
  const chart = mount(stream, streamSpec(0, true));
  const strokes: number[] = [];
  const paints: number[] = [];
  const gaps: number[] = [];
  let shift = 0;
  let last = 0;
  const median = (values: number[]) => {
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? 0;
  };
  const tick = (now: number) => {
    if (last) gaps.push(now - last);
    last = now;
    shift += STREAM_STEP;
    chart.update(streamSpec(shift, true));
    const profile = lastPaintProfile();
    if (profile?.window) {
      strokes.push(profile.sample);
      paints.push(profile.paint);
    }
    const recentStrokes = strokes.slice(-60);
    const recentPaints = paints.slice(-60);
    const recentGaps = gaps.slice(-60);
    if (recentStrokes.length >= 8) {
      readout.textContent = `${STREAM_POINTS.toLocaleString("en-US")} points. Stroke ${median(recentStrokes).toFixed(2)} ms median, paint ${median(recentPaints).toFixed(2)} ms median, frame gap ${median(recentGaps).toFixed(1)} ms median. Measured in this browser.`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
