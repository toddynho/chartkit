import { chartSvg } from "@/lib/chart";
import { SpecEditor } from "./SpecEditor";

export function LiveSpec({ spec, mode = "compact" }: { spec: unknown; mode?: "compact" | "full" }) {
  const svg = chartSvg(spec);
  return <SpecEditor initialSpec={spec} initialSvg={svg} mode={mode} />;
}
