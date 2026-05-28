import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My App',
  description: 'My App description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
