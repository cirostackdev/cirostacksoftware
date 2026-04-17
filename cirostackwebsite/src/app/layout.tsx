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
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WhatsAppPopup } from "@/components/WhatsAppPopup";

export const metadata: Metadata = {
  title: "CiroStack",
  description:
    "CiroStack is a software development agency that builds websites, web & mobile applications, and AI automation solutions for growing businesses.",
  metadataBase: new URL("https://cirostack.lovable.app"),
  verification: {
    google: "fTAqT8iLRxD944c1bCW9uZjxKCV7jV4bwR754Praqz8",
  },
  openGraph: {
    type: "website",
    title: "CiroStack",
    description:
      "CiroStack is a software development agency that builds websites, web & mobile applications, and AI automation solutions for growing businesses.",
    images: [
      "https://storage.googleapis.com/gpt-engineer-file-uploads/uPMAMeDeoWVb8ZzHFKEduTinmtG3/social-images/social-1772485006239-Gemini_Generated_Image_mtoc6emtoc6emtoc_(1).webp",
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Lovable",
    title: "CiroStack",
    description:
      "CiroStack is a software development agency that builds websites, web & mobile applications, and AI automation solutions for growing businesses.",
    images: [
      "https://storage.googleapis.com/gpt-engineer-file-uploads/uPMAMeDeoWVb8ZzHFKEduTinmtG3/social-images/social-1772485006239-Gemini_Generated_Image_mtoc6emtoc6emtoc_(1).webp",
    ],
  },
  icons: {
    icon: "/favicon.ico",
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
      <body>
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
