import Link from "next/link";
import { whenToUseFaqs } from "@/lib/faq";
import { SITE, pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "When to use ChartKit",
  "When ChartKit is the right chart library, when it is not, and the round 7 numbers behind that choice.",
  "/when-to-use",
);

export default function WhenToUsePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: whenToUseFaqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      {
        "@type": "SoftwareSourceCode",
        name: "ChartKit",
        description: SITE.description,
        codeRepository: SITE.github,
        url: SITE.url,
        programmingLanguage: "TypeScript",
        runtimePlatform: "JavaScript",
        license: "https://opensource.org/licenses/MIT",
        targetProduct: {
          "@type": "SoftwareApplication",
          name: "ChartKit",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      },
    ],
  };

  return (
    <div className="wrap section prose">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>When to use ChartKit</h1>
      <p className="lede">
        A direct answer, then the losses. The numbers are round 7 and match{" "}
        <a href="/benchmarks.json">benchmarks.json</a>.
      </p>
      {whenToUseFaqs.map((item) => (
        <section key={item.question}>
          <h2>{item.question}</h2>
          <p>{item.answer}</p>
        </section>
      ))}
      <p>
        Pairwise pages: <Link href="/compare/recharts">Recharts</Link>, <Link href="/compare/chartjs">Chart.js</Link>,{" "}
        <Link href="/compare/echarts">ECharts</Link>, <Link href="/compare/nivo">Nivo</Link>.
      </p>
    </div>
  );
}
