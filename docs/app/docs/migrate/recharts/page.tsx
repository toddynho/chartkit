import { MigrateGuide } from "@/components/MigrateGuide";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Migrate from Recharts",
  "Turn Recharts JSX or props into a ChartKit spec. Unsupported options come back as warnings.",
  "/docs/migrate/recharts",
);

export default function RechartsMigratePage() {
  return <MigrateGuide source="recharts" />;
}
