'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GripVertical, Plus, Trash2, Video, FileText, Code2, HelpCircle, Save, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from '@/lib/store/useToastStore';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import type { Course, LessonType, Section, Lesson } from '@/types';

const lessonTypeIcons: Record<LessonType, React.ElementType> = {
  video: Video, written: FileText, code: Code2, quiz: HelpCircle,
  prompt_lab: Code2, ai_debug: Code2, client_brief: FileText, capstone: FileText,
};

const lessonTypes: { value: LessonType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'written', label: 'Article' },
  { value: 'code', label: 'Code' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'prompt_lab', label: 'Prompt Lab' },
  { value: 'ai_debug', label: 'AI Debug' },
  { value: 'client_brief', label: 'Client Brief' },
  { value: 'capstone', label: 'Capstone' },
];

type SectionWithLessons = Section & { lessons: Lesson[] };

export default function CourseBuilderPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<SectionWithLessons[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<Course[]>('/courses/instructor/courses').then((list) => list.find((c) => c.id === courseId) ?? null),
      apiGet<SectionWithLessons[]>(`/courses/${courseId}/curriculum`),
    ]).then(([courseData, sectionsData]) => {
      setCourse(courseData);
      setSections(sectionsData ?? []);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [courseId]);

  const addSection = async () => {
    try {
      const section = await apiPost<SectionWithLessons>(`/instructor/courses/${courseId}/sections`, {
        title: 'New section',
        position: sections.length,
      });
      setSections((prev) => [...prev, { ...section, lessons: [] }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add section');
    }
  };

  const updateSectionTitle = async (sectionId: string, title: string) => {
    setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, title } : s));
    try {
      await apiPatch(`/instructor/sections/${sectionId}`, { title });
    } catch {
      // silently fails — UI already updated
    }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      await apiDelete(`/instructor/sections/${sectionId}`);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      toast.success('Section deleted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete section');
    }
  };

  const addLesson = async (sectionId: string) => {
    try {
      const section = sections.find((s) => s.id === sectionId);
      const lesson = await apiPost<Lesson>(`/instructor/sections/${sectionId}/lessons`, {
        title: 'New lesson',
        type: 'video',
        position: section?.lessons.length ?? 0,
      });
      setSections((prev) =>
        prev.map((s) => s.id === sectionId ? { ...s, lessons: [...s.lessons, lesson] } : s)
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add lesson');
    }
  };

  const updateLesson = async (sectionId: string, lessonId: string, changes: Partial<Lesson>) => {
    setSections((prev) =>
      prev.map((s) => s.id === sectionId
        ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, ...changes } : l) }
        : s
      )
    );
    try {
      await apiPatch(`/instructor/lessons/${lessonId}`, changes);
    } catch {
      // silently fails
    }
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    try {
      await apiDelete(`/instructor/lessons/${lessonId}`);
      setSections((prev) =>
        prev.map((s) => s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s)
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete lesson');
    }
  };

  const handleSaveCourseTitle = async () => {
    if (!course) return;
    setIsSaving(true);
    try {
      const updated = await apiPatch<Course>(`/courses/instructor/courses/${courseId}`, { title: course.title });
      setCourse(updated);
      toast.success('Course saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/instructor/courses">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>Courses</Button>
        </Link>
        <div className="flex-1" />
        {course?.slug && (
          <Link href={`/courses/${course.slug}`} target="_blank">
            <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>Preview</Button>
          </Link>
        )}
        <Button size="sm" leftIcon={<Save className="h-4 w-4" />} isLoading={isSaving} onClick={handleSaveCourseTitle}>
          Save
        </Button>
      </div>

      {/* Course title */}
      <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
        <Input
          label="Course title"
          value={course?.title ?? ''}
          onChange={(e) => setCourse((prev) => prev ? { ...prev, title: e.target.value } : prev)}
        />
        <div className="flex gap-3 mt-4">
          <Link href={`/instructor/courses/${courseId}/prompts`}>
            <Button variant="outline" size="sm">Prompt editor</Button>
          </Link>
          <Link href={`/instructor/courses/${courseId}/quiz`}>
            <Button variant="outline" size="sm">Quiz builder</Button>
          </Link>
        </div>
      </div>

      {/* Curriculum */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
              <GripVertical className="h-4 w-4 text-[var(--color-text-subtle)] cursor-grab" />
              <input
                value={section.title}
                onChange={(e) => setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, title: e.target.value } : s))}
                onBlur={(e) => updateSectionTitle(section.id, e.target.value)}
                className="flex-1 bg-transparent text-sm font-semibold text-[var(--color-text)] focus:outline-none"
              />
              <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => addLesson(section.id)}>
                Add lesson
              </Button>
              <button
                onClick={() => deleteSection(section.id)}
                className="text-[var(--color-text-subtle)] hover:text-[#EF4444] transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {section.lessons.map((lesson) => {
                const Icon = lessonTypeIcons[lesson.type];
                return (
                  <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                    <GripVertical className="h-4 w-4 text-[var(--color-text-subtle)] cursor-grab shrink-0" />
                    <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]')}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <input
                      value={lesson.title}
                      onChange={(e) => setSections((prev) => prev.map((s) => ({ ...s, lessons: s.lessons.map((l) => l.id === lesson.id ? { ...l, title: e.target.value } : l) })))}
                      onBlur={(e) => updateLesson(section.id, lesson.id, { title: e.target.value })}
                      className="flex-1 bg-transparent text-sm text-[var(--color-text)] focus:outline-none"
                    />
                    <select
                      value={lesson.type}
                      onChange={(e) => updateLesson(section.id, lesson.id, { type: e.target.value as LessonType })}
                      className="text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-[var(--color-text-muted)] focus:outline-none"
                    >
                      {lessonTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lesson.isFreePreview}
                        onChange={(e) => updateLesson(section.id, lesson.id, { isFreePreview: e.target.checked })}
                        className="h-3 w-3"
                      />
                      Free
                    </label>
                    <button onClick={() => deleteLesson(section.id, lesson.id)} className="text-[var(--color-text-subtle)] hover:text-[#EF4444] transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <Button variant="outline" fullWidth leftIcon={<Plus className="h-4 w-4" />} onClick={addSection}>
          Add section
        </Button>
      </div>
    </div>
  );
}
