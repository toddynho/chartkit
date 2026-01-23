import { Metadata } from 'next';
import { componentMetadata, createMetadata } from '@/lib/metadata';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = componentMetadata[slug];

  if (!meta) {
    return createMetadata({
      title: 'Component',
      description: 'ChartKit component documentation.',
      path: `/components/${slug}`,
    });
  }

  return createMetadata({
    title: meta.title,
    description: meta.description,
    path: `/components/${slug}`,
  });
}

export default function ComponentLayout({ children }: Props) {
  return children;
}
