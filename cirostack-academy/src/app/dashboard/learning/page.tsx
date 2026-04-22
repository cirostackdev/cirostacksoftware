'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import Button from '@/components/ui/Button';
import CourseProgressCard from '@/components/dashboard/CourseProgressCard';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/api/client';
import type { Enrollment } from '@/types';

type Filter = 'all' | 'in_progress' | 'completed' | 'not_started';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'not_started', label: 'Not started' },
];

export default function MyLearningPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<Enrollment[]>('/enrollments')
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = enrollments.filter((e) => {
    if (filter === 'in_progress') return !e.completedAt && e.progressPercent > 0;
    if (filter === 'completed') return !!e.completedAt;
    if (filter === 'not_started') return e.progressPercent === 0;
    return true;
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-[#E53935]/10 text-[#E53935]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
          <BookOpen className="h-10 w-10 text-[var(--color-border-2)] mx-auto mb-4" />
          <h3 className="font-display font-semibold text-[var(--color-text)] mb-2">No courses here yet</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            {filter === 'all' ? "You haven't enrolled in any courses yet." : `No ${filter.replace('_', ' ')} courses.`}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => <CourseProgressCard key={e.id} enrollment={e} />)}
        </div>
      )}
    </div>
  );
}
