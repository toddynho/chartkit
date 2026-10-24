import type { Metadata } from "next";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE, THEME_BOOT } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "ChartKit — Charts become data",
    template: "%s · ChartKit",
  },
  description: SITE.description,
  applicationName: "ChartKit",
  authors: [{ name: "Todd Garland", url: "https://x.com/toddo" }],
  creator: "Todd Garland",
  keywords: [
    "chartkit",
    "json chart spec",
    "svg charts",
    "react charts",
    "vue charts",
    "svelte charts",
    "charting library",
  ],
  openGraph: {
    title: "ChartKit — Charts become data",
    description: SITE.description,
    url: SITE.url,
    siteName: "ChartKit",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChartKit — Charts become data",
    description: SITE.description,
  },
  alternates: { canonical: SITE.url },
  robots: { index: true, follow: true },
  other: {
    "ai:llms": "/llms.txt",
    "ai:llms-full": "/llms-full.txt",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ChartKit",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  url: SITE.url,
  description: SITE.description,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM context" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM context, full" />
        <link rel="describedby" href="/llms.txt" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <Script id="theme-boot" strategy="beforeInteractive">
          {THEME_BOOT}
        </Script>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <Header />
        <main id="content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
