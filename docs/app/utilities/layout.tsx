import { Metadata } from 'next';
import { headers } from 'next/headers';
import { utilityMetadata, createMetadata, pageMetadata } from '@/lib/metadata';

// Utility pages live in static folders, so the [slug] layout never runs for
// them. Resolve the page's own metadata here from the pathname set in middleware.
export function generateMetadata(): Metadata {
  const pathname = headers().get('x-pathname') ?? '';
  const slug = pathname.replace(/^\/utilities\/?/, '').split('/')[0];
  const meta = slug ? utilityMetadata[slug] : undefined;

  if (!meta) {
    return createMetadata(pageMetadata.utilities);
  }

  return createMetadata({
    title: meta.title,
    description: meta.description,
    path: `/utilities/${slug}`,
  });
}

export default function UtilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
