'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, TrendingUp, Star, ArrowRight, PlusCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { apiGet } from '@/lib/api/client';
import type { Course } from '@/types';

export default function InstructorHomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<Course[]>('/courses/instructor/courses')
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  }, []);

  const totalStudents = courses.reduce((sum, c) => sum + c.enrolmentCount, 0);
  const activeCourses = courses.filter((c) => c.isPublished).length;
  const avgRating = courses.length
    ? (courses.reduce((sum, c) => sum + c.ratingAverage, 0) / courses.length).toFixed(1)
    : '—';

  const statsCards = [
    { label: 'Total students', value: totalStudents.toLocaleString(), icon: Users, color: 'text-[#E82121] bg-[#E82121]/10' },
    { label: 'Active courses', value: String(activeCourses), icon: BookOpen, color: 'text-[#7C3AED] bg-[#7C3AED]/10' },
    { label: 'Average rating', value: avgRating, icon: Star, color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
    { label: 'Total courses', value: String(courses.length), icon: TrendingUp, color: 'text-[#10B981] bg-[#10B981]/10' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Instructor Overview</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Your courses and earnings at a glance.</p>
        </div>
        <Button leftIcon={<PlusCircle className="h-4 w-4" />} asChild>
          <Link href="/instructor/courses/new">New course</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <div key={s.label} className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="font-display text-2xl font-bold text-[var(--color-text)]">{isLoading ? '—' : s.value}</p>
            <p className="text-xs font-medium text-[var(--color-text-muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Course list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">My courses</h2>
          <Link href="/instructor/courses" className="text-sm text-[#E82121] hover:underline flex items-center gap-1">
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <p className="text-[var(--color-text-muted)] text-sm">No courses yet. Create your first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/instructor/courses/${c.id}`}>
                <div className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-[#E82121]/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-[var(--color-text)] truncate">{c.title}</p>
                      <Badge variant={c.isPublished ? 'success' : 'warning'} className="text-[10px] shrink-0">
                        {c.isPublished ? 'published' : 'draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.enrolmentCount.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />{c.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
