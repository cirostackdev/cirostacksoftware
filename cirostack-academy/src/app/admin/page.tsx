'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, BookOpen, CreditCard, AlertTriangle } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import { apiGet } from '@/lib/api/client';

interface AdminAnalytics {
  totalStudents: number;
  newSignupsLast30Days: number;
  activeSubscriptions: number;
  mrr: number;
  churnRate: number;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<AdminAnalytics>('/admin/analytics')
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const stats = data
    ? [
        {
          label: 'Monthly Recurring Revenue',
          value: `₦${(data.mrr / 100).toLocaleString()}`,
          sub: '',
          icon: TrendingUp,
          color: 'text-[#10B981] bg-[#10B981]/10',
        },
        {
          label: 'Total students',
          value: data.totalStudents.toLocaleString(),
          sub: `+${data.newSignupsLast30Days} last 30 days`,
          icon: Users,
          color: 'text-[#E53935] bg-[#E53935]/10',
        },
        {
          label: 'Active subscriptions',
          value: data.activeSubscriptions.toLocaleString(),
          sub: '',
          icon: CreditCard,
          color: 'text-[#7C3AED] bg-[#7C3AED]/10',
        },
        {
          label: 'Churn rate',
          value: `${(data.churnRate * 100).toFixed(1)}%`,
          sub: 'last 30 days',
          icon: BookOpen,
          color: 'text-[#F59E0B] bg-[#F59E0B]/10',
        },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          : stats.map((s) => (
              <div
                key={s.label}
                className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}
                >
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="font-display text-2xl font-bold text-[var(--color-text)]">
                  {s.value}
                </p>
                <p className="text-xs font-medium text-[var(--color-text-muted)] mt-0.5">
                  {s.label}
                </p>
                {s.sub && (
                  <p className="text-[10px] text-[#10B981] mt-1">{s.sub}</p>
                )}
              </div>
            ))}
      </div>

      {data && data.churnRate > 0.03 && (
        <div className="flex items-start gap-3 p-4 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Churn rate: {(data.churnRate * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Review recent cancellation reasons and consider offering a pause option.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
