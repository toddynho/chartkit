# @chartkitdev/mcp

MCP server for [ChartKit](https://chartkit.dev). It speaks stdio through the official `@modelcontextprotocol/sdk`.

```bash
npm install @chartkitdev/mcp
npx -y @chartkitdev/mcp
```

The manual publish workflow ships this package with the other `@chartkitdev` packages. From a git checkout, before that publish, build `packages/mcp` and run `node packages/mcp/dist/cli.js`.

`validate`, `repair`, `render`, `lookup_feature`, `list_chart_types`, and `get_example` make no network calls. They use `@chartkitdev/core` and a copy of `catalog/public/features.json`, `llms.txt`, the v1 JSON Schema, and the example specs that the build copies into the package. Feature statuses come from that file. This package does not invent them. `render_chart` is the exception: it POSTs the spec to ChartKit Cloud and returns the image URL plus repairs.

The local `render` tool accepts `format: "svg"` only. PNG from that tool would add a rasterizer to this package, and it does not include one. `render_chart` can ask Cloud for PNG. Omit `format`, or pass `svg`, unless the host cannot display SVG.

## Tools

| Tool | Input | Returns |
|---|---|---|
| `validate` | `spec` object or JSON string | The object from `@chartkitdev/core` `validate()`: `ok`, `diagnostics`, `errors`, `warnings`. Diagnostics include JSON Patch `fix` arrays. |
| `repair` | `spec` object or JSON string | The object from `repair()`: repaired `spec`, remaining diagnostics, and `applied` patches. The input is not mutated. |
| `render` | `spec`, optional `format: "svg"` | SVG string from `@chartkitdev/core/extra` (every chart type, including the extras), plus `width` and `height` in pixels. A percentage attribute falls back to the viewBox. |
| `render_chart` | `spec`, optional `format` (omit or `svg`; `png` only when the host cannot display SVG), `w`, `h`, `scale` (prefer 2 or higher for PNG), `theme`, `background` (omit for `#ffffff`; CSS color or `transparent`), `key` | ChartKit Cloud image URL plus `applied` repairs, warnings, and errors. A key is sent as `Authorization: Bearer` and removes the chartkit.dev mark. The returned URL does not contain the key. `theme` `midnight` is the dark plate. |
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

Put this in `.cursor/mcp.json` (project) or the user MCP config:

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

`npx -y @chartkitdev/mcp` runs the published package. Use the checkout command above when you are working from this repo.

## Claude Desktop

Add the same `mcpServers` entry to `claude_desktop_config.json`:

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

That `npx -y @chartkitdev/mcp` command is the published server.

## Claude Code

From a terminal:

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

`npx -y @chartkitdev/mcp` is the published command.

## Packed size

This is a Node server, not a browser bundle, so it is not part of `scripts/size-budget.json`. The packed tarball is mostly the bundled `features.json`.

```sh
npm run build --workspace=@chartkitdev/mcp
npm pack --dry-run --workspace=@chartkitdev/mcp
```
