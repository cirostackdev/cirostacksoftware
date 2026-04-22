'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Download, AlertTriangle, XCircle } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from '@/lib/store/useToastStore';
import { apiGet, apiPost } from '@/lib/api/client';
import type { Subscription, Payment } from '@/types';

const cancelReasons = [
  "I'm too busy right now",
  "The courses don't cover what I need",
  'Too expensive',
  'I prefer individual course purchases',
  'Technical issues',
  'Other',
];

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [isPauseMode, setIsPauseMode] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<Subscription | null>('/subscriptions/me'),
      apiGet<Payment[]>('/payments/invoices'),
    ]).then(([sub, inv]) => {
      setSubscription(sub);
      setInvoices(inv ?? []);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const confirmCancel = async () => {
    try {
      await apiPost('/subscriptions/me/cancel');
      setSubscription((prev) => prev ? { ...prev, cancelAtPeriodEnd: true } : prev);
      setIsCancelOpen(false);
      setCancelStep(1);
      toast.success('Subscription will cancel at end of billing period.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel subscription');
    }
  };

  const confirmPause = async () => {
    try {
      await apiPost('/subscriptions/me/pause');
      setSubscription((prev) => prev ? { ...prev, status: 'paused' } : prev);
      setIsCancelOpen(false);
      toast.success('Subscription paused for 1 month.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to pause subscription');
    }
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </DashboardShell>
    );
  }

  const endDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <DashboardShell>
      <div className="max-w-2xl space-y-8">
        {/* Current subscription */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-5">
            Current subscription
          </h2>

          {!subscription ? (
            <div>
              <p className="text-[var(--color-text-muted)] text-sm mb-4">You don&apos;t have an active subscription.</p>
              <Button size="sm" asChild><a href="/pricing">View plans</a></Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-display font-bold text-[var(--color-text)] capitalize">
                    {subscription.plan} plan — All access
                  </p>
                </div>
                <Badge variant={subscription.status === 'active' ? 'success' : 'warning'} className="capitalize">
                  {subscription.cancelAtPeriodEnd ? 'Cancelling' : subscription.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
                <Calendar className="h-4 w-4" />
                {subscription.cancelAtPeriodEnd ? `Access ends on ${endDate}` : `Renews on ${endDate}`}
              </div>

              {subscription.cancelAtPeriodEnd ? (
                <div className="flex items-start gap-3 p-3 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">Cancellation scheduled</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Your access continues until {endDate}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => { setIsCancelOpen(true); setIsPauseMode(false); }}>
                    Cancel subscription
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setIsCancelOpen(true); setIsPauseMode(true); }}>
                    Pause billing
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Payment method */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-[var(--color-text)] mb-4">Payment method</h2>
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[var(--color-text-muted)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Managed via payment provider</p>
              <p className="text-xs text-[var(--color-text-muted)]">Paystack or Stripe</p>
            </div>
          </div>
        </section>

        {/* Invoice history */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-[var(--color-text)] mb-4">Invoice history</h2>
          {invoices.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-text)]">
                      {new Date(inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {inv.currency === 'NGN' ? `₦${(inv.amount / 100).toLocaleString()}` : `$${(inv.amount / 100).toLocaleString()}`}
                  </span>
                  <Badge variant={inv.status === 'success' ? 'success' : 'warning'} className="text-[10px]">{inv.status}</Badge>
                  {inv.invoiceUrl && (
                    <a href={inv.invoiceUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5" /></Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cancel / pause modal */}
        <Modal isOpen={isCancelOpen} onClose={() => { setIsCancelOpen(false); setCancelStep(1); }} title={isPauseMode ? 'Pause billing' : 'Cancel subscription'}>
          {cancelStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                {isPauseMode
                  ? 'Pausing stops your next payment. You keep access until your current period ends.'
                  : "We'd love to keep you. What's the reason for cancelling?"}
              </p>
              {!isPauseMode && (
                <div className="space-y-2">
                  {cancelReasons.map((r) => (
                    <label key={r} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-2)] cursor-pointer transition-colors">
                      <input type="radio" name="reason" value={r} onChange={() => setCancelReason(r)} className="h-4 w-4 text-[#E53935]" />
                      <span className="text-sm text-[var(--color-text-muted)]">{r}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsCancelOpen(false)}>Keep subscription</Button>
                <Button variant="destructive" onClick={() => isPauseMode ? confirmPause() : setCancelStep(2)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {cancelStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                If you cancel, you keep access until <strong className="text-[var(--color-text)]">{endDate}</strong>.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCancelStep(1)}>Go back</Button>
                <Button variant="destructive" leftIcon={<XCircle className="h-4 w-4" />} onClick={confirmCancel}>
                  Confirm cancellation
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardShell>
  );
}
