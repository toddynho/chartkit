import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { snippets } from "@/lib/cloud";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Cloud render",
  "Render a ChartKit spec to SVG or PNG. Free, with a chartkit.dev mark. A key removes the mark.",
  "/docs/cloud",
);

export default function CloudDocsPage() {
  return (
    <>
      <h1>Cloud render</h1>
      <p>
        ChartKit Cloud renders a spec for any agent or app. There is no signup. Free images include a small{" "}
        <code>chartkit.dev</code> mark, linked to <Link href="/cloud">/cloud</Link>. A valid API key removes the mark.
        The mark is applied by this service. <code>@chartkitdev/core</code> does not draw it, and the core bundles do
        not include it.
      </p>
      <p>
        Every render runs <code>validate()</code> and <code>repair()</code> first. The response headers carry the
        applied JSON Patch, the warning codes, and the error codes. <code>POST</code> also returns them as JSON, so an
        agent can learn from the call. <code>render_chart</code> on <code>@chartkitdev/mcp</code> returns the image URL
        plus those repairs. The package is not published yet.
      </p>
      <h2>GET /render</h2>
      <p>
        <code>spec</code> is URL-encoded JSON or base64url JSON. <code>format</code> is <code>svg</code> (default) or{" "}
        <code>png</code>. <code>w</code> and <code>h</code> set the pixel size. <code>scale</code> is the PNG zoom,
        from 1 to 4. <code>theme</code> is a preset name such as <code>midnight</code>. <code>key</code> removes the
        mark when it is valid.
      </p>
      <CodeBlock code={snippets.img} label="html" />
      <h2>POST /render</h2>
      <CodeBlock code={snippets.fetch} label="js" />
      <p>
        The JSON body is <code>spec</code>, <code>format</code>, <code>w</code>, <code>h</code>, <code>scale</code>,{" "}
        <code>theme</code>, and an optional <code>key</code>. The same key can be sent as{" "}
        <code>Authorization: Bearer</code>. The body includes <code>url</code>, <code>applied</code>,{" "}
        <code>warnings</code>, <code>errors</code>, and either <code>svg</code> or base64 <code>png</code>. A spec
        longer than 1,800 characters is stored, and <code>url</code> is the short <code>/c/&lt;id&gt;</code> image.
      </p>
      <h2>POST /charts and POST /validate</h2>
      <p>
        <code>POST /charts</code> stores the repaired spec and returns <code>id</code>, <code>svgUrl</code>, and{" "}
        <code>pngUrl</code>. The same spec returns the same id. <code>POST /validate</code> does not draw. It returns
        the repaired spec, <code>applied</code>, and the remaining diagnostics.
      </p>
      <h2>Headers</h2>
      <ul>
        <li>
          <code>X-ChartKit-Repairs</code> and <code>X-ChartKit-Repair-Patch</code> (base64url JSON Patch)
        </li>
        <li>
          <code>X-ChartKit-Warnings</code> and <code>X-ChartKit-Errors</code>
        </li>
        <li>
          <code>X-ChartKit-Watermark</code> is <code>1</code> or <code>0</code>. <code>X-ChartKit-Key</code> is{" "}
          <code>valid</code>, <code>invalid</code>, or <code>absent</code>
        </li>
        <li>
          <code>Cache-Control: public, max-age=31536000, immutable</code> and an <code>ETag</code> on rendered images
        </li>
      </ul>
      <h2>Errors and limits</h2>
      <p>
        A spec that repair cannot draw returns <code>422</code> and an image that lists the CK codes, for{" "}
        <code>GET</code>. <code>POST</code> returns the same codes as JSON. A missing or unreadable spec returns{" "}
        <code>400</code> and an error image. More than 120 renders a minute from one IP returns <code>429</code>. The
        limit is the same with a key.
      </p>
      <h2>Keys</h2>
      <p>
        <Link href="/cloud">Remove the watermark</Link> starts Stripe Checkout. The price is a placeholder. Todd sets{" "}
        <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_PRICE_ID</code>, and <code>STRIPE_WEBHOOK_SECRET</code>. A
        recurring price also needs <code>STRIPE_CHECKOUT_MODE=subscription</code>. The webhook is{" "}
        <code>POST /stripe/webhook</code>. It issues one key per Checkout Session. The success page shows that key.
        Hosted keys live in Vercel KV or Upstash (<code>KV_REST_API_URL</code> and <code>KV_REST_API_TOKEN</code>).
        Without KV, the process keeps keys in memory.
      </p>
      <p>
        PNG uses resvg wasm with Inter and Roboto bundled in the service. SVG text stays on the library font stack.
      </p>
    </>
  );
}
