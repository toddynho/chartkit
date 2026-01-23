import { Metadata } from 'next';
import { createMetadata, pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata(pageMetadata.themes);

export default function ThemesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
