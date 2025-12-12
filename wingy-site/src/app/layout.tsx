import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Wingy Restaurant',
    default: 'Wingy Restaurant - Best Wings in Flavor Town',
  },
  description: 'Experience the most delicious wings at Wingy Restaurant. Over 20 unique flavors from classic buffalo to exotic fusion. Order online for delivery or visit us today!',
  keywords: ['wings', 'restaurant', 'food delivery', 'buffalo wings', 'flavor town'],
  authors: [{ name: 'Wingy Restaurant' }],
  creator: 'Wingy Restaurant',
  publisher: 'Wingy Restaurant',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wingyrestaurant.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wingyrestaurant.com',
    title: 'Wingy Restaurant - Best Wings in Flavor Town',
    description: 'Experience the most delicious wings at Wingy Restaurant. Over 20 unique flavors from classic buffalo to exotic fusion.',
    siteName: 'Wingy Restaurant',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wingy Restaurant - Best Wings in Flavor Town',
    description: 'Experience the most delicious wings at Wingy Restaurant. Over 20 unique flavors from classic buffalo to exotic fusion.',
    creator: '@wingywings',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-sand text-chocolate min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
