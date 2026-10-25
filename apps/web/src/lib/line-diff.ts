/** Line diff used by the converter. Same walk as the Next convert demo. */
export function lineDiff(before: string, after: string): { op: " " | "+" | "-"; text: string }[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      const next = dp[i + 1]?.[j + 1] ?? 0;
      const down = dp[i + 1]?.[j] ?? 0;
      const right = dp[i]?.[j + 1] ?? 0;
      dp[i]![j] = a[i] === b[j] ? next + 1 : Math.max(down, right);
    }
  }
  const out: { op: " " | "+" | "-"; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    const down = dp[i + 1]?.[j] ?? 0;
    const right = dp[i]?.[j + 1] ?? 0;
    if (a[i] === b[j]) {
      out.push({ op: " ", text: a[i] ?? "" });
      i += 1;
      j += 1;
    } else if (down >= right) {
      out.push({ op: "-", text: a[i] ?? "" });
      i += 1;
    } else {
      out.push({ op: "+", text: b[j] ?? "" });
      j += 1;
    }
  }
  while (i < n) {
    out.push({ op: "-", text: a[i] ?? "" });
    i += 1;
  }
  while (j < m) {
    out.push({ op: "+", text: b[j] ?? "" });
    j += 1;
  }
  return out;
}
