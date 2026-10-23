import { CodeBlock } from "@/components/CodeBlock";
import { RemoveWatermark } from "@/components/RemoveWatermark";
import { cloudBase, liveLight, liveMidnight, snippets } from "@/lib/cloud";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Cloud",
  "Free chart renders for any agent or app. Pay only to remove the chartkit.dev mark.",
  "/cloud",
);

export default function CloudPage() {
  return (
    <div className="wrap section prose">
      <p className="kicker">ChartKit Cloud</p>
      <h1>Free forever. Pay only to remove the mark.</h1>
      <p className="lede">
        Any agent or app gets an instantly rendered chart. No signup. Free renders carry a small chartkit.dev mark. An
        API key removes that mark. The open-source library never draws it.
      </p>
      <div className="cloud-grid">
        <figure>
          <img src={liveLight} alt="Lane C has more. Free render with the chartkit.dev mark." width={640} height={336} />
          <figcaption>Light. The mark sits in a reserved band under the chart.</figcaption>
        </figure>
        <figure className="night">
          <img src={liveMidnight} alt="The same chart in Midnight, with the mark." width={640} height={336} />
          <figcaption>Midnight. The mark follows the dark card.</figcaption>
        </figure>
      </div>
      <h2>Use it as an image</h2>
      <p>
        <code>GET /render</code> returns SVG or PNG, so it works as an <code>img</code> src in email, Slack, a GitHub
        README, or Markdown. <code>POST /render</code> takes the JSON body and returns the image URL plus the repairs
        and warnings from <code>validate()</code> and <code>repair()</code>. <code>POST /charts</code> stores a large
        spec and returns a short URL. <code>POST /validate</code> returns the CK codes, the JSON Patch fixes, and the
        repaired spec.
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
        Send <code>Authorization: Bearer &lt;key&gt;</code> or <code>?key=</code>. A valid key removes the mark. An
        invalid key leaves it. The image URL has to carry the key for an <code>img</code> tag, because an image
        request cannot set a header. The price is a placeholder. Todd chooses it in Stripe. This repo does not create
        a product or a price.
      </p>
      <RemoveWatermark action={`${cloudBase}/checkout`} />
      <p>
        Free use is limited to 120 renders a minute per IP. The limit is the same with or without a key. It blocks
        abuse. It is not a quota you can pay to raise. The API reference is on <a href="/docs/cloud">Cloud render</a>.
        Agents can call <code>render_chart</code> from <code>@chartkitdev/mcp</code>.
      </p>
    </div>
  );
}
