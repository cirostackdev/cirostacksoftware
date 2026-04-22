'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-[#10B981]" />
      </div>

      <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-3">
        You&apos;re enrolled! 🎉
      </h1>
      <p className="text-[var(--color-text-muted)] mb-2">
        Your payment was successful. Your course access is live.
      </p>
      {ref && (
        <p className="text-xs text-[var(--color-text-subtle)] mb-8 font-mono">
          Reference: {ref}
        </p>
      )}

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-8 text-left space-y-4">
        <h2 className="font-display font-semibold text-[var(--color-text)]">What&apos;s next</h2>
        {[
          { step: '1', text: 'Go to your dashboard and start the first lesson.' },
          { step: '2', text: 'Join the WhatsApp study group for this course to connect with other learners.' },
          { step: '3', text: 'Set a daily learning goal. Even 20 minutes a day adds up.' },
        ].map((s) => (
          <div key={s.step} className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-[#E53935] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {s.step}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button rightIcon={<ArrowRight className="h-4 w-4" />} asChild>
          <Link href="/dashboard/learning">Start learning</Link>
        </Button>
        <Button variant="outline" leftIcon={<MessageCircle className="h-4 w-4" />} asChild>
          <a href="https://chat.whatsapp.com/launchpad" target="_blank" rel="noopener noreferrer">
            Join WhatsApp group
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <Suspense fallback={<div className="py-20" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
