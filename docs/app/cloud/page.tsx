import { CodeBlock } from "@/components/CodeBlock";
import { RemoveWatermark } from "@/components/RemoveWatermark";
import { cloudBase, cloudSpec, liveLight, liveMidnight, snippets } from "@/lib/cloud";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Cloud",
  "Free chart renders for any agent or app. Pay only to remove the chartkit.dev mark.",
  "/cloud",
);

export default function CloudPage() {
  const priceLabel = process.env.NEXT_PUBLIC_CHARTKIT_PRICE_LABEL?.trim() || "Pricing coming soon";
  return (
    <div className="wrap section prose cloud-page">
      <p className="kicker">ChartKit Cloud</p>
      <h1>Free forever. Pay only to remove the mark.</h1>
      <p className="lede">
        Any agent or app gets an instantly rendered chart. No signup. Free renders carry a small chartkit.dev mark. An
        API key removes that mark. The open-source library never draws it.
      </p>
      <div className="cloud-grid">
        <figure>
          <img src={liveLight} alt={`${cloudSpec.a11y.alt} Free render with the chartkit.dev mark.`} width={960} height={496} />
          <figcaption>Light. Revenue area with a target line. The mark sits in a reserved band under the chart.</figcaption>
        </figure>
        <figure className="night">
          <img src={liveMidnight} alt="Revenue and target in Midnight, with the mark." width={960} height={496} />
          <figcaption>Midnight. The same chart. The mark follows the dark card.</figcaption>
        </figure>
      </div>
      <h2>Use it as an image</h2>
      <p>
        <code>GET /render</code> returns a marked SVG or PNG, so it works as an <code>img</code> src in email, Slack, a
        GitHub README, or Markdown. That URL has no API key. <code>POST /render</code> takes the JSON body and returns
        the image URL plus the repairs and warnings from <code>validate()</code> and <code>repair()</code>.{" "}
        <code>POST /charts</code> stores the spec and returns a short URL. <code>POST /validate</code> returns the CK
        codes, the JSON Patch fixes, and the repaired spec.
      </p>
      <CodeBlock code={snippets.img} label="html" />
      <CodeBlock code={snippets.curl} label="shell" />
      <CodeBlock code={snippets.fetch} label="js" />
      <CodeBlock code={snippets.markdown} label="markdown" />
      <p>
        GitHub READMEs display PNG. The Markdown snippet uses <code>format=png</code>. SVG is the default everywhere
        else. Add <code>theme=midnight</code>, <code>w</code>, <code>h</code>, and <code>scale</code> on the query
        string. A spec can be URL-encoded JSON or base64url. Responses cache for a year. The cache key is a hash of
        the spec, the format, the size, and whether the mark is on.
      </p>
      <h2>Remove the watermark</h2>
      <p>
        Send the key as <code>Authorization: Bearer</code> on <code>POST /charts</code> or <code>POST /render</code>. A
        valid key stores the chart and returns a stable URL such as <code>/c/&lt;id&gt;.svg</code>. That URL has no
        secret. A plain GET serves the unmarked image. An invalid key leaves the mark. <code>GET /render</code> always
        includes the mark, so an image address never carries a key.
      </p>
      <CodeBlock code={snippets.clean} label="js" />
      <RemoveWatermark action={`${cloudBase}/checkout`} priceLabel={priceLabel} />
      <p>
        Free use is limited to 120 renders a minute per IP. The limit is the same with or without a key. It blocks
        abuse. It is not a quota you can pay to raise. The API reference is on <a href="/docs/cloud">Cloud render</a>.
        Agents can call <code>render_chart</code> from <code>@chartkitdev/mcp</code>.
      </p>
    </div>
  );
}
