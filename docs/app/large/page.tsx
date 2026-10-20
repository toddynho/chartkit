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
        Canvas marks for a line that is too long for a DOM path, with the same spec and the same theme tokens as SVG.
      </p>
      <LargeDemo />
    </div>
  );
}
