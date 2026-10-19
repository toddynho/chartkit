# @chartkitdev/mcp

MCP server for [ChartKit](https://chartkit.dev). It speaks stdio through the official `@modelcontextprotocol/sdk`.

**This package is not published to npm yet.** Todd publishes it himself, and only when he says so. It is not in the repo's publish workflow. The `npx @chartkitdev/mcp` commands below are the setup to use after that publish. Until then they will not install the server.

The server makes no network calls. It validates, repairs, and renders with `@chartkitdev/core`, and it reads a copy of `docs/public/features.json`, `llms.txt`, the v1 JSON Schema, and the example specs that the build copies into the package. Feature statuses come from that file. This package does not invent them.

PNG is not a tool output. Rasterizing SVG would add a native or wasm dependency, and this package does not include one. `render` accepts `format: "svg"` only.

## Tools

| Tool | Input | Returns |
|---|---|---|
| `validate` | `spec` object or JSON string | The object from `@chartkitdev/core` `validate()`: `ok`, `diagnostics`, `errors`, `warnings`. Diagnostics include JSON Patch `fix` arrays. |
| `repair` | `spec` object or JSON string | The object from `repair()`: repaired `spec`, remaining diagnostics, and `applied` patches. The input is not mutated. |
| `render` | `spec`, optional `format: "svg"` | SVG string from `@chartkitdev/core/extra` (every chart type, including the extras), plus `width` and `height` in pixels. A percentage attribute falls back to the viewBox. |
| `lookup_feature` | `query` string | Matching matrix rows: ChartKit's status, the spec snippet or `null`, `https://chartkit.dev/features/<id>`, and every other library's status. `partial` is not native. |
| `list_chart_types` | none | Chart types in the bundled examples, with filenames. |
| `get_example` | `type` string | Example specs for that type, filename, or example id. |

`lookup_feature` searches feature ids, labels, and the synonym index in `features.json` (`"rotate labels"`, `"dual axis"`). An empty `matches` array means the file has no row. The tool does not guess.

Gantt, timeline, quadrant, venn, and journey go through `validate()` / `repair()`, which add a CK1011 warning and point at `validate/phase4` for the extra field rules.

## Resources

| URI | Body |
|---|---|
| `chartkit://llms.txt` | Bundled `llms.txt` |
| `chartkit://schema/v1.json` | Bundled ChartKit v1 JSON Schema |

## Run it from a checkout

This is the path that works before the npm publish.

```sh
npm install
npm run build --workspace=@chartkitdev/mcp
node packages/mcp/dist/cli.js
```

Point the client at that `node` command and the `dist/cli.js` path. The process speaks MCP on stdin and stdout. Do not write logs to stdout.

## Cursor

Install: coming soon. After the package is on npm, put this in `.cursor/mcp.json` (project) or the user MCP config:

```json
{
  "mcpServers": {
    "chartkit": {
      "command": "npx",
      "args": ["-y", "@chartkitdev/mcp"]
    }
  }
}
```

`npx @chartkitdev/mcp` fails until the publish. Use the checkout command above until then.

## Claude Desktop

Install: coming soon. After the publish, add the same `mcpServers` entry to `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "chartkit": {
      "command": "npx",
      "args": ["-y", "@chartkitdev/mcp"]
    }
  }
}
```

That command does not work until `@chartkitdev/mcp` is published.

## Claude Code

Install: coming soon. After the publish:

```sh
claude mcp add chartkit -- npx -y @chartkitdev/mcp
```

Or commit a project `.mcp.json`:

```json
{
  "mcpServers": {
    "chartkit": {
      "command": "npx",
      "args": ["-y", "@chartkitdev/mcp"]
    }
  }
}
```

`npx -y @chartkitdev/mcp` will not resolve until the package is on npm.

## Packed size

This is a Node server, not a browser bundle, so it is not part of `scripts/size-budget.json`. The packed tarball is mostly the bundled `features.json`.

```sh
npm run build --workspace=@chartkitdev/mcp
npm pack --dry-run --workspace=@chartkitdev/mcp
```
