/**
 * Native data for the ChartKit chart-type paint matrix.
 * Dense series use columnar data, the same `{ columns }` shape as `makeSeries`.
 * Small categorical, flow, and hierarchy charts use row objects or nested nodes,
 * matching the gallery examples. Generation is called before the paint timer.
 */

function rng(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function seriesColumns(n, seed, fields) {
  const x = new Float64Array(n);
  const columns = { x };
  const cols = fields.map((name) => {
    const values = new Float64Array(n);
    columns[name] = values;
    return values;
  });
  const next = rng(seed);
  for (let i = 0; i < n; i++) {
    x[i] = i;
    for (let k = 0; k < cols.length; k++) {
      cols[k][i] = next() * 80 + 10 + Math.sin(i / (20 + k * 7)) * 8;
    }
  }
  return { data: { columns } };
}

function numberSeries(n, seed) {
  const values = new Array(n);
  const next = rng(seed);
  for (let i = 0; i < n; i++) values[i] = next() * 80 + 10 + Math.sin(i / 25) * 8;
  return values;
}

function categories(n, seed, fields) {
  const next = rng(seed);
  const rows = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = { x: `c${i}` };
    for (const field of fields) row[field] = 1 + Math.round(next() * 100);
    rows[i] = row;
  }
  return rows;
}

function gridShape(n) {
  let cols = Math.min(40, n);
  while (cols > 1 && n % cols !== 0) cols -= 1;
  return { cols, rows: n / cols };
}

function iso(day) {
  return new Date(Date.UTC(2026, 0, 1) + day * 86400000).toISOString().slice(0, 10);
}

function unsupported(message) {
  const error = new Error(`unsupported: ${message}`);
  error.status = "unsupported";
  return error;
}

/**
 * @param {string} chart gallery type id
 * @param {number} n point count defined by that type's `nMeaning`
 * @param {number} seed
 * @returns {{ data?: unknown, metric?: Record<string, unknown>, quadrants?: string[] }}
 */
export function makeChartData(chart, n, seed = 1) {
  if (!Number.isFinite(n) || n < 1) throw unsupported(`${chart} needs a positive point count`);
  const next = rng(seed);
  switch (chart) {
    case "line":
    case "spike":
      return seriesColumns(n, seed, ["y"]);
    case "stacked-area":
      return seriesColumns(n, seed, ["a", "b", "c", "d"]);
    case "scatter":
      return seriesColumns(n, seed, ["y"]);
    case "sparkline":
    case "mini-area":
      return { data: numberSeries(n, seed) };
    case "area-range": {
      const base = seriesColumns(n, seed, ["y"]);
      const y = base.data.columns.y;
      const lo = new Float64Array(n);
      const hi = new Float64Array(n);
      const band = rng(seed + 9);
      for (let i = 0; i < n; i++) {
        const pad = 4 + band() * 8;
        lo[i] = y[i] - pad;
        hi[i] = y[i] + pad;
      }
      base.data.columns.lo = lo;
      base.data.columns.hi = hi;
      return base;
    }
    case "histogram": {
      const value = new Float64Array(n);
      for (let i = 0; i < n; i++) value[i] = next() * 120 + Math.sin(i / 13) * 10;
      return { data: { columns: { value } } };
    }
    case "boxplot": {
      const groups = ["N", "E", "S", "W", "C", "NE", "NW", "SE"];
      const group = new Array(n);
      const value = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        group[i] = groups[i % groups.length];
        // Bounded so Tukey fences contain every point. The paint is the boxes, not outlier dots.
        value[i] = 30 + next() * 40;
      }
      return { data: { columns: { group, value } } };
    }
    case "candlestick": {
      const x = new Float64Array(n);
      const open = new Float64Array(n);
      const high = new Float64Array(n);
      const low = new Float64Array(n);
      const close = new Float64Array(n);
      const volume = new Float64Array(n);
      let price = 100;
      for (let i = 0; i < n; i++) {
        const o = price;
        const c = o + (next() - 0.48) * 4;
        const h = Math.max(o, c) + next() * 1.5;
        const l = Math.min(o, c) - next() * 1.5;
        x[i] = i;
        open[i] = o;
        high[i] = h;
        low[i] = l;
        close[i] = c;
        volume[i] = 200 + Math.round(next() * 800);
        price = c;
      }
      return { data: { columns: { x, open, high, low, close, volume } } };
    }
    case "bar":
    case "pie":
    case "donut":
    case "funnel":
    case "radial-bar":
    case "rose":
    case "bar-list": {
      const rows = categories(n, seed, ["y"]);
      if (chart === "funnel") {
        rows.sort((a, b) => b.y - a.y);
        for (let i = 0; i < rows.length; i++) rows[i].x = `s${i}`;
      }
      return { data: rows };
    }
    case "combo":
      return {
        data: Array.from({ length: n }, (_, i) => ({
          x: `c${i}`,
          revenue: 40 + Math.round(next() * 80),
          margin: Math.round(next() * 100) / 100,
        })),
      };
    case "heatmap": {
      const { cols, rows: rowCount } = gridShape(n);
      const data = new Array(n);
      let i = 0;
      for (let y = 0; y < rowCount; y++) {
        for (let x = 0; x < cols; x++) {
          data[i] = { x: `x${x}`, y: `y${y}`, v: Math.round(next() * 20) };
          i += 1;
        }
      }
      return { data };
    }
    case "gauge":
      return {
        metric: {
          label: "Capacity",
          value: Math.round(20 + next() * 70),
          min: 0,
          max: 100,
          target: 80,
        },
      };
    case "kpi":
      return {
        metric: {
          label: "Revenue",
          value: Math.round(80_000 + next() * 40_000),
          delta: Math.round(next() * 20) / 100 - 0.05,
          format: "compact",
        },
        // Fixed sparkline. N for this chart is the metric, not this array.
        data: numberSeries(24, seed + 3),
      };
    case "progress-ring":
      return {
        metric: {
          label: "Uptime",
          value: Math.round((90 + next() * 10) * 10) / 10,
          min: 0,
          max: 100,
        },
      };
    case "radar": {
      if (n < 3) throw unsupported("radar needs at least 3 spokes");
      const data = new Array(n);
      for (let i = 0; i < n; i++) {
        data[i] = {
          spoke: `s${i}`,
          a: 1 + Math.round(next() * 9),
          b: 1 + Math.round(next() * 9),
          c: 1 + Math.round(next() * 9),
        };
      }
      return { data };
    }
    case "treemap":
      return {
        data: Array.from({ length: n }, (_, i) => ({
          name: `t${i}`,
          size: 1 + Math.round(next() * 40),
          group: `g${i % 6}`,
        })),
      };
    case "sankey": {
      const layers = 4;
      const gaps = layers - 1;
      let nodes = 2;
      while (nodes * nodes * gaps < n) nodes += 1;
      const data = [];
      let i = 0;
      for (let gap = 0; gap < gaps && i < n; gap++) {
        for (let s = 0; s < nodes && i < n; s++) {
          for (let t = 0; t < nodes && i < n; t++) {
            data.push({
              from: `L${gap}n${s}`,
              to: `L${gap + 1}n${t}`,
              flow: 1 + Math.round(next() * 30),
            });
            i += 1;
          }
        }
      }
      return { data };
    }
    case "bullet":
      return {
        data: Array.from({ length: n }, (_, i) => {
          const poor = 40;
          const ok = 70;
          const good = 100;
          return {
            name: `m${i}`,
            value: 30 + Math.round(next() * 70),
            target: 55 + Math.round(next() * 30),
            poor,
            ok,
            good,
          };
        }),
      };
    case "waterfall": {
      if (n < 2) throw unsupported("waterfall needs an opening total and a closing total");
      let run = 100;
      const data = [{ step: "Open", amount: run, total: true }];
      for (let i = 1; i < n - 1; i++) {
        const delta = Math.round((next() - 0.45) * 30);
        run += delta;
        data.push({ step: `s${i}`, amount: delta, total: false });
      }
      data.push({ step: "Close", amount: run, total: true });
      return { data };
    }
    case "bar-range":
      return {
        data: Array.from({ length: n }, (_, i) => {
          const low = Math.round(next() * 40);
          return { x: `c${i}`, low, high: low + 5 + Math.round(next() * 30) };
        }),
      };
    case "errorbar":
      return {
        data: Array.from({ length: n }, (_, i) => {
          const y = 20 + next() * 40;
          const err = 1 + next() * 4;
          return { x: `c${i}`, y: Math.round(y * 10) / 10, lo: Math.round((y - err) * 10) / 10, hi: Math.round((y + err) * 10) / 10 };
        }),
      };
    case "gantt":
      return {
        data: Array.from({ length: n }, (_, i) => {
          const start = iso(i * 3);
          const end = iso(i * 3 + 4);
          const row = {
            id: `t${i}`,
            task: `Task ${i}`,
            section: ["Plan", "Build", "Launch"][i % 3],
            start,
            progress: Math.round(next() * 100) / 100,
            status: ["done", "active", "crit"][i % 3],
            depends: i === 0 ? "" : `t${i - 1}`,
          };
          if (i === n - 1) {
            row.milestone = true;
            delete row.end;
          } else {
            row.end = end;
          }
          if (i === 0) row.today = iso(Math.floor((n * 3) / 2));
          return row;
        }),
      };
    case "timeline":
      return {
        data: Array.from({ length: n }, (_, i) => {
          if (i % 4 === 3) {
            return { label: `Era ${i}`, start: iso(i * 20), end: iso(i * 20 + 30), kind: "period" };
          }
          return { label: `Event ${i}`, date: iso(i * 20 + 5), kind: "event" };
        }),
      };
    case "quadrant":
      return {
        quadrants: ["Quick wins", "Big bets", "Fill-ins", "Thankless"],
        data: Array.from({ length: n }, (_, i) => ({
          name: `p${i}`,
          x: next(),
          y: next(),
        })),
      };
    case "venn": {
      if (n !== 3) throw unsupported("venn draws two or three sets; this cell is the three-set chart. Four or more sets render an error SVG.");
      const a = 800 + Math.round(next() * 200);
      const b = 600 + Math.round(next() * 150);
      const c = 400 + Math.round(next() * 100);
      return {
        data: [
          { set: "A", size: a },
          { set: "B", size: b },
          { set: "C", size: c },
          { set: "A+B", size: 180 + Math.round(next() * 40) },
          { set: "A+C", size: 120 + Math.round(next() * 30) },
          { set: "B+C", size: 90 + Math.round(next() * 20) },
          { set: "A+B+C", size: 40 + Math.round(next() * 20) },
        ],
      };
    }
    case "journey":
      return {
        data: Array.from({ length: n }, (_, i) => ({
          section: ["Browse", "Cart", "Pay", "Done"][Math.floor(i / Math.max(1, Math.ceil(n / 4))) ] ?? "Done",
          step: `Step ${i}`,
          score: 1 + Math.floor(next() * 5),
          actors: i % 5 === 4 ? "Shopper, Support" : "Shopper",
        })),
      };
    case "sunburst": {
      const branches = 6;
      const leaves = Math.max(1, Math.floor(n / branches));
      const extra = n - leaves * branches;
      return {
        data: Array.from({ length: branches }, (_, b) => ({
          name: `b${b}`,
          children: Array.from({ length: leaves + (b < extra ? 1 : 0) }, (__, leaf) => ({
            name: `b${b}l${leaf}`,
            value: 1 + Math.round(next() * 40),
          })),
        })),
      };
    }
    default:
      throw unsupported(`no data shape for ${chart}`);
  }
}
