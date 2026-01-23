import { Metadata } from 'next';
import { createMetadata, pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata(pageMetadata.demo);

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
