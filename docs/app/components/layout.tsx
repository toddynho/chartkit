import { Metadata } from 'next';
import { headers } from 'next/headers';
import { componentMetadata, createMetadata, pageMetadata } from '@/lib/metadata';

// Component pages live in static folders, so the [slug] layout never runs for
// them. Resolve the page's own metadata here from the pathname set in middleware.
export function generateMetadata(): Metadata {
  const pathname = headers().get('x-pathname') ?? '';
  const slug = pathname.replace(/^\/components\/?/, '').split('/')[0];
  const meta = slug ? componentMetadata[slug] : undefined;

  if (!meta) {
    return createMetadata(pageMetadata.components);
  }

  return createMetadata({
    title: meta.title,
    description: meta.description,
    path: `/components/${slug}`,
  });
}

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
