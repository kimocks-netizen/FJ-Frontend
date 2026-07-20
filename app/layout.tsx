import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from './components/ToastContext';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';

export const metadata: Metadata = {
  title: 'FJ General & Engineering Services',
  description: 'Your One-Stop Team for Tree Felling, Road Works, Tar Resurfacing, Custom Fabrication and Engineering Services across Gauteng.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'FJ General & Engineering Services',
    description: 'Your One-Stop Team for Tree Felling, Road Works, Tar Resurfacing, Custom Fabrication and Engineering Services across Gauteng.',
    images: [{ url: '/big-logo.png', width: 512, height: 512, alt: 'FJ General & Engineering Services' }],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
          <FloatingWhatsAppButton />
        </ToastProvider>
      </body>
    </html>
  );
}
