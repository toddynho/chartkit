import { LargeDemo } from "@/components/LargeDemo";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Large data",
  "A million-point canvas line and a live Float64Array stream. Axes stay SVG.",
  "/large",
);

export default function LargePage() {
  return (
    <div className="wrap section">
      <h1>Large data</h1>
      <p className="lede">
        The same sensor trace as SVG with sampling, as canvas marks, or with sampling left off. Axes stay SVG.
      </p>
      <LargeDemo />
    </div>
  );
}
