import { LiveSpec } from "@/components/LiveSpec";
import { pageMeta } from "@/lib/site";
import { heroSpec } from "@/lib/specs";

export const metadata = pageMeta(
  "Playground",
  "Edit a ChartKit spec, validate it, repair it, and export SVG or PNG.",
  "/playground",
);

export default function PlaygroundPage() {
  return (
    <div className="wrap section">
      <h1>Playground</h1>
      <p className="lede">
        Edit the spec. The preview renders with <code>@chartkitdev/core</code>. Validate and Repair call the same
        functions an agent would. Share puts the spec in the URL hash. A preset theme opts out of the page colors.
      </p>
      <LiveSpec spec={heroSpec} mode="full" />
    </div>
  );
}
