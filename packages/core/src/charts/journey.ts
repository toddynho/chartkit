import type { ChartRenderer } from "../render";
import { renderJourney } from "../renderers/extra/journey";

export const journey: ChartRenderer = {
  name: "journey",
  types: ["journey"],
  render: renderJourney,
};
