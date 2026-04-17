'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Star } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LevelBadge from '@/components/ui/LevelBadge';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from '@/lib/store/useToastStore';
import { apiGet, apiPatch } from '@/lib/api/client';
import { CATEGORY_LABELS } from '@/config/nav';
import { formatPrice } from '@/lib/utils';
import type { Course } from '@/types';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiGet<Course[]>('/admin/courses')
      .then(setCourses)
      .catch(() => toast.error('Failed to load courses.'))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      const updated = await apiPatch<Course>(`/admin/courses/${id}/feature`, { isFeatured: !current });
      setCourses((prev) => prev.map((c) => c.id === id ? updated : c));
      toast.success('Featured status updated.');
    } catch {
      toast.error('Failed to update course.');
    }
  };

  const togglePublish = async (id: string, current: boolean) => {
    try {
      const updated = await apiPatch<Course>(`/admin/courses/${id}/feature`, { isPublished: !current });
      setCourses((prev) => prev.map((c) => c.id === id ? updated : c));
      toast.success(current ? 'Course unpublished.' : 'Course published!');
    } catch {
      toast.error('Failed to update course.');
    }
  };

  return (
    <div className="max-w-5xl space-y-4">
      <p className="text-sm text-[var(--color-text-muted)]">
        {isLoading ? '—' : `${courses.length} courses · ${courses.filter((c) => c.isPublished).length} published`}
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Course</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">Students</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden xl:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <LevelBadge level={c.level} />
                        <span className="text-[10px] text-[var(--color-text-muted)]">{CATEGORY_LABELS[c.category]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[var(--color-text-muted)]">{c.enrolmentCount.toLocaleString()}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                      <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                      {c.ratingAverage}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-[var(--color-text-muted)]">
                    {formatPrice(c.priceNgn, 'NGN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={c.isPublished ? 'success' : 'warning'} className="text-[10px]">
                        {c.isPublished ? 'Live' : 'Draft'}
                      </Badge>
                      {c.isFeatured && <Badge variant="gold" className="text-[10px]">Featured</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleFeatured(c.id, c.isFeatured)}>
                        <Star className={`h-3.5 w-3.5 ${c.isFeatured ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[var(--color-text-muted)]'}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => togglePublish(c.id, c.isPublished)}>
                        {c.isPublished ? <EyeOff className="h-3.5 w-3.5 text-[var(--color-text-muted)]" /> : <Eye className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
