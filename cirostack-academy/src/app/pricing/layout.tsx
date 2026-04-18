import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Affordable course pricing and subscription plans for CiroStack Academy. Buy individual courses or subscribe for full access — pay in NGN or USD.',
  alternates: { canonical: 'https://academy.cirostack.com/pricing' },
  openGraph: {
    url: 'https://academy.cirostack.com/pricing',
    title: 'Pricing | CiroStack Academy',
    description:
      'Affordable course pricing and subscription plans. Buy individual courses or subscribe for full access — pay in NGN or USD.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
