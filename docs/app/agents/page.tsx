import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { CopyButton } from "@/components/CopyButton";
import { headline, published, ROUND } from "@/lib/benchmarks";
import { pageMeta } from "@/lib/site";
import { AGENT_PROMPT } from "@/lib/specs";

export const metadata = pageMeta(
  "Agents",
  "How AI agents should use ChartKit: llms.txt, the JSON Schema, and the validate then repair loop.",
  "/agents",
);

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
          <a href="/llms-full.txt">llms-full.txt</a> — the longer reference.
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
      <h2>Paste this into a system prompt</h2>
      <CodeBlock code={AGENT_PROMPT} label="prompt" />
      <CopyButton text={AGENT_PROMPT} label="Copy prompt" />
    </div>
  );
}
