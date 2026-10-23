import { CodeBlock } from "@/components/CodeBlock";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "MCP server",
  "ChartKit's MCP server validates, repairs, and renders a spec, and looks up feature support. Install is coming soon.",
  "/docs/mcp",
);

const cursor = `{
  "mcpServers": {
    "chartkit": {
      "command": "npx",
      "args": ["-y", "@chartkitdev/mcp"]
    }
  }
}`;

const local = `npm run build --workspace=@chartkitdev/mcp
node packages/mcp/dist/cli.js`;

export default function McpPage() {
  return (
    <>
      <h1>MCP server</h1>
      <div className="note">
        <strong>Install: coming soon</strong>
        <code>@chartkitdev/mcp</code> is not on npm yet. Todd publishes it, and only when he says so. The{" "}
        <code>npx @chartkitdev/mcp</code> snippets on this page are the setup for after that publish. They do not
        install the server today.
      </div>
      <p>
        The server speaks stdio. It calls <code>validate</code> and <code>repair</code> from{" "}
        <code>@chartkitdev/core/validate</code>, and it renders with <code>@chartkitdev/core/extra</code>, which
        includes every chart type. Those tools do not call the network. <code>render_chart</code> does: it asks ChartKit
        Cloud for an image URL. Feature answers are a copy of{" "}
        <a href="/features.json">features.json</a> bundled at build time, synonyms included. A <code>partial</code>{" "}
        cell is not reported as native, and every other library&apos;s status is returned with ChartKit&apos;s.
      </p>
      <h2>Tools</h2>
      <ul>
        <li>
          <code>validate(spec)</code> returns the core diagnostics, including each JSON Patch fix.
        </li>
        <li>
          <code>repair(spec)</code> applies those fixes and returns the repaired spec plus the remaining diagnostics.
        </li>
        <li>
          <code>render(spec, {`{ format: "svg" }`})</code> returns the SVG string, plus width and height. PNG is not
          implemented on this local tool. A rasterizer would add a native or wasm dependency, and this package does not
          include one.
        </li>
        <li>
          <code>render_chart(spec)</code> calls ChartKit Cloud and returns the image URL plus the repairs and warnings.
          <code>format</code> is <code>svg</code> or <code>png</code>. Set <code>CHARTKIT_CLOUD_KEY</code> to remove the
          mark. This is the one tool that uses the network. See <a href="/docs/cloud">Cloud render</a>.
        </li>
        <li>
          <code>lookup_feature(query)</code> searches the matrix. The result has ChartKit&apos;s status, the spec
          snippet when the matrix has one, the docs URL, and the other libraries.
        </li>
        <li>
          <code>list_chart_types()</code> and <code>get_example(type)</code> return the example specs from the repo.
        </li>
      </ul>
      <h2>Resources</h2>
      <ul>
        <li>
          <code>chartkit://llms.txt</code>
        </li>
        <li>
          <code>chartkit://schema/v1.json</code>
        </li>
      </ul>
      <h2>From a checkout</h2>
      <p>This works before the publish. The process is an MCP server on stdin and stdout.</p>
      <CodeBlock code={local} label="shell" />
      <h2>Cursor</h2>
      <p>
        After the package is published, add this to <code>.cursor/mcp.json</code>. Until then, <code>npx</code> cannot
        download it.
      </p>
      <CodeBlock code={cursor} label="json" />
      <h2>Claude Desktop</h2>
      <p>
        The same <code>mcpServers</code> block goes in <code>claude_desktop_config.json</code> (macOS:{" "}
        <code>~/Library/Application Support/Claude/</code>, Windows: <code>%APPDATA%\Claude\</code>, Linux:{" "}
        <code>~/.config/Claude/</code>). Install is coming soon. The command fails until npm has the package.
      </p>
      <CodeBlock code={cursor} label="json" />
      <h2>Claude Code</h2>
      <p>After the publish:</p>
      <CodeBlock code={`claude mcp add chartkit -- npx -y @chartkitdev/mcp`} label="shell" />
      <p>
        Or commit the JSON above as <code>.mcp.json</code>. <code>npx -y @chartkitdev/mcp</code> does not resolve
        today.
      </p>
    </>
  );
}
