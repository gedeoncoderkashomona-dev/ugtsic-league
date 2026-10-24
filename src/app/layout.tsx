import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UGTSIC League — Futebol Corporativo SESAP / G Trigueiro',
  description:
    'App de Futebol Society e Sorteio Inteligente para o setor de desenvolvimento da UGTSIC / SESAP / G Trigueiro.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UGTSIC League',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-ugtsic-arena min-h-screen text-slate-900 antialiased pb-20 md:pb-8">
        {children}
      </body>
    </html>
  );
}
