import { CodeBlock } from "@/components/CodeBlock";
import { ChartView } from "@/lib/chart";
import { pageMeta } from "@/lib/site";
import { minimalSpec, THEMES, TOKENS } from "@/lib/specs";

const quietMuted = new Set(["emerald", "latte", "neon", "obsidian", "orchid"]);

export const metadata = pageMeta(
  "Theming",
  "Theme ChartKit with --ck-* CSS variables, light and dark mode, and the 17 built-in presets.",
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
        The default theme is <code>auto</code>. Omit <code>theme</code>, or set it to <code>&quot;auto&quot;</code>, and
        the chart is transparent and follows the page: <code>light-dark()</code> colors track{" "}
        <code>prefers-color-scheme</code> and an ancestor&apos;s <code>color-scheme</code>. <code>--ck-*</code> still
        overrides, and <code>--chart-N</code> is the next fallback, so <code>var(--chart-1)</code> stays visible.
      </p>
      <p>
        <code>theme: &quot;midnight&quot;</code> is opt-in. It paints the dark card. Every other named preset is an
        opt-in import of <code>@chartkitdev/core/themes/all</code>. Midnight is no longer what you get when the field
        is missing.
      </p>
      <p>
        Every painted color is <code>var(--ck-*, fallback)</code>. This site sets the text, grid, and delta variables
        for light and dark, and leaves the series variables unset, so the core palette shows up here without a site
        change. Toggle the theme in the header. This chart is <code>auto</code>, with the page tokens on top:
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
  --ck-text: #1c1915;
  --ck-muted: #4a453e;
  --ck-grid: rgba(28, 25, 21, 0.14);
  --ck-positive: #157a3a;
  --ck-negative: #b42318;
  --ck-font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.dark .chart-host {
  --ck-text: #f4f1ea;
  --ck-muted: #c8c2b8;
  --ck-grid: rgba(244, 241, 234, 0.16);
  --ck-positive: #86efac;
  --ck-negative: #fca5a5;
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
      <h2>Presets</h2>
      <p>
        Seventeen presets ship with core. <code>auto</code> is the default and is built in, as is midnight. The rest
        register when you import <code>@chartkitdev/core/themes/all</code>. A preset chart below sets{" "}
        <code>theme</code> explicitly and opts out of the page tokens, so you see that preset&apos;s own colors.
        Emerald, latte, neon, obsidian, and orchid are omitted here because their muted color is under 4.5:1 on the
        preset background.
      </p>
      <div className="preset-grid">
        {THEMES.filter((name) => !quietMuted.has(name)).map((name) => (
          <article className="card" key={name}>
            <ChartView spec={{ ...swatch, id: `preset-${name}`, theme: name, title: name }} />
            <h3>{name}</h3>
          </article>
        ))}
      </div>
    </>
  );
}
