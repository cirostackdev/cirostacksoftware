import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
import { Suspense } from "react";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WhatsAppPopup } from "@/components/WhatsAppPopup";
import { FacebookPixel } from "@/components/FacebookPixel";

const SITE_URL = "https://cirostack.com";
const OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CiroStack — Custom Software, Apps & AI for Growing Businesses",
    template: "%s | CiroStack",
  },
  description:
    "CiroStack builds custom websites, mobile apps, and AI automation solutions for growing businesses. Fixed-price engagements. Senior engineers. Delivery in weeks.",
  keywords: [
    "custom software development",
    "mobile app development",
    "AI automation",
    "web development agency",
    "software development agency Nigeria",
    "Next.js development",
    "React development",
    "CiroStack",
  ],
  authors: [{ name: "CiroStack", url: SITE_URL }],
  creator: "CiroStack",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: "fTAqT8iLRxD944c1bCW9uZjxKCV7jV4bwR754Praqz8",
  },
  openGraph: {
    type: "website",
    siteName: "CiroStack",
    locale: "en_US",
    url: SITE_URL,
    title: "CiroStack — Custom Software, Apps & AI for Growing Businesses",
    description:
      "CiroStack builds custom websites, mobile apps, and AI automation solutions for growing businesses. Fixed-price engagements. Senior engineers. Delivery in weeks.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "CiroStack — Software Development Agency" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@CiroStack",
    creator: "@CiroStack",
    title: "CiroStack — Custom Software, Apps & AI for Growing Businesses",
    description:
      "CiroStack builds custom websites, mobile apps, and AI automation solutions for growing businesses. Fixed-price. Senior engineers. Delivery in weeks.",
    images: [OG_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.png",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PXTP0DF4VH" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-PXTP0DF4VH');`,
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <Providers>
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppPopup />
          </div>
        </Providers>
      </body>
    </html>
  );
}
