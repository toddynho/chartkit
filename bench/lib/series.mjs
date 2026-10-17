/** Shared line-chart series. x[i] = i. Every library receives this same generator. */
export function makeSeries(n, seed = 1) {
  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  let state = seed >>> 0;
  for (let i = 0; i < n; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    xs[i] = i;
    ys[i] = (state / 4294967296) * 100 + Math.sin(i / 50) * 20;
  }
  return { xs, ys };
}
