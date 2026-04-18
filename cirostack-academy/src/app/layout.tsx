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

export const metadata: Metadata = {
  title: { default: 'CiroStack Academy', template: '%s | CiroStack Academy' },
  description:
    'Learn to build with AI. Real-world dev skills, AI-assisted coding techniques, and a path into the tech industry.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://academy.cirostack.com'
  ),
  openGraph: {
    siteName: 'CiroStack Academy',
    type: 'website',
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
