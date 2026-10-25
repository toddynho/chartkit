import type { ChartSlot } from "./showcase-data.ts";

/**
 * Board 30. A fictional community radio desk. Radial bars are minutes by
 * desk, and the rose is Saturday listeners by neighbourhood.
 */

const desks = ["Music", "Talk", "News", "Sky", "Spots", "Ident"] as const;
const weeknight = [186, 74, 36, 18, 28, 8];
const saturday = [210, 48, 22, 16, 40, 6];

const minutes = desks.map((desk, index) => ({
  desk,
  weeknight: weeknight[index],
  saturday: saturday[index],
}));

const places = [
  { place: "Hale", listeners: 4200 },
  { place: "Mill", listeners: 3100 },
  { place: "Quay", listeners: 5600 },
  { place: "Ridge", listeners: 1800 },
  { place: "Yard", listeners: 2400 },
  { place: "Orchard", listeners: 3900 },
];

export const polarBoards: {
  slug: string;
  number: number;
  title: string;
  lede: string;
  charts: ChartSlot[];
}[] = [
  {
    slug: "lumen-desk",
    number: 30,
    title: "Lumen desk",
    lede: "Saturday night at fictional Lumen Radio. Music runs longer than on a weeknight, talk shrinks, and Quay is the largest share of the evening audience.",
    charts: [
      {
        id: "desks",
        title: "Minutes by desk",
        caption: "Weeknight and Saturday sit side by side. Music is the long arc. Ident stays a sliver.",
        span: "board-6",
        spec: {
          version: "1",
          id: "lumen-desk-minutes",
          type: "radial-bar",
          title: "Lumen, minutes by desk",
          subtitle: "Weeknight against Saturday.",
          theme: "soft",
          locale: "en-GB",
          data: minutes,
          encoding: {
            x: { field: "desk", title: "Desk" },
            y: [
              { field: "weeknight", title: "Weeknight", format: { suffix: " min" } },
              { field: "saturday", title: "Saturday", format: { suffix: " min" } },
            ],
          },
          mark: { innerRadius: 0.34, padAngle: 2, cornerRadius: 4 },
          layout: { coordinate: "polar" },
          legend: { position: "bottom" },
          size: { width: 520, height: 480 },
          a11y: { alt: "Saturday music runs longer, and talk shrinks." },
        },
      },
      {
        id: "places",
        title: "Saturday audience",
        caption: "Equal angles. The radius is listeners. Quay reaches farthest.",
        span: "board-6",
        spec: {
          version: "1",
          id: "lumen-desk-audience",
          type: "rose",
          title: "Saturday audience",
          subtitle: "Listeners by neighbourhood.",
          theme: "soft",
          locale: "en-GB",
          data: places,
          encoding: {
            x: { field: "place", title: "Place" },
            y: { field: "listeners", title: "Listeners", format: { specifier: ",.0f" } },
          },
          mark: { padAngle: 1.2, labels: true },
          layout: { coordinate: "polar" },
          size: { width: 520, height: 480 },
          a11y: { alt: "Quay is the largest share of the evening audience." },
        },
      },
    ],
  },
];
