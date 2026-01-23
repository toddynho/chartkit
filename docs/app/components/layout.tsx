import { Metadata } from 'next';
import { createMetadata, pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata(pageMetadata.components);

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
