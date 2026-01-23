import { Metadata } from 'next';
import { createMetadata, pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata(pageMetadata.utilities);

export default function UtilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
