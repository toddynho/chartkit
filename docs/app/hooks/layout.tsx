import { Metadata } from 'next';
import { createMetadata, pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata(pageMetadata.hooks);

export default function HooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
