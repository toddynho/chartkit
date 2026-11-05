/**
 * Interface for a later vision pass.
 * This module does not call a model. A reviewer is a function the caller supplies.
 *
 * reviewer.review({ findings, images }) -> Promise<Array<{ caseId, note }>>
 * images are { caseId, pngPath, checks }.
 */

export function flaggedForVision(findings) {
  const byCase = new Map();
  for (const finding of findings) {
    if (finding.severity === "info") continue;
    if (!finding.image && finding.check !== "snapshot") continue;
    const row = byCase.get(finding.caseId) ?? { caseId: finding.caseId, pngPath: finding.image || "", checks: [] };
    if (finding.image) row.pngPath = finding.image;
    row.checks.push(finding.check);
    byCase.set(finding.caseId, row);
  }
  return [...byCase.values()];
}

export async function reviewFlagged(findings, reviewer) {
  const images = flaggedForVision(findings);
  if (typeof reviewer?.review !== "function") {
    return {
      status: "stub",
      reviewed: 0,
      images: images.length,
      notes: [],
      message: "No vision reviewer is configured. Pass { review } to reviewFlagged. The harness does not call a model.",
    };
  }
  const notes = await reviewer.review({ findings, images });
  return { status: "reviewed", reviewed: images.length, images: images.length, notes: notes ?? [] };
}
