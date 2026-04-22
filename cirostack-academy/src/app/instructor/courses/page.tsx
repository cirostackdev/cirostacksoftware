'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit2, BarChart3, Eye, EyeOff, BookOpen } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LevelBadge from '@/components/ui/LevelBadge';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from '@/lib/store/useToastStore';
import { apiGet, apiPatch } from '@/lib/api/client';
import { CATEGORY_LABELS } from '@/config/nav';
import type { Course } from '@/types';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<Course[]>('/courses/instructor/courses')
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  }, []);

  const togglePublish = async (id: string) => {
    try {
      const updated = await apiPatch<Course>(`/courses/instructor/courses/${id}/publish`);
      setCourses((prev) => prev.map((c) => c.id === id ? updated : c));
      toast.success(updated.isPublished ? 'Course published!' : 'Course unpublished.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update course');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[var(--color-text-muted)]">{courses.length} courses total</p>
        <Button leftIcon={<PlusCircle className="h-4 w-4" />} asChild>
          <Link href="/instructor/courses/new">New course</Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
          <BookOpen className="h-10 w-10 text-[var(--color-border-2)] mx-auto mb-4" />
          <h3 className="font-display font-semibold text-[var(--color-text)] mb-2">No courses yet</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">Create your first course to start teaching.</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/instructor/courses/new">Create course</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-[#E53935]/20 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <p className="font-display font-semibold text-[var(--color-text)] truncate">{c.title}</p>
                  <Badge variant={c.isPublished ? 'success' : 'warning'} className="text-[10px] shrink-0">
                    {c.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                  <LevelBadge level={c.level} />
                  <span>{CATEGORY_LABELS[c.category]}</span>
                  <span>{c.totalLessons} lessons</span>
                  <span>{c.enrolmentCount.toLocaleString()} students</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/instructor/courses/${c.id}`}>
                  <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />}>Edit</Button>
                </Link>
                <Link href={`/instructor/analytics/${c.id}`}>
                  <Button variant="ghost" size="sm" leftIcon={<BarChart3 className="h-3.5 w-3.5" />}>Stats</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePublish(c.id)}
                  leftIcon={c.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                >
                  {c.isPublished ? 'Unpublish' : 'Publish'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
