import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — CiroStack Academy',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-10">Last updated: April 2026</p>

        <div className="prose prose-sm max-w-none text-[var(--color-text-muted)] space-y-8">
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed">
              We collect information you provide directly (name, email, payment details) and information generated
              by your use of the Platform (lesson progress, quiz scores, AI tutor conversations, XP activity).
              We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Deliver course content and track your learning progress</li>
              <li>Process payments and issue certificates</li>
              <li>Send transactional emails (verification, receipts, password resets)</li>
              <li>Personalise course recommendations based on your onboarding preferences</li>
              <li>Power the AI Tutor and prompt lab features</li>
              <li>Improve the Platform through aggregated, anonymised analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">3. Data Sharing</h2>
            <p className="leading-relaxed">
              We share your data only with trusted third-party processors necessary to operate the Platform:
              Paystack and Stripe (payments), Mux (video delivery), AWS S3 (file storage), Resend (email),
              and Anthropic (AI features). Each processor is bound by data processing agreements.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">4. Cookies &amp; Local Storage</h2>
            <p className="leading-relaxed">
              We use an HttpOnly cookie for authentication refresh tokens and localStorage for your session token.
              No third-party advertising trackers are used.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">5. Your Rights</h2>
            <p className="leading-relaxed">
              You have the right to access, correct, or delete your personal data. You may request account deletion
              at any time from your account settings or by emailing us. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">6. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your data for as long as your account is active or as required by law. Anonymised
              analytics data may be retained indefinitely.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">7. Security</h2>
            <p className="leading-relaxed">
              We use industry-standard measures including TLS encryption in transit, bcrypt password hashing,
              and JWT-based authentication. No system is completely secure — if you believe your account has been
              compromised, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">8. Contact</h2>
            <p className="leading-relaxed">
              Privacy questions or requests:{' '}
              <a href="mailto:privacy@cirostack.com" className="text-[#E53935] hover:underline">privacy@cirostack.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
          <Link href="/legal/terms" className="text-sm text-[#E53935] hover:underline">
            Terms of Service →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
