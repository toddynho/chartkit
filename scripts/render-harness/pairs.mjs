/**
 * Hand-curated pairs. Each axis is one option. The generator crosses the
 * values and skips a pair when either option does not apply to the type.
 * These are the interactions a one-at-a-time sweep cannot see.
 */
export const PAIRS = [
  {
    id: "legend-position-x-title",
    why: "A top legend and a title share the same band. Title absent lets the legend sit on the axis labels.",
    axes: [
      { path: "legend.position", values: ["top", "right", "bottom", "left", "inside"] },
      { path: "title", values: ["", "Chart title"] },
    ],
  },
  {
    id: "orientation-x-labels",
    why: "Horizontal bars put category labels on the side the value labels also want.",
    axes: [
      { path: "mark.orientation", values: ["vertical", "horizontal"] },
      { path: "mark.labels", values: [true, false] },
    ],
  },
  {
    id: "size-x-legend",
    why: "A short frame and a side legend compete for the same width. Spec size is replaced only in this pair.",
    axes: [
      {
        path: "size.width",
        values: ["240", "1200"],
        with: {
          240: { path: "size.height", value: "160" },
          1200: { path: "size.height", value: "800" },
        },
      },
      { path: "legend.position", values: ["top", "right"] },
    ],
  },
  {
    id: "dark-x-type",
    why: "Dark paint is a different contrast problem on every type.",
    axes: [
      { path: "theme.mode", values: ["dark"] },
      { path: "theme", values: ["midnight"] },
    ],
  },
];

/** Wide string used for every text option, including the fast title case. */
export const LONG = "Northstar launch window label ".repeat(4).trim();

/** Options varied on the primary example during the fast subset. Values are a subset of the full sweep. */
export const FAST_VALUES = {
  title: ["", LONG],
  legend: [false, true],
  "legend.position": ["top", "right", "bottom", "left", "inside"],
  "theme.mode": ["light", "dark"],
  "mark.orientation": ["vertical", "horizontal"],
  "mark.labels": [true, false],
  "axes.x.labels": [true, false],
  "axes.y.labels": [true, false],
  "size.width": ["240", "1200"],
  "size.height": ["240", "1200"],
};
