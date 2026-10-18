import { chartSvg, scaleSvgText } from "@/lib/chart";
import { SpecEditor } from "./SpecEditor";

export function LiveSpec({
  spec,
  mode = "compact",
  labelScale = 1,
}: {
  spec: unknown;
  mode?: "compact" | "full" | "hero";
  labelScale?: number;
}) {
  const svg = scaleSvgText(chartSvg(spec), labelScale);
  return <SpecEditor initialSpec={spec} initialSvg={svg} mode={mode} labelScale={labelScale} />;
}
