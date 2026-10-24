import { MigrateGuide } from "@/components/MigrateGuide";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Migrate from Chart.js",
  "Turn a Chart.js config into a ChartKit spec. Unsupported options come back as warnings.",
  "/docs/migrate/chartjs",
);

export default function ChartJsMigratePage() {
  return <MigrateGuide source="chartjs" />;
}
