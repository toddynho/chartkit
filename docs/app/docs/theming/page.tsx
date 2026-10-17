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
        Every painted color is <code>var(--ck-*, fallback)</code>. Set the variables on a parent and the SVG follows.
        This site does that for light and dark. Series colors are left unset, so a new core palette shows up here
        without a site change.
      </p>
      <p>Toggle the theme in the header. This chart uses the page tokens:</p>
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
        Muted text has to clear 4.5:1 against the page. The midnight fallback <code>#8a8a8a</code> does not, on white,
        so the host sets <code>--ck-muted</code>. To use a shadcn palette, point the series variables at yours:
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
        Seventeen presets ship with core. Midnight is built in. The others are an opt-in import of{" "}
        <code>@chartkitdev/core/themes/all</code>. A preset chart below opts out of the page tokens so you see the
        preset&apos;s own colors. Emerald, latte, neon, obsidian, and orchid are omitted here because their muted color
        is under 4.5:1 on the preset background.
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
