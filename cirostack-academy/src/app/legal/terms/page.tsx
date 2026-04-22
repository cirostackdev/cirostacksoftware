import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service — CiroStack Academy',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-10">Last updated: April 2026</p>

        <div className="prose prose-sm max-w-none text-[var(--color-text-muted)] space-y-8">
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing or using CiroStack Academy (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service.
              If you do not agree, do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">2. Account Registration</h2>
            <p className="leading-relaxed">
              You must be at least 16 years old to create an account. You are responsible for maintaining the
              confidentiality of your account credentials and for all activity under your account. You agree to
              provide accurate, complete information and keep it up to date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">3. Course Access &amp; Intellectual Property</h2>
            <p className="leading-relaxed">
              Upon purchasing or enrolling in a course, you are granted a personal, non-transferable, non-exclusive
              licence to access and view the course content for your own educational purposes. You may not
              redistribute, reproduce, share access credentials, or resell any course content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">4. Payments &amp; Refunds</h2>
            <p className="leading-relaxed">
              All purchases are processed securely via Paystack (NGN) or Stripe (USD). We offer a 7-day money-back
              guarantee on individual course purchases. Subscription fees are non-refundable once a billing cycle
              has commenced. Contact support within the refund window to request a refund.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">5. Acceptable Use</h2>
            <p className="leading-relaxed">
              You agree not to use the Platform to: upload malicious code, harass other users, circumvent security
              measures, scrape content at scale, or engage in any unlawful activity. CiroStack Academy reserves
              the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">6. Disclaimers</h2>
            <p className="leading-relaxed">
              Course content is provided for educational purposes only. CiroStack Academy does not guarantee
              employment outcomes. The Platform is provided &ldquo;as is&rdquo; without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">7. Changes to Terms</h2>
            <p className="leading-relaxed">
              We may update these Terms at any time. Continued use of the Platform after changes constitutes
              acceptance of the new Terms. We will notify users of material changes via email.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">8. Contact</h2>
            <p className="leading-relaxed">
              Questions about these Terms? Email us at{' '}
              <a href="mailto:legal@cirostack.com" className="text-[#E53935] hover:underline">legal@cirostack.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
          <Link href="/legal/privacy" className="text-sm text-[#E53935] hover:underline">
            Privacy Policy →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
