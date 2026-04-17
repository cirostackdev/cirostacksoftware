'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Zap, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const faq = [
  { q: 'Can I switch between NGN and USD?', a: 'Your currency is set based on your country when you sign up, but you can change it anytime in account settings.' },
  { q: 'Do course purchases expire?', a: 'No. Once you buy a course you own it forever, including future content updates.' },
  { q: 'What\'s the refund policy?', a: 'Full refund within 7 days if you\'ve watched less than 20% of the course.' },
  { q: 'Can I cancel my subscription?', a: 'Yes, cancel anytime. You keep access until the end of the billing period.' },
  { q: 'Is there a free tier?', a: 'Every course has one or two free preview lessons. No credit card required.' },
  { q: 'Are subscriptions worth it?', a: 'If you plan to take more than one course in a year — yes. One course alone costs more than a month of subscription.' },
];

const planFeatures = [
  'Access to the course you purchase',
  'Lifetime access after purchase',
  'Certificate of completion',
  'AI Tutor (Cipher) access',
  'Code sandbox',
  'Course WhatsApp community',
];

const subFeatures = [
  'All courses — unlimited access',
  'Lifetime access to enrolled courses after cancelling',
  'All certificates',
  'Priority AI Tutor responses',
  'Early access to new courses',
  'Prompt Lab & AI vs Manual labs',
  'Ship It capstone review',
  'CiroStack talent pipeline eligibility',
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');

  const prices = {
    NGN: { monthly: '₦9,500', annual: '₦79,000', annualMonthly: '₦6,583', courseFrom: '₦15,000', courseTo: '₦85,000' },
    USD: { monthly: '$9', annual: '$75', annualMonthly: '$6.25', courseFrom: '$15', courseTo: '$85' },
  };
  const p = prices[currency];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">
            Buy individual courses you want, or get all-access with a subscription.
          </p>
        </div>

        {/* Currency + plan toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <div className="flex items-center rounded-xl border border-[var(--color-border)] p-1 bg-[var(--color-surface)]">
            {(['NGN', 'USD'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                  currency === c
                    ? 'bg-[#E82121] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                )}
              >
                {c === 'NGN' ? '₦ Nigeria' : '$ International'}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-xl border border-[var(--color-border)] p-1 bg-[var(--color-surface)]">
            {(['monthly', 'annual'] as const).map((pl) => (
              <button
                key={pl}
                onClick={() => setPlan(pl)}
                className={cn(
                  'px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                  plan === pl
                    ? 'bg-[#E82121] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                )}
              >
                {pl}
                {pl === 'annual' && <Badge variant="success" className="ml-2 text-[10px]">Save 30%</Badge>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {/* Per course */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-1">Per course</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Own what you want, forever.</p>
            </div>
            <div className="mb-6">
              <span className="font-display text-4xl font-bold text-[var(--color-text)]">{p.courseFrom}</span>
              <span className="text-[var(--color-text-muted)] ml-2">– {p.courseTo}</span>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {planFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" fullWidth asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          </div>

          {/* Subscription */}
          <div className="p-8 rounded-2xl border-2 border-[#E82121] bg-[#E82121]/5 flex flex-col relative">
            <Badge variant="blue" className="absolute top-6 right-6">Most popular</Badge>
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-1">All-access</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Every course, all the time.</p>
            </div>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-[var(--color-text)]">
                {plan === 'annual' ? p.annualMonthly : p.monthly}
              </span>
              <span className="text-[var(--color-text-muted)] ml-2">/month</span>
            </div>
            {plan === 'annual' && (
              <p className="text-xs text-[var(--color-text-muted)] mb-6">
                Billed annually ({p.annual}/year)
              </p>
            )}
            <ul className="space-y-3 flex-1 mb-8 mt-4">
              {subFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                  <Check className="h-4 w-4 text-[#E82121] shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button fullWidth rightIcon={<ArrowRight className="h-4 w-4" />} asChild>
              <Link href={`/checkout/subscription?plan=${plan}&currency=${currency}`}>
                Start all-access
              </Link>
            </Button>
            <p className="text-xs text-center text-[var(--color-text-muted)] mt-3">Cancel anytime</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-[var(--color-text)] text-center mb-8">
            Frequently asked
          </h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group border border-[var(--color-border)] rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors">
                  <span className="font-medium text-sm text-[var(--color-text)]">{item.q}</span>
                  <Zap className="h-4 w-4 text-[var(--color-text-muted)] shrink-0 group-open:text-[#E82121] transition-colors" />
                </summary>
                <div className="px-5 pb-5 pt-2 text-sm text-[var(--color-text-muted)] bg-[var(--color-surface)]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
