import type { Metadata } from 'next';
import './globals.css';
import './home-styles.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Fortnite Replay Analyzer',
  description: 'Analyze Fortnite replays and optimize your gameplay',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#0A0A0A', color: '#FFFFFF', margin: 0, padding: 0 }}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
