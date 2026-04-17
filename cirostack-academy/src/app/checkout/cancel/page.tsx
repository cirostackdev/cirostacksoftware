'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';

function CancelContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-[#EF4444]/10 flex items-center justify-center mx-auto mb-6">
        <XCircle className="h-10 w-10 text-[#EF4444]" />
      </div>

      <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-3">
        Payment cancelled
      </h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Your payment was not completed. No charge was made. You can try again whenever you&apos;re ready.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {courseId ? (
          <Button
            rightIcon={<RotateCcw className="h-4 w-4" />}
            asChild
          >
            <Link href={`/checkout/course?courseId=${courseId}`}>Try again</Link>
          </Button>
        ) : null}
        <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} asChild>
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <Suspense fallback={<div className="py-20" />}>
        <CancelContent />
      </Suspense>
    </div>
  );
}
