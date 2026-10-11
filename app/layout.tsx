import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Waseem Cafe | Coffee, Tea & Juice',
  description: 'Coffee, tea and juice at Waseem Cafe.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
