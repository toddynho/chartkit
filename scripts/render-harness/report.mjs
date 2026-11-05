/**
 * Group findings that share a check and a role pair. One layout mistake that
 * shows up on many types becomes one section, with a few example images.
 */
import { copyFileSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { reportDir } from "./paths.mjs";
import { flaggedForVision } from "./vision.mjs";

export function groupFindings(findings) {
  const groups = new Map();
  for (const finding of findings) {
    if (finding.severity === "info") continue;
    const id = groupId(finding);
    const group = groups.get(id) ?? {
      id,
      check: finding.check,
      roles: finding.roles ?? [],
      count: 0,
      types: new Set(),
      options: new Set(),
      examples: [],
      images: [],
    };
    group.count += 1;
    group.types.add(finding.type);
    if (finding.option) group.options.add(finding.option);
    if (group.examples.length < 5) {
      group.examples.push({
        type: finding.type,
        example: finding.example,
        option: finding.option,
        value: finding.value,
        detail: finding.detail,
      });
    }
    if (finding.image && group.images.length < 3 && !group.images.includes(finding.image)) group.images.push(finding.image);
    groups.set(id, group);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      types: [...group.types].sort(),
      options: [...group.options].sort(),
    }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

function groupId(finding) {
  const roles = (finding.roles ?? []).filter(Boolean);
  if (finding.check === "text-overlap" || finding.check === "legend-overlap" || finding.check === "text-outside" || finding.check === "text-clipped" || finding.check === "contrast") {
    return `${finding.check} · ${roles.join(" × ") || "text"}`;
  }
  return finding.check;
}

export function countBy(findings, key) {
  const counts = new Map();
  for (const finding of findings) {
    if (finding.severity === "info") continue;
    const name = finding[key] || "(default)";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

export function writeReports(result) {
  const groups = groupFindings(result.findings);
  if (result.mode === "full") commitExamples(groups, result.findings);
  const markdown = renderMarkdown(result, groups, { repo: false });
  mkdirSync(result.outDir, { recursive: true });
  writeFileSync(join(result.outDir, "report.md"), markdown);
  writeFileSync(join(result.outDir, "findings.json"), JSON.stringify(machine(result, groups), null, 2));
  let committed = "";
  if (result.mode === "full") {
    mkdirSync(reportDir, { recursive: true });
    writeFileSync(join(reportDir, "latest.md"), renderMarkdown(result, groups, { repo: true }));
    committed = join(reportDir, "latest.md");
  }
  return { groups, markdown, committed };
}

function commitExamples(groups, findings = []) {
  const dir = join(reportDir, "examples");
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    if (name.endsWith(".png")) unlinkSync(join(dir, name));
  }
  const copied = [];
  const gantt = findings.find((item) => item.type === "gantt" && item.option === "title" && item.value === "" && item.image);
  if (gantt?.image) {
    try {
      copyFileSync(gantt.image, join(dir, "gantt-no-title.png"));
      copied.push("examples/gantt-no-title.png");
    } catch {
      /* the thumbnail was not written */
    }
  }
  const pinned = groups.find((group) => group.id.includes("legend") && group.id.includes("tick"));
  const ordered = pinned ? [pinned, ...groups.filter((group) => group !== pinned)] : groups;
  for (const group of ordered) {
    if (copied.length >= 6) break;
    const image = group.images[0];
    if (!image) continue;
    const name = `${String(copied.length + 1).padStart(2, "0")}-${slug(group.id)}.png`;
    try {
      copyFileSync(image, join(dir, name));
    } catch {
      continue;
    }
    group.committedImage = `examples/${name}`;
    copied.push(group.committedImage);
  }
  return copied;
}

function slug(id) {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

function machine(result, groups) {
  return {
    seed: result.seed,
    mode: result.mode,
    cases: result.cases,
    rendered: result.rendered,
    runtimeMs: result.runtimeMs,
    timings: result.timings,
    snapshot: result.snapshot,
    byCheck: Object.fromEntries(countBy(result.findings, "check")),
    byType: Object.fromEntries(countBy(result.findings, "type")),
    recorded: result.recorded,
    groups: groups.map((group) => ({
      id: group.id,
      check: group.check,
      count: group.count,
      types: group.types,
      options: group.options.slice(0, 12),
      examples: group.examples,
      images: group.images.map((image) => basename(image)),
    })),
    findings: result.findings,
    vision: result.vision,
  };
}

function renderMarkdown(result, groups, { repo }) {
  const lines = [];
  lines.push("# Chart render sweep");
  lines.push("");
  lines.push(`Seed \`${result.seed}\`. Mode \`${result.mode}\`. ${result.cases} cases, ${result.rendered} rendered, ${(result.runtimeMs / 1000).toFixed(1)}s.`);
  lines.push("");
  lines.push("ChartKit does not rewrite or shorten labels. An overlap is a layout bug. Spec-set sizes are left as the example wrote them, except when the sweep itself sets `size`.");
  lines.push("");
  lines.push("## Snapshots");
  lines.push("");
  lines.push(result.snapshot.note);
  lines.push("");
  lines.push(`Compared ${result.snapshot.compared}. Changed ${result.snapshot.changed.length}. Missing baseline ${result.snapshot.missing.length}. Tolerance ${result.snapshot.tolerance} bits on a 64-bit dHash.`);
  lines.push("");
  lines.push("## Timing");
  lines.push("");
  lines.push(`Render p50 ${result.timings.p50.toFixed(1)} ms, p95 ${result.timings.p95.toFixed(1)} ms, max ${result.timings.max.toFixed(1)} ms.`);
  lines.push("");
  lines.push("## Findings by check");
  lines.push("");
  lines.push("| Check | Count |");
  lines.push("| --- | ---: |");
  for (const [name, count] of countBy(result.findings, "check")) lines.push(`| ${name} | ${count} |`);
  if (!countBy(result.findings, "check").length) lines.push("| none | 0 |");
  lines.push("");
  lines.push("## Findings by chart type");
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("| --- | ---: |");
  for (const [name, count] of countBy(result.findings, "type")) lines.push(`| ${name} | ${count} |`);
  if (!countBy(result.findings, "type").length) lines.push("| none | 0 |");
  lines.push("");
  lines.push("## Root-cause groups");
  lines.push("");
  lines.push("A group is one check failing the same way. Counts are findings, not chart types.");
  lines.push("");
  if (!groups.length) lines.push("No error or warning findings.");
  groups.forEach((group, index) => {
    lines.push(`### ${index + 1}. ${group.id} (${group.count})`);
    lines.push("");
    lines.push(`Types: ${group.types.join(", ")}`);
    lines.push("");
    const options = group.options.slice(0, 8);
    if (options.length) lines.push(`Options: ${options.join(", ")}`);
    lines.push("");
    for (const example of group.examples.slice(0, 3)) {
      const value = example.value === null || example.value === undefined ? "" : ` = ${JSON.stringify(example.value)}`;
      lines.push(`- \`${example.type}\` / \`${example.example}\` / \`${example.option}\`${value}`);
      lines.push(`  ${example.detail}`);
    }
    const images = repo ? (group.committedImage ? [group.committedImage] : []) : group.images.slice(0, 3);
    if (repo && group.check === "text-overlap" && (group.roles ?? []).includes("legend") && (group.roles ?? []).includes("tick")) {
      images.unshift("examples/gantt-no-title.png");
    }
    if (images.length) {
      lines.push("");
      for (const image of images) lines.push(`![${group.id}](${image})`);
    }
    lines.push("");
  });
  lines.push("## Recorded, not failed");
  lines.push("");
  lines.push(`Not yet supported: ${result.recorded["not-yet"]} options. Needs data: ${result.recorded["needs-data"]}. Unsampled (JSON, or the type field): ${result.recorded.unsampled}.`);
  lines.push("");
  lines.push("An option the playground marks “Not yet supported” is listed and not rendered. A needs-data option is the same: the example cannot exercise it, so a failure there would be the fixture, not the chart.");
  lines.push("");
  lines.push("## Vision");
  lines.push("");
  lines.push(result.vision.message);
  lines.push("");
  lines.push(`Flagged images: ${result.vision.images}.`);
  lines.push("");
  return lines.join("\n");
}

export function visionSummary(findings) {
  const images = flaggedForVision(findings);
  return {
    status: "stub",
    reviewed: 0,
    images: images.length,
    notes: [],
    message: "Vision review is a stub. Call reviewFlagged(findings, reviewer) with a reviewer that implements review({ findings, images }). This sweep does not call a model.",
  };
}
