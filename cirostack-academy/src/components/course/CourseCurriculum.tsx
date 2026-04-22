'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Play, FileText, Code, HelpCircle, Wand2, Bug, Briefcase, Rocket, Lock } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import type { Section, LessonType } from '@/types';

const lessonIcons: Record<LessonType, React.ElementType> = {
  video: Play,
  written: FileText,
  code: Code,
  quiz: HelpCircle,
  prompt_lab: Wand2,
  ai_debug: Bug,
  client_brief: Briefcase,
  capstone: Rocket,
};

const lessonLabels: Record<LessonType, string> = {
  video: 'Video',
  written: 'Article',
  code: 'Code',
  quiz: 'Quiz',
  prompt_lab: 'Prompt Lab',
  ai_debug: 'AI Debug',
  client_brief: 'Client Brief',
  capstone: 'Capstone',
};

interface Props {
  sections: Section[];
  isEnrolled?: boolean;
  completedLessonIds?: Set<string>;
  onLessonClick?: (lessonId: string) => void;
}

export default function CourseCurriculum({
  sections,
  isEnrolled = false,
  completedLessonIds,
  onLessonClick,
}: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([sections[0]?.id])
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const totalLessons = sections.reduce((a, s) => a + (s.lessons?.length ?? 0), 0);
  const totalDuration = sections.reduce(
    (a, s) => a + (s.lessons?.reduce((b, l) => b + (l.durationSecs ?? 0), 0) ?? 0),
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-[var(--color-text)]">
          Course Curriculum
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {totalLessons} lessons · {formatDuration(totalDuration)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          const sectionDuration = section.lessons?.reduce(
            (a, l) => a + (l.durationSecs ?? 0),
            0
          ) ?? 0;

          return (
            <div
              key={section.id}
              className="border border-[var(--color-border)] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 p-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors text-left"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--color-text)] truncate">
                    {section.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {section.lessons?.length ?? 0} lessons · {formatDuration(sectionDuration)}
                    {section.isFreePreview && (
                      <span className="ml-2 text-[#10B981] font-medium">Free preview</span>
                    )}
                  </p>
                </div>
              </button>

              {isOpen && section.lessons && (
                <div className="divide-y divide-[var(--color-border)]">
                  {section.lessons.map((lesson) => {
                    const Icon = lessonIcons[lesson.type];
                    const isCompleted = completedLessonIds?.has(lesson.id);
                    const isAccessible = isEnrolled || lesson.isFreePreview;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => isAccessible && onLessonClick?.(lesson.id)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                          isAccessible
                            ? 'cursor-pointer hover:bg-[var(--color-surface-2)]'
                            : 'opacity-50 cursor-default'
                        )}
                      >
                        <div
                          className={cn(
                            'h-7 w-7 rounded-lg flex items-center justify-center shrink-0',
                            isCompleted
                              ? 'bg-[#10B981]/10 text-[#10B981]'
                              : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'font-medium truncate',
                              isCompleted
                                ? 'text-[var(--color-text-muted)] line-through'
                                : 'text-[var(--color-text)]'
                            )}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {lessonLabels[lesson.type]}
                            {lesson.durationSecs ? ` · ${formatDuration(lesson.durationSecs)}` : ''}
                            {lesson.isFreePreview && (
                              <span className="ml-1.5 text-[#10B981]">Free</span>
                            )}
                          </p>
                        </div>
                        {!isAccessible && (
                          <Lock className="h-3.5 w-3.5 text-[var(--color-text-subtle)] shrink-0" />
                        )}
                        <span className="text-xs text-[#E53935] font-medium shrink-0">
                          +{lesson.xpReward} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
