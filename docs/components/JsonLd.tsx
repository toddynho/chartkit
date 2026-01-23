import { siteConfig } from '@/lib/metadata';

export function JsonLd() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'ChartKit',
    description: siteConfig.description,
    url: siteConfig.url,
    codeRepository: siteConfig.github,
    programmingLanguage: ['TypeScript', 'React'],
    runtimePlatform: 'Node.js',
    license: 'https://opensource.org/licenses/MIT',
    author: {
      '@type': 'Person',
      name: 'Todd Garland',
      url: 'https://x.com/toddo',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ChartKit',
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon.svg`,
    sameAs: [
      siteConfig.github,
      'https://x.com/toddo',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ChartKit',
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/components?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}
