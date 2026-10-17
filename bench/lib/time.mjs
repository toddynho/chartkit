export function timeSync(fn, { warmup = 3, iterations = 10 } = {}) {
  for (let i = 0; i < warmup; i++) fn();
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }
  return summarize(samples);
}

export function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return {
    iterations: sorted.length,
    meanMs: round(sum / sorted.length),
    medianMs: round(sorted[Math.floor(sorted.length / 2)] ?? 0),
    minMs: round(sorted[0] ?? 0),
    maxMs: round(sorted[sorted.length - 1] ?? 0),
  };
}

export function round(value) {
  return Math.round(value * 100) / 100;
}
