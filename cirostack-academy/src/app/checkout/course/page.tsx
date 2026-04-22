'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle, Tag, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from '@/lib/store/useToastStore';
import { apiPost, apiGet } from '@/lib/api/client';
import { formatPrice } from '@/lib/utils';
import type { CheckoutResponse } from '@/types';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId') || '';
  const courseSlug = searchParams.get('slug') || '';
  const { user } = useAuthStore();
  const currency = user?.currency ?? 'NGN';

  const [promoCode, setPromoCode] = useState('');
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [course, setCourse] = useState<{ id: string; title: string; priceNgn: number; priceUsd: number; thumbnailUrl: string; slug: string } | null>(null);

  useEffect(() => {
    if (courseSlug) {
      apiGet<{ id: string; title: string; priceNgn: number; priceUsd: number; thumbnailUrl: string; slug: string }>(`/courses/slug/${courseSlug}`)
        .then(setCourse)
        .catch(() => {});
    } else if (courseId) {
      // Fallback: fetch catalog and find by ID
      apiGet<{ id: string; title: string; priceNgn: number; priceUsd: number; thumbnailUrl: string; slug: string }[]>('/courses?limit=100')
        .then((list) => setCourse(list.find((c) => c.id === courseId) ?? null))
        .catch(() => {});
    }
  }, [courseId, courseSlug]);

  const basePrice = currency === 'NGN' ? (course?.priceNgn ?? 0) : (course?.priceUsd ?? 0);
  const discountAmount = Math.floor(basePrice * (discount / 100));
  const total = basePrice - discountAmount;

  const applyPromo = async () => {
    if (!promoCode) return;
    setIsPromoLoading(true);
    try {
      const res = await apiPost<{ discount: number }>('/payments/validate-promo', { code: promoCode, courseId: course?.id ?? courseId });
      setDiscount(res.discount);
      toast.success(`Promo applied — ${res.discount}% off!`);
    } catch {
      toast.error('Invalid promo code.');
    } finally {
      setIsPromoLoading(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const res = await apiPost<CheckoutResponse>('/payments/checkout/course', {
        courseId: course?.id ?? courseId,
        promoCode: promoCode || undefined,
      });
      window.location.href = res.paymentUrl;
    } catch {
      toast.error('Checkout failed. Please retry.');
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href={course?.slug ? `/courses/${course.slug}` : '/courses'} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>

      <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-8">
        Complete your purchase
      </h1>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Form */}
        <div className="md:col-span-3 space-y-6">
          {/* Promo code */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-2">
              Promo code
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code (e.g. LAUNCH50)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                leftIcon={<Tag className="h-4 w-4" />}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={applyPromo}
                isLoading={isPromoLoading}
              >
                Apply
              </Button>
            </div>
            {discount > 0 && (
              <p className="text-xs text-[#10B981] mt-1.5 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                {discount}% discount applied
              </p>
            )}
          </div>

          {/* Payment method */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-2">
              Payment method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border-2 border-[#E53935] bg-[#E53935]/5 text-center cursor-pointer">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {currency === 'NGN' ? '🇳🇬 Paystack' : '💳 Stripe'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {currency === 'NGN' ? 'Cards, transfers, USSD' : 'Cards & bank transfers'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--color-text-muted)]">
              Secure payment via {currency === 'NGN' ? 'Paystack' : 'Stripe'}. 7-day money-back guarantee if you&apos;ve watched less than 20% of the course.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="md:col-span-2">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sticky top-24">
            <h2 className="font-display font-semibold text-[var(--color-text)] mb-4">Order summary</h2>

            <div className="flex gap-3 mb-5 pb-5 border-b border-[var(--color-border)]">
              <div className="h-16 w-16 rounded-lg bg-[var(--color-surface-2)] shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2">{course?.title ?? 'Loading...'}</p>
                <Badge variant="blue" className="text-[10px] mt-1">Lifetime access</Badge>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Course price</span>
                <span>{formatPrice(basePrice, currency)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Promo discount ({discount}%)</span>
                  <span>-{formatPrice(discountAmount, currency)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between font-display font-bold text-[var(--color-text)] text-lg mb-5 pt-4 border-t border-[var(--color-border)]">
              <span>Total</span>
              <span>{formatPrice(total, currency)}</span>
            </div>

            <Button
              fullWidth
              size="lg"
              isLoading={isCheckoutLoading}
              onClick={handleCheckout}
            >
              Pay {formatPrice(total, currency)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseCheckoutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" /></div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
