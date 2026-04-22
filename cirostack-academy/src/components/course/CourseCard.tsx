'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, Users, Lock, Heart } from 'lucide-react';
import type { Course } from '@/types';
import { cn } from '@/lib/utils';
import { formatDuration, formatPrice, getCategoryColor } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/useAuthStore';
import LevelBadge from '@/components/ui/LevelBadge';
import Badge from '@/components/ui/Badge';
import { CATEGORY_LABELS } from '@/config/nav';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  progressPercent?: number;
  className?: string;
}

export default function CourseCard({
  course,
  isEnrolled = false,
  progressPercent,
  className,
}: CourseCardProps) {
  const { user } = useAuthStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const currency = user?.currency ?? 'NGN';
  const price = currency === 'NGN' ? course.priceNgn : course.priceUsd;
  const isFree = price === 0;
  const categoryColor = getCategoryColor(course.category);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden',
        'hover:border-[#E53935]/40 hover:shadow-lg transition-all duration-200',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--color-surface-2)] overflow-hidden">
        <Link
          href={isEnrolled ? `/learn/${course.slug}` : `/courses/${course.slug}`}
          className="absolute inset-0"
          tabIndex={-1}
          aria-hidden="true"
        />
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 gradient-brand opacity-20" />
        )}

        <div className="absolute top-3 left-3 flex gap-1.5">
          <LevelBadge level={course.level} />
          {course.isFeatured && <Badge variant="gold">Featured</Badge>}
          {isFree && <Badge variant="success">Free</Badge>}
        </div>

        {/* Bookmark button */}
        <button
          onClick={toggleBookmark}
          className={cn(
            'absolute top-3 right-3 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-150',
            'bg-black/30 backdrop-blur-sm hover:bg-black/50',
            isBookmarked && 'bg-[#E53935]/80 hover:bg-[#E53935]'
          )}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark course'}
        >
          <Heart
            className={cn(
              'h-3.5 w-3.5 transition-all',
              isBookmarked ? 'fill-white text-white' : 'text-white'
            )}
          />
        </button>

        {isEnrolled && typeof progressPercent === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-[#E53935] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <Link
        href={isEnrolled ? `/learn/${course.slug}` : `/courses/${course.slug}`}
        className="flex flex-col flex-1 p-4 gap-3"
      >
        <div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1.5"
            style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}
          >
            {CATEGORY_LABELS[course.category] || course.category}
          </span>
          <h3 className="font-display font-semibold text-[var(--color-text)] leading-snug group-hover:text-[#E53935] transition-colors line-clamp-2">
            {course.title}
          </h3>
          {course.instructor && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {course.instructor.fullName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(course.totalDurationSecs)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {course.enrolmentCount.toLocaleString()}
          </span>
          {course.ratingAverage > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
              {course.ratingAverage.toFixed(1)}
            </span>
          )}
        </div>

        {/* Feature pills */}
        {(course.hasPromptLab || course.hasAiVsManual || course.hasCapstone) && (
          <div className="flex flex-wrap gap-1">
            {course.hasPromptLab && (
              <Badge variant="purple" className="text-[10px]">Prompt Lab</Badge>
            )}
            {course.hasAiVsManual && (
              <Badge variant="purple" className="text-[10px]">AI vs Manual</Badge>
            )}
            {course.hasCapstone && (
              <Badge variant="blue" className="text-[10px]">Ship It</Badge>
            )}
          </div>
        )}

        {/* Price / Progress */}
        <div className="mt-auto pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
          {isEnrolled ? (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-text-muted)]">Progress</span>
                <span className="font-medium text-[var(--color-text)]">{progressPercent ?? 0}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[#E53935] transition-all"
                  style={{ width: `${progressPercent ?? 0}%` }}
                />
              </div>
            </div>
          ) : isFree ? (
            <span className="text-sm font-semibold text-[#10B981]">Free</span>
          ) : (
            <span className="text-sm font-semibold text-[var(--color-text)]">
              {formatPrice(price, currency)}
            </span>
          )}

          {!isEnrolled && !isFree && (
            <Lock className="h-3.5 w-3.5 text-[var(--color-text-subtle)]" />
          )}
        </div>
      </Link>
    </div>
  );
}
