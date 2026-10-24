import { MigrateGuide } from "@/components/MigrateGuide";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Migrate from ECharts",
  "Turn an ECharts option into a ChartKit spec. Unsupported options come back as warnings.",
  "/docs/migrate/echarts",
);

export default function EChartsMigratePage() {
  return <MigrateGuide source="echarts" />;
}