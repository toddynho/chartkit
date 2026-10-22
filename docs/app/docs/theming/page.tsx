import Link from "next/link";
import { BrandPalette } from "@/components/BrandPalette";
import { CodeBlock } from "@/components/CodeBlock";
import { ThemeShowcase } from "@/components/ThemeShowcase";
import { ChartView } from "@/components/ChartView";
import { lookPanels } from "@/lib/looks";
import { pageMeta } from "@/lib/site";
import { minimalSpec, THEMES, TOKENS } from "@/lib/specs";

export const metadata = pageMeta(
  "Theming",
  "Soft is the default ChartKit look. Switch refined, editorial, and midnight, or derive a palette from a brand colour.",
  "/docs/theming",
);

const swatch = {
  ...minimalSpec,
  id: "theme-swatch",
  title: undefined,
  size: { width: 360, height: 160 },
};

export default function ThemingPage() {
  return (
    <>
      <h1>Theming</h1>
      <p>
        Soft is the default. Omit <code>theme</code>, or set <code>&quot;auto&quot;</code> or <code>&quot;soft&quot;</code>.
        The plot is transparent and the colours follow the page: <code>light-dark()</code> tracks{" "}
        <code>prefers-color-scheme</code> and an ancestor&apos;s <code>color-scheme</code>. The optional card is{" "}
        <code>#f5f5f7</code> in light and <code>#1c1c1e</code> in dark. <code>--ck-*</code> still overrides, and{" "}
        <code>--chart-N</code> is the next fallback.
      </p>
      <p>
        <code>refined</code> and <code>editorial</code> are built-in names. <code>theme: &quot;midnight&quot;</code> is
        the opt-in dark card. Any other name still falls through to midnight until you import that preset from{" "}
        <code>@chartkitdev/core/themes/all</code>.
      </p>
      <ThemeShowcase looks={lookPanels()} />
      <p>
        This next chart leaves <code>theme</code> unset, so it is Soft with this page&apos;s text and grid tokens on
        top. Toggle light and dark in the header.
      </p>
      <ChartView spec={swatch} />
      <h2>Tokens</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Variable</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {TOKENS.map(([token, role]) => (
              <tr key={token}>
                <td>
                  <code>{token}</code>
                </td>
                <td>{role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Light and dark</h2>
      <CodeBlock
        code={`.chart-host {
  --ck-background: transparent;
  --ck-text: #1d1d1f;
  --ck-muted: #6e6e73;
  --ck-grid: rgb(0 0 0 / 0.06);
  --ck-positive: #047857;
  --ck-negative: #be123c;
  --ck-font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.dark .chart-host {
  --ck-text: #f5f5f7;
  --ck-muted: #98989d;
  --ck-grid: rgb(245 245 247 / 0.08);
  --ck-positive: #30d158;
  --ck-negative: #ff453a;
}`}
        label="css"
      />
      <p>
        Muted text has to clear 4.5:1 against the page. The midnight muted color <code>#8a8a8a</code> does not, on
        white, which is one reason the page default is <code>auto</code> and the host sets <code>--ck-muted</code>. To
        use a shadcn palette, point the series variables at yours:
      </p>
      <CodeBlock
        code={`.chart-host {
  --ck-series-1: var(--chart-1);
  --ck-series-2: var(--chart-2);
  --ck-series-3: var(--chart-3);
  --ck-series-4: var(--chart-4);
  --ck-series-5: var(--chart-5);
}`}
        label="css"
      />
      <h2>theme.tokens.series</h2>
      <p>
        A spec can replace the series list without a preset name. The base stays Soft unless you set{" "}
        <code>preset</code>. <code>lines</code> defaults to the same list, so thin strokes follow the fills unless you
        pass a darker set.
      </p>
      <CodeBlock
        code={`{
  "version": "1",
  "type": "bar",
  "theme": {
    "tokens": {
      "series": ["#007aff", "#34c759", "#ff9500", "#af52de"]
    }
  }
}`}
        label="json"
      />
      <h2>paletteFromBrand</h2>
      <p>
        <code>paletteFromBrand</code> is opt-in. It is not in the line bundle and it is not the default theme. Pass one
        hex colour, or a list, and <code>&quot;light&quot;</code> or <code>&quot;dark&quot;</code>. Put the result on{" "}
        <code>theme.tokens.series</code>.
      </p>
      <CodeBlock
        code={`import { paletteFromBrand } from "@chartkitdev/core/themes/brand";

const series = paletteFromBrand("#007aff", "light");
const spec = { version: "1", type: "bar", theme: { tokens: { series } } };`}
        label="ts"
      />
      <BrandPalette />
      <h2>Dashboards</h2>
      <p>
        The <Link href="/dashboards">dashboard pages</Link> keep the palette in CSS: <code>--ck-series-*</code>,{" "}
        <code>--ck-text</code>, <code>--ck-area-opacity</code>, and a few page variables such as{" "}
        <code>--ck-wayline-1</code>. The JSON specs stay on <code>soft</code> or <code>midnight</code>. Harbor Ledger,
        Quiet Meter, Wayline, and Keel are original boards. Inspired by common SaaS dashboard styles. ChartKit is not
        affiliated with any product.
      </p>
      <h2>Presets</h2>
      <p>
        Soft, refined, editorial, and midnight are built in. The older names ({THEMES.join(", ")}) register when you
        import <code>@chartkitdev/core/themes/all</code>. Set <code>theme</code> to that name. Several of those muted
        colours are under 4.5:1 on their own background, which is why Soft is the default.
      </p>
    </>
  );
}
