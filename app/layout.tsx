import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import './globals.css';

const titre = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-titre' });
const corps = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-corps' });

export const metadata: Metadata = {
  title: 'Atelier',
  description: 'Mesures, commandes et paiements de votre atelier de couture',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = { themeColor: '#1E2A5A', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${titre.variable} ${corps.variable}`}>
      <body>{children}</body>
    </html>
  );
}
