'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, ShieldCheck, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from '@/lib/store/useToastStore';
import { apiPost } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import type { CheckoutResponse } from '@/types';

const features = [
  'All courses — unlimited access',
  'All certificates of completion',
  'AI Tutor (Cipher) priority access',
  'Prompt Lab & AI vs Manual labs',
  'Ship It capstone review',
  'CiroStack talent pipeline eligibility',
  'Early access to new courses',
];

function SubscriptionForm() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [plan, setPlan] = useState<'monthly' | 'annual'>(
    (searchParams.get('plan') as 'monthly' | 'annual') || 'annual'
  );
  const currency = (searchParams.get('currency') || user?.currency || 'NGN') as 'NGN' | 'USD';
  const [isLoading, setIsLoading] = useState(false);

  const prices = {
    NGN: { monthly: '₦9,500/mo', annual: '₦79,000/yr', annualMonthly: '₦6,583/mo' },
    USD: { monthly: '$9/mo', annual: '$75/yr', annualMonthly: '$6.25/mo' },
  };
  const p = prices[currency];

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await apiPost<CheckoutResponse>('/subscriptions', { plan, currency });
      window.location.href = res.paymentUrl;
    } catch {
      toast.error('Checkout failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <Link href="/pricing" className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to pricing
      </Link>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8">
        <Badge variant="blue" className="mb-4">All-access subscription</Badge>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">
          Choose your billing cycle
        </h1>

        {/* Plan toggle */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {(['monthly', 'annual'] as const).map((pl) => (
            <button
              key={pl}
              onClick={() => setPlan(pl)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                plan === pl ? 'border-[#E53935] bg-[#E53935]/5' : 'border-[var(--color-border)] hover:border-[var(--color-border-2)]'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--color-text)] capitalize">{pl}</span>
                {pl === 'annual' && <Badge variant="success" className="text-[10px]">Save 30%</Badge>}
              </div>
              <p className="font-display font-bold text-[#E53935]">
                {pl === 'annual' ? p.annualMonthly : p.monthly}
              </p>
              {pl === 'annual' && (
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                  Billed as {p.annual}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-8">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--color-text-muted)]">
              <Check className="h-4 w-4 text-[#10B981] shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-6">
          <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-text-muted)]">
            Cancel anytime. If you cancel, you keep access until the end of your billing period.
          </p>
        </div>

        <Button fullWidth size="lg" isLoading={isLoading} onClick={handleCheckout}>
          Start {plan} subscription · {plan === 'annual' ? p.annual : p.monthly}
        </Button>
      </div>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" /></div>}>
        <SubscriptionForm />
      </Suspense>
    </div>
  );
}
