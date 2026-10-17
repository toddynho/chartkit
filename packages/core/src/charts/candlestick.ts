import type { ChartRenderer } from "../render";
import { renderCandlestick } from "../renderers/candlestick";

export const candlestick: ChartRenderer = {
  name: "candlestick",
  types: ["candlestick"],
  render: renderCandlestick,
};
