import { Metadata } from 'next';
import { utilityMetadata, createMetadata } from '@/lib/metadata';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = utilityMetadata[slug];

  if (!meta) {
    return createMetadata({
      title: 'Utility',
      description: 'ChartKit utility component documentation.',
      path: `/utilities/${slug}`,
    });
  }

  return createMetadata({
    title: meta.title,
    description: meta.description,
    path: `/utilities/${slug}`,
  });
}

export default function UtilityLayout({ children }: Props) {
  return children;
}
