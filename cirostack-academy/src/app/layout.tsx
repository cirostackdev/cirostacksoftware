import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
import { Suspense } from 'react';
import ThemeProvider from '@/lib/providers/ThemeProvider';
import ToastContainer from '@/components/ui/ToastContainer';
import { FacebookPixel } from '@/components/FacebookPixel';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://academy.cirostack.com';
const OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CiroStack Academy — Learn to Build with AI',
    template: '%s | CiroStack Academy',
  },
  description:
    'CiroStack Academy teaches real-world software development skills — AI-assisted coding, full-stack development, and the technical foundation to land a developer job or build your own product.',
  keywords: [
    'learn software development',
    'AI coding course',
    'full-stack development course',
    'learn to code Nigeria',
    'coding bootcamp online',
    'CiroStack Academy',
    'web development course',
    'React course',
    'Next.js course',
  ],
  authors: [{ name: 'CiroStack', url: 'https://cirostack.com' }],
  creator: 'CiroStack',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    siteName: 'CiroStack Academy',
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: 'CiroStack Academy — Learn to Build with AI',
    description:
      'Real-world dev skills, AI-assisted coding techniques, and a structured path into the tech industry. Learn at your own pace.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'CiroStack Academy — Learn to Build with AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CiroStack',
    creator: '@CiroStack',
    title: 'CiroStack Academy — Learn to Build with AI',
    description:
      'Real-world dev skills, AI-assisted coding, and a path into tech. Learn at your own pace.',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head suppressHydrationWarning>
        {/* Prevent FOUC — apply theme before paint */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('academy-theme');if(t){t=JSON.parse(t).state?.theme}if(t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9RGMFJ5851" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-9RGMFJ5851');`,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <ThemeProvider>
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
