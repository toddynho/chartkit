import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { CopyButton } from "@/components/CopyButton";
import { headline, published, ROUND } from "@/lib/benchmarks";
import { pageMeta } from "@/lib/site";
import { AGENT_PROMPT } from "@/lib/specs";
import feed from "@/public/recipes.json";

export const metadata = pageMeta(
  "Agents",
  "How AI agents should use ChartKit: llms.txt, the JSON Schema, dashboard recipes, and the validate then repair loop.",
  "/agents",
);

interface ClosedRow {
  key: string;
  values?: string[];
  also?: string[];
  effect: string;
}

interface PromptRow {
  id: string;
  prompt: string;
  onMain: boolean;
  markdown: string;
}

interface RecipeRow {
  id: string;
  prompt: string;
  markdown: string;
  onMain: boolean;
  note: string;
  keys: string[];
  spec: unknown;
  adapted?: string[];
}

const closed = feed.closed as ClosedRow[];
const prompts = feed.prompts as PromptRow[];
const recipes = feed.recipes as RecipeRow[];

export default function AgentsPage() {
  return (
    <div className="wrap section prose">
      <h1>Built for agents</h1>
      <p className="lede">
        The spec is the interface. An agent writes JSON, checks it, repairs the safe mistakes, and renders SVG. No
        other chart library in the eval has a schema and a repair function.
      </p>
      <h2>Give the model the docs</h2>
      <ul>
        <li>
          <a href="/llms.txt">llms.txt</a> — the rules, the repair loop, and one spec per chart type.
        </li>
        <li>
          <a href="/llms-full.txt">llms-full.txt</a> — the longer reference, including the closed dashboard keys.
        </li>
        <li>
          <a href="/recipes.json">recipes.json</a> — copy-paste dashboard specs, the closed-key list, and one prompt per dashboard page.
        </li>
        <li>
          <a href="/schema/v1.json">schema/v1.json</a> — the JSON Schema.
        </li>
        <li>
          <a href="/features.json">features.json</a> — 21 libraries, one status and source per feature.{" "}
          <Link href="/features">Feature pages</Link> have a Markdown twin.
        </li>
        <li>
          <Link href="/docs/mcp">@chartkitdev/mcp</Link> — validate, repair, render, and feature lookup over stdio.
          Install is coming soon. The package is not on npm yet.
        </li>
      </ul>
      <p>
        On the 2026-10-16 eval, which round {ROUND} did not re-run, official docs put ChartKit at 42/42 on the first try, at a mean of {published.agents[0].tokensOfficial} output
        tokens. With no docs, the first try is {headline.repairFrom} and the second try, which sees the validator
        errors, is 42/42. <code>repair()</code> with no model call takes that same first try to {headline.repairTo}.
        The old React-only llms.txt scored 18/42. Numbers and method are on the{" "}
        <Link href="/benchmarks#agents">benchmarks page</Link>.
      </p>
      <h2>The loop</h2>
      <CodeBlock
        code={`import { repair, validate } from "@chartkitdev/core/validate";
import { render } from "@chartkitdev/core/all";

const checked = validate(spec);
const ready = checked.ok ? spec : repair(spec).spec;
const svg = render(ready);`}
        label="ts"
      />
      <ol>
        <li>
          <code>validate(spec)</code> returns every diagnostic in one pass.
        </li>
        <li>
          When <code>ok</code> is false, <code>repair(spec)</code> applies the safe patches and revalidates. The input
          is not mutated.
        </li>
        <li>
          Render <code>repair(spec).spec</code> when that result is ok. If errors remain, follow those hints. Repair
          does not invent rows.
        </li>
      </ol>
      <h2>Shell and chart</h2>
      <p>{feed.shell}</p>
      <h2>Closed keys</h2>
      <p>
        Round 1 unlocked these spec keys. The same list is in <a href="/recipes.json">recipes.json</a> and{" "}
        <a href="/llms-full.txt">llms-full.txt</a>.
      </p>
      <ul>
        {closed.map((row) => (
          <li key={row.key}>
            <code>{row.key}</code>
            {row.values ? ` ${row.values.join(" | ")}` : ""}
            {row.also ? `. Also ${row.also.join(", ")}` : ""}
            {". "}
            {row.effect}
          </li>
        ))}
      </ul>
      <h2>Golden prompts</h2>
      <p>One prompt per dashboard page. All ten are on main.</p>
      <ul>
        {prompts.map((row) => (
          <li key={row.id}>
            <a href={row.markdown}>{row.markdown}</a>
            {row.onMain ? "" : " (not merged)"}
            <CodeBlock code={row.prompt} label="prompt" />
          </li>
        ))}
      </ul>
      <h2>Cookbook</h2>
      <p>
        Each recipe is one spec from a dashboard page. The Vercel area is the visitors chart on{" "}
        <a href="/dashboards/edge">/dashboards/edge</a>.
      </p>
      {recipes.map((row) => (
        <section key={row.id}>
          <h3>{row.prompt}</h3>
          <p>
            <a href={row.markdown}>{row.markdown}</a>
            {row.onMain ? "" : " (not on main)"}
            {". Keys: "}
            {row.keys.map((key) => (
              <code key={key}>{key} </code>
            ))}
          </p>
          <p>{row.note}</p>
          <CodeBlock code={JSON.stringify(row.spec, null, 2)} label="json" />
        </section>
      ))}
      <h2>Paste this into a system prompt</h2>
      <CodeBlock code={AGENT_PROMPT} label="prompt" />
      <CopyButton text={AGENT_PROMPT} label="Copy prompt" />
    </div>
  );
}
