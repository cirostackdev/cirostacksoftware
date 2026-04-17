import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ExternalLink, Download, Award } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Verify Certificate — CiroStack Academy' };

export default async function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  // Mock — in production, verify via API
  const cert = {
    isValid: true,
    studentName: 'Tunde Okafor',
    courseTitle: 'React Architecture Patterns',
    issuedAt: '2024-03-01',
    verificationCode: code,
    level: 'Intermediate',
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-[#10B981]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-2">
            Certificate verified ✓
          </h1>
          <p className="text-[var(--color-text-muted)]">
            This is a genuine CiroStack Academy certificate.
          </p>
        </div>

        {/* Certificate preview */}
        <div className="bg-gradient-to-br from-[#E82121]/5 via-[var(--color-surface)] to-[#7C3AED]/5 border-2 border-[#E82121]/20 rounded-2xl p-10 text-center mb-8">
          <div className="h-14 w-14 rounded-full bg-[#E82121]/10 flex items-center justify-center mx-auto mb-5">
            <Award className="h-7 w-7 text-[#E82121]" />
          </div>
          <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
            Certificate of Completion
          </p>
          <p className="font-display text-2xl font-bold text-[var(--color-text)] mb-1">
            {cert.studentName}
          </p>
          <p className="text-[var(--color-text-muted)] mb-3">has successfully completed</p>
          <p className="font-display text-xl font-semibold text-[#E82121] mb-2">
            {cert.courseTitle}
          </p>
          <Badge variant="blue" className="mb-4">{cert.level}</Badge>
          <p className="text-sm text-[var(--color-text-muted)]">
            Issued on {new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="font-mono text-xs text-[var(--color-text-subtle)] mt-3">
            ID: {cert.verificationCode}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Download PDF
          </Button>
          <Button asChild>
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
