import { chartSvg } from "./chart";

export const LOOKS = [
  {
    id: "soft",
    label: "Soft",
    detail: "Default. Omit theme, or set auto or soft. Transparent plot on a #f5f5f7 / #1c1c1e card.",
  },
  {
    id: "refined",
    label: "Refined",
    detail: "Built in. Quieter chrome, blue then rose. Same light-dark switch as Soft.",
  },
  {
    id: "editorial",
    label: "Editorial",
    detail: "Built in. Indigo lead, dots on, a slightly heavier stroke.",
  },
  {
    id: "midnight",
    label: "Midnight",
    detail: "Opt-in dark card. It does not follow the page scheme.",
  },
] as const;

const line = {
  version: "1" as const,
  type: "line",
  title: "Revenue",
  data: [
    { month: "Jan", revenue: 42, target: 40 },
    { month: "Feb", revenue: 46, target: 43 },
    { month: "Mar", revenue: 44, target: 46 },
    { month: "Apr", revenue: 51, target: 49 },
    { month: "May", revenue: 58, target: 52 },
    { month: "Jun", revenue: 55, target: 55 },
  ],
  encoding: {
    x: "month",
    y: [
      { field: "revenue", title: "Revenue", area: true },
      { field: "target", title: "Target" },
    ],
  },
  mark: { curve: "monotone" },
  size: { width: 640, height: 260 },
  a11y: { alt: "Revenue stays near the target and finishes above it." },
};

const bars = {
  version: "1" as const,
  type: "bar",
  title: "Stops",
  data: [
    { lane: "A", stops: 12 },
    { lane: "B", stops: 7 },
    { lane: "C", stops: 15 },
    { lane: "D", stops: 9 },
  ],
  encoding: { x: "lane", y: "stops", color: "lane" },
  legend: false,
  size: { width: 420, height: 260 },
  a11y: { alt: "Lane C has the most stops, then A, D, and B." },
};

export function lookPanels() {
  return LOOKS.map((look) => ({
    ...look,
    charts: [line, bars].map((spec) => {
      const themed = { ...spec, id: `look-${look.id}-${spec.type}`, theme: look.id };
      return { title: spec.title, spec: themed, svg: chartSvg(themed) };
    }),
  }));
}
