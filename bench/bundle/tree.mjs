/** Collapse per-type bundles that did not tree-shake into one package record. */

export const TREE_NOISE_GZIP = 512;

export function collapseTreeShake(cells) {
  const groups = new Map();
  for (const cell of cells) {
    if (cell.status !== "ok" || cell.gzipBytes == null) continue;
    const list = groups.get(cell.group) ?? [];
    list.push(cell);
    groups.set(cell.group, list);
  }
  const packages = [];
  for (const [group, list] of groups) {
    const gzip = list.map((cell) => cell.gzipBytes);
    const spread = Math.max(...gzip) - Math.min(...gzip);
    const treeShakeable = list.length > 1 ? spread > TREE_NOISE_GZIP : !list[0].singleBuild;
    if (treeShakeable) {
      for (const cell of list) {
        cell.treeShakeable = true;
        cell.label = null;
      }
      packages.push({
        id: group,
        library: list[0].library,
        treeShakeable: true,
        charts: list.length,
      });
      continue;
    }
    const fullest = list.reduce((best, cell) => (cell.gzipBytes > best.gzipBytes ? cell : best));
    const pkg = {
      id: group,
      library: fullest.library,
      treeShakeable: false,
      minBytes: fullest.minBytes,
      gzipBytes: fullest.gzipBytes,
      brotliBytes: fullest.brotliBytes,
      cssMinBytes: fullest.cssMinBytes ?? null,
      cssGzipBytes: fullest.cssGzipBytes ?? null,
      cssBrotliBytes: fullest.cssBrotliBytes ?? null,
      reactExternal: fullest.reactExternal ?? null,
      charts: list.map((cell) => cell.chart),
      note: "not tree-shakeable",
    };
    packages.push(pkg);
    if (list.length === 1) {
      list[0].treeShakeable = false;
      list[0].label = "not tree-shakeable";
      list[0].packageId = group;
      continue;
    }
    for (const cell of list) {
      cell.treeShakeable = false;
      cell.label = "not tree-shakeable";
      cell.packageId = group;
      cell.minBytes = null;
      cell.gzipBytes = null;
      cell.brotliBytes = null;
      cell.cssMinBytes = null;
      cell.cssGzipBytes = null;
      cell.cssBrotliBytes = null;
      cell.reactExternal = null;
    }
  }
  for (const cell of cells) {
    if (cell.treeShakeable == null && cell.status !== "ok") cell.treeShakeable = null;
  }
  return packages;
}

export function compareGzip(cell, packages) {
  if (cell.status !== "ok") return null;
  if (cell.gzipBytes != null) {
    const external = cell.reactExternal?.gzipBytes;
    if (external != null) return external;
    return cell.gzipBytes + (cell.cssGzipBytes ?? 0);
  }
  const pkg = packages.find((item) => item.id === cell.packageId);
  if (!pkg || pkg.gzipBytes == null) return null;
  if (pkg.reactExternal?.gzipBytes != null) return pkg.reactExternal.gzipBytes;
  return pkg.gzipBytes + (pkg.cssGzipBytes ?? 0);
}

export function includedGzip(cell, packages) {
  if (cell.status !== "ok") return null;
  if (cell.gzipBytes != null) return cell.gzipBytes + (cell.cssGzipBytes ?? 0);
  const pkg = packages.find((item) => item.id === cell.packageId);
  if (!pkg || pkg.gzipBytes == null) return null;
  return pkg.gzipBytes + (pkg.cssGzipBytes ?? 0);
}
