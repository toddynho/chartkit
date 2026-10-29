export function rowsOf(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (ArrayBuffer.isView(data)) return Array.from(data);
  const columns = data?.columns;
  if (!columns) return [];
  const names = Object.keys(columns);
  const n = columns[names[0]].length;
  const rows = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = {};
    for (const name of names) row[name] = columns[name][i];
    rows[i] = row;
  }
  return rows;
}

export function columnsOf(payload) {
  return payload?.data?.columns ?? null;
}

export function assertSvg(html, library) {
  const text = String(html ?? "");
  if (!text.includes("<svg")) {
    throw new Error(`unsupported: ${library} server markup has no <svg>: ${text.replace(/\s+/g, " ").slice(0, 220)}`);
  }
  return text.length;
}

export function assertMarkup(html, library) {
  const text = String(html ?? "");
  if (!text.includes("<") || text.length < 40) {
    throw new Error(`unsupported: ${library} server markup was empty: ${text.replace(/\s+/g, " ").slice(0, 180)}`);
  }
  return text.length;
}
