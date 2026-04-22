'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingDown, Users, CheckCircle, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { apiGet } from '@/lib/api/client';
import { toast } from '@/lib/store/useToastStore';

interface AnalyticsData {
  enrollmentCount: number;
  completionRate: number;
  dropoff: { lessonId: string; lessonTitle: string; studentsReached: number; reachPercent: number }[];
  quizStats: { lessonId: string; lessonTitle: string; passRate: number }[];
  aiTutorVolume: { lessonId: string; conversationCount: number }[];
  promptLabStats: { lessonId: string; attemptCount: number }[];
}

export default function CourseAnalyticsPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    setIsLoading(true);
    apiGet<AnalyticsData>(`/admin/instructor/analytics/${courseId}`)
      .then(setData)
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setIsLoading(false));
  }, [courseId]);

  const totalCipherQueries = data?.aiTutorVolume.reduce((s, v) => s + v.conversationCount, 0) ?? 0;
  const avgPassRate = data?.quizStats.length
    ? Math.round((data.quizStats.reduce((s, q) => s + q.passRate, 0) / data.quizStats.length) * 100)
    : 0;

  const maxDropoff = data?.dropoff[0]?.studentsReached ?? 1;

  return (
    <div className="max-w-4xl space-y-8">
      <Link href="/instructor/courses">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>Courses</Button>
      </Link>

      <h1 className="font-display text-xl font-bold text-[var(--color-text)]">
        Course Analytics
      </h1>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : data ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total students', value: data.enrollmentCount.toLocaleString(), icon: Users },
              { label: 'Completion rate', value: `${Math.round(data.completionRate * 100)}%`, icon: CheckCircle },
              { label: 'Quiz pass rate', value: data.quizStats.length ? `${avgPassRate}%` : '—', icon: TrendingDown },
              { label: 'Cipher queries', value: totalCipherQueries.toLocaleString(), icon: MessageSquare },
            ].map((s) => (
              <div key={s.label} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                <p className="font-display text-2xl font-bold text-[var(--color-text)]">{s.value}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Drop-off funnel */}
          {data.dropoff.length > 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <h2 className="font-display text-base font-semibold text-[var(--color-text)] mb-5">Lesson completion funnel</h2>
              <div className="space-y-3">
                {data.dropoff.map((item, idx) => {
                  const prev = idx > 0 ? data.dropoff[idx - 1].reachPercent : 100;
                  const dropPct = idx > 0 ? Math.round(prev - item.reachPercent) : 0;
                  return (
                    <div key={item.lessonId}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[var(--color-text-muted)] truncate flex-1 mr-4">{item.lessonTitle}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[var(--color-text)] font-medium">{item.studentsReached.toLocaleString()}</span>
                          {dropPct > 0 && (
                            <span className={`text-xs ${dropPct > 20 ? 'text-[#EF4444]' : dropPct > 10 ? 'text-[#F59E0B]' : 'text-[var(--color-text-muted)]'}`}>
                              -{dropPct}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--color-border)]">
                        <div
                          className="h-full rounded-full bg-[#E53935] transition-all"
                          style={{ width: `${(item.studentsReached / maxDropoff) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quiz pass rates */}
          {data.quizStats.length > 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <h2 className="font-display text-base font-semibold text-[var(--color-text)] mb-4">Quiz pass rates</h2>
              <div className="space-y-2">
                {data.quizStats.map((q) => (
                  <div key={q.lessonId} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-muted)] flex-1 truncate">{q.lessonTitle}</span>
                    <div className="w-40 h-5 bg-[var(--color-border)] rounded-md overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-md transition-all"
                        style={{ width: `${Math.round(q.passRate * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] w-10 text-right">{Math.round(q.passRate * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-[var(--color-text-muted)] text-sm">No analytics data available.</p>
      )}
    </div>
  );
}
