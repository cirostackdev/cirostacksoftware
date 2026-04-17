'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import type { Enrollment } from '@/types';
import { cn } from '@/lib/utils';
import LevelBadge from '@/components/ui/LevelBadge';

interface Props {
  enrollment: Enrollment;
  className?: string;
}

export default function CourseProgressCard({ enrollment, className }: Props) {
  const course = enrollment.course;
  if (!course) return null;

  const pct = enrollment.progressPercent;
  const isCompleted = !!enrollment.completedAt;

  return (
    <Link
      href={`/learn/${course.slug}`}
      className={cn(
        'group flex gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl',
        'hover:border-[#E82121]/40 transition-all duration-200',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-28 rounded-lg overflow-hidden shrink-0 bg-[var(--color-surface-2)]">
        {course.thumbnailUrl && (
          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <PlayCircle className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LevelBadge level={course.level} />
            {isCompleted && (
              <span className="text-xs text-[#10B981] font-medium">Completed</span>
            )}
          </div>
          <h3 className="font-display font-semibold text-[var(--color-text)] text-sm line-clamp-1 group-hover:text-[#E82121] transition-colors">
            {course.title}
          </h3>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--color-text-muted)]">
              {isCompleted ? 'Completed' : `${pct}% complete`}
            </span>
            <span className="font-medium text-[var(--color-text)]">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-border)]">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isCompleted ? 'bg-[#10B981]' : 'bg-[#E82121]'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
