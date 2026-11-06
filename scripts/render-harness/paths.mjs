import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const harnessDir = dirname(fileURLToPath(import.meta.url));
export const repoRoot = join(harnessDir, "../..");
export const outDir = join(harnessDir, "out");
export const pngDir = join(outDir, "png");
export const baselineDir = join(harnessDir, "baselines");
export const fastBaselinePath = join(baselineDir, "fast.json");
export const fullBaselinePath = join(baselineDir, "full.json");
export const allowlistPath = join(harnessDir, "allowlist.json");
export const claimAllowlistPath = join(harnessDir, "claim-allowlist.json");
export const reportDir = join(harnessDir, "report");
export const statusPath = join(repoRoot, "apps/web/src/data/option-effect-status.json");
export const examplesDir = join(repoRoot, "packages/core/examples");
export const fontDir = join(repoRoot, "apps/cloud/fonts");

/** Recorded on every case list. The sweep is a full sort, not a random sample. */
export const SEED = "20261105";

/** Hamming distance on a 64-bit dHash. Antialiasing inside this band is the same render. */
export const HASH_TOLERANCE = 8;

/** Raster width passed to resvg. The hash uses the pixels, not a committed PNG. */
export const RASTER_WIDTH = 96;

/** A render slower than this is a warning finding. Ordinary charts stay under it. */
export const SLOW_MS = 1000;
