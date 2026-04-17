'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, FileText, Code2, HelpCircle,
  MessageSquare, SidebarOpen, RotateCcw, Loader2
} from 'lucide-react';
import { usePlayerStore } from '@/lib/store/usePlayerStore';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { apiGet, apiPost, apiPatch } from '@/lib/api/client';
import type {
  LessonType, Section, Lesson, VideoContent, WrittenContent, CodeContent,
  QuizQuestion, QuizAttempt
} from '@/types';

// Dynamic imports for heavy components
const AiTutorDrawer = dynamic(() => import('@/components/player/AiTutorDrawer'), { ssr: false });
const LessonCompleteModal = dynamic(() => import('@/components/player/LessonCompleteModal'), { ssr: false });

const typeIcons: Record<LessonType, React.ElementType> = {
  video: Play, written: FileText, code: Code2, quiz: HelpCircle,
  prompt_lab: MessageSquare, ai_debug: Code2, client_brief: FileText, capstone: CheckCircle,
};

const tabs = [
  { id: 'video', label: 'Video', icon: Play },
  { id: 'written', label: 'Guide', icon: FileText },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
] as const;

type TabId = typeof tabs[number]['id'];

interface LessonWithNav extends Lesson {
  section: { courseId: string };
  nextLesson?: { id: string; title: string } | null;
  prevLesson?: { id: string; title: string } | null;
}

interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  compileError: string | null;
}

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const lessonId = params.lessonId as string;

  const {
    activeTab, setActiveTab, isSidebarOpen, toggleSidebar,
    isAiDrawerOpen, openAiDrawer, closeAiDrawer,
    isLessonCompleteModalOpen, closeLessonCompleteModal, lastXpEarned,
    openLessonCompleteModal,
  } = usePlayerStore();

  const [lesson, setLesson] = useState<LessonWithNav | null>(null);
  const [sections, setSections] = useState<(Section & { lessons: (Lesson & { completed?: boolean })[] })[]>([]);
  const [videoContent, setVideoContent] = useState<VideoContent | null>(null);
  const [writtenContent, setWrittenContent] = useState<WrittenContent | null>(null);
  const [codeContent, setCodeContent] = useState<CodeContent | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Code sandbox state
  const [currentCode, setCurrentCode] = useState('');
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Fetch lesson + course sections + progress
  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      apiGet<LessonWithNav>(`/lessons/${lessonId}`),
      apiGet<{ id: string; sections?: (Section & { lessons: Lesson[] })[] }>(`/courses/slug/${slug}`)
    ]).then(([lessonData, courseData]) => {
      const allSections = courseData.sections ?? [];
      const allLessons = allSections.flatMap((s) => s.lessons ?? []);
      const idx = allLessons.findIndex((l) => l.id === lessonId);
      setLesson({
        ...lessonData,
        prevLesson: idx > 0 ? { id: allLessons[idx - 1].id, title: allLessons[idx - 1].title } : null,
        nextLesson: idx < allLessons.length - 1 ? { id: allLessons[idx + 1].id, title: allLessons[idx + 1].title } : null,
      });

      if (courseData.id) {
        apiGet<Record<string, { notes: string | null; completedAt: string | null }>>(`/enrollments/${courseData.id}/progress`)
          .then((progressMap) => {
            const lessonProgress = progressMap[lessonId];
            if (lessonProgress?.notes) setNotes(lessonProgress.notes);
            setSections(allSections.map((s) => ({
              ...s,
              lessons: s.lessons.map((l) => ({
                ...l,
                completed: !!(progressMap[l.id]?.completedAt),
              })),
            })));
          })
          .catch(() => setSections(allSections));
      } else {
        setSections(allSections);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [slug, lessonId]);

  // Fetch content for active tab
  useEffect(() => {
    if (!lesson) return;
    if (activeTab === 'video' && lesson.type === 'video') {
      apiGet<VideoContent>(`/lessons/${lessonId}/video`)
        .then(setVideoContent)
        .catch(() => {});
    }
    if (activeTab === 'written') {
      apiGet<WrittenContent>(`/lessons/${lessonId}/written`)
        .then(setWrittenContent)
        .catch(() => {});
    }
    if (activeTab === 'code') {
      apiGet<CodeContent>(`/lessons/${lessonId}/code`)
        .then((c) => {
          setCodeContent(c);
          setCurrentCode(c.starterCode ?? '');
        })
        .catch(() => {});
    }
    if (activeTab === 'quiz') {
      setIsLoadingQuiz(true);
      apiGet<QuizQuestion[]>(`/lessons/${lessonId}/quiz`)
        .then((qs) => {
          setQuizQuestions(qs);
          setQuizAnswers({});
          setQuizResult(null);
        })
        .catch(() => {})
        .finally(() => setIsLoadingQuiz(false));
    }
  }, [activeTab, lesson, lessonId]);

  const saveNotes = () => {
    apiPatch(`/progress/lessons/${lessonId}`, { notes }).catch(() => {});
  };

  const markComplete = async () => {
    if (!lesson || isMarkingComplete) return;
    setIsMarkingComplete(true);
    try {
      await apiPost(`/progress/lessons/${lessonId}`);
      openLessonCompleteModal(lesson.xpReward);
      setSections((prev) =>
        prev.map((s) => ({
          ...s,
          lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, completed: true } : l),
        }))
      );
    } catch {
      openLessonCompleteModal(lesson.xpReward);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const runCode = async () => {
    if (!codeContent || isRunning) return;
    setIsRunning(true);
    setSandboxOutput('');
    try {
      const result = await apiPost<SandboxResult>('/sandbox/run', {
        language: codeContent.language,
        code: currentCode,
      });
      const out = [
        result.compileError ? `Compile error:\n${result.compileError}` : '',
        result.stdout,
        result.stderr ? `stderr:\n${result.stderr}` : '',
      ].filter(Boolean).join('\n').trim();
      setSandboxOutput(out || `(exit ${result.exitCode})`);
    } catch (err) {
      setSandboxOutput(`Error: ${err instanceof Error ? err.message : 'Execution failed'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitQuiz = async () => {
    if (isSubmittingQuiz) return;
    setIsSubmittingQuiz(true);
    try {
      const answers = quizQuestions.map((q) => ({
        questionId: q.id,
        answer: quizAnswers[q.id] ?? '',
      }));
      const attempt = await apiPost<QuizAttempt>(`/lessons/${lessonId}/quiz/attempt`, { answers });
      setQuizResult(attempt);
    } catch {
      // error handled below
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)]" />
        <div className="flex-1 p-6">
          <Skeleton className="h-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Lesson not found or you are not enrolled in this course.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)] overflow-hidden">
      {/* Top bar */}
      <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-4 gap-3 shrink-0 z-20">
        <button
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <SidebarOpen className="h-4 w-4" />
        </button>

        <Link href={`/courses/${slug}`} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to course
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text)] truncate">{lesson.title}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
            onClick={openAiDrawer}
          >
            <span className="hidden sm:inline">Cipher AI</span>
          </Button>
          <Button
            size="sm"
            isLoading={isMarkingComplete}
            onClick={markComplete}
          >
            <CheckCircle className="h-4 w-4 mr-1.5" />
            Mark complete
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-72 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto">
            <div className="p-3">
              {sections.map((section) => (
                <div key={section.id} className="mb-2">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-2 py-2">
                    {section.title}
                  </p>
                  {section.lessons.map((l) => {
                    const Icon = typeIcons[l.type];
                    const isActive = l.id === lessonId;
                    return (
                      <Link
                        key={l.id}
                        href={`/learn/${slug}/${l.id}`}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5',
                          isActive
                            ? 'bg-[#E82121]/10 text-[#E82121]'
                            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                        )}
                      >
                        <div className={cn('h-5 w-5 rounded flex items-center justify-center shrink-0', l.completed ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]')}>
                          {l.completed ? <CheckCircle className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                        </div>
                        <span className={cn('flex-1 truncate', l.completed && 'line-through opacity-60')}>{l.title}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Tab bar */}
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 flex gap-1 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-[#E82121] text-[#E82121]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'video' && (
              <div className="p-6">
                <div className="aspect-video rounded-xl overflow-hidden mb-6 border border-[var(--color-border)] bg-black">
                  {videoContent?.muxPlaybackId ? (
                    <iframe
                      src={`https://player.mux.com/${videoContent.muxPlaybackId}${videoContent.muxToken ? `?token=${videoContent.muxToken}` : ''}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--color-code-bg)]">
                      <div className="text-center">
                        <div className="h-16 w-16 rounded-full bg-[#E82121] flex items-center justify-center mx-auto mb-3">
                          <Play className="h-7 w-7 text-white ml-1" />
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)]">{lesson.title}</p>
                      </div>
                    </div>
                  )}
                </div>

                {videoContent?.chapters && videoContent.chapters.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Chapters</h3>
                    <div className="space-y-1">
                      {videoContent.chapters.map((ch) => (
                        <button
                          key={ch.timeSecs}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors text-left"
                        >
                          <span className="text-xs font-mono text-[var(--color-text-muted)] w-10">
                            {Math.floor(ch.timeSecs / 60)}:{String(ch.timeSecs % 60).padStart(2, '0')}
                          </span>
                          <span className="text-sm text-[var(--color-text)]">{ch.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">My notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={saveNotes}
                    placeholder="Jot down key takeaways..."
                    rows={4}
                    className="w-full rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-sm p-3 text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[#E82121] resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'written' && (
              <div className="p-6 max-w-3xl">
                <div className="prose prose-sm max-w-none text-[var(--color-text-muted)]">
                  <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-4">
                    {lesson.title}
                  </h2>
                  {writtenContent ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{writtenContent.contentMd}</div>
                  ) : (
                    <p className="text-[var(--color-text-subtle)] italic">No written guide for this lesson.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="h-full flex">
                <div className="flex-1 bg-[var(--color-code-bg)] flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                    <div className="flex gap-1.5">
                      {codeContent ? (
                        <Badge variant="blue" className="text-[10px]">{codeContent.language}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">typescript</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-text-muted)] border border-[var(--color-border)]"
                        leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        onClick={() => setCurrentCode(codeContent?.starterCode ?? '')}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        isLoading={isRunning}
                        onClick={runCode}
                        disabled={!codeContent}
                      >
                        {isRunning ? null : '▶'} Run
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                    <textarea
                      value={currentCode}
                      onChange={(e) => setCurrentCode(e.target.value)}
                      className="w-full h-full font-mono text-sm text-[#A8B5C9] bg-transparent resize-none focus:outline-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                </div>
                <div className="w-72 border-l border-[var(--color-border)] bg-[var(--color-code-bg)] flex flex-col">
                  <div className="px-4 py-3 border-b border-[var(--color-border)]">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Output</p>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                    {isRunning ? (
                      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="text-xs">Running…</span>
                      </div>
                    ) : sandboxOutput ? (
                      <pre className="font-mono text-xs text-[#10B981] whitespace-pre-wrap">{sandboxOutput}</pre>
                    ) : (
                      <p className="font-mono text-xs text-[var(--color-text-muted)]">{'// Run your code to see output'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="p-6 max-w-2xl">
                {isLoadingQuiz ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                  </div>
                ) : quizResult ? (
                  <div className="space-y-6">
                    <div className={cn(
                      'rounded-xl p-6 text-center border',
                      quizResult.passed
                        ? 'bg-[#10B981]/10 border-[#10B981]/30'
                        : 'bg-[#EF4444]/10 border-[#EF4444]/30'
                    )}>
                      <p className="font-display text-3xl font-bold text-[var(--color-text)] mb-1">
                        {quizResult.score} / {quizResult.maxScore}
                      </p>
                      <p className={cn('font-semibold text-sm', quizResult.passed ? 'text-[#10B981]' : 'text-[#EF4444]')}>
                        {quizResult.passed ? 'Passed!' : 'Not quite — keep studying'}
                      </p>
                      {quizResult.aiFeedback && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-3">{quizResult.aiFeedback}</p>
                      )}
                    </div>
                    <Button variant="outline" fullWidth onClick={() => { setQuizResult(null); setQuizAnswers({}); }}>
                      Try again
                    </Button>
                  </div>
                ) : quizQuestions.length === 0 ? (
                  <p className="text-[var(--color-text-muted)] text-sm">No quiz questions for this lesson.</p>
                ) : (
                  <div className="space-y-6">
                    <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Quiz</h2>
                    {quizQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
                        <p className="text-sm font-medium text-[var(--color-text)] mb-3">
                          {idx + 1}. {q.questionText}
                          <Badge variant="outline" className="ml-2 text-[10px]">{q.points} pts</Badge>
                        </p>
                        {q.type === 'multiple_choice' && q.options ? (
                          <div className="space-y-2">
                            {q.options.map((opt) => (
                              <label
                                key={opt}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm',
                                  quizAnswers[q.id] === opt
                                    ? 'border-[#E82121] bg-[#E82121]/5 text-[var(--color-text)]'
                                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-2)]'
                                )}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  checked={quizAnswers[q.id] === opt}
                                  onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                  className="sr-only"
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={quizAnswers[q.id] ?? ''}
                            onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Type your answer…"
                            rows={4}
                            className="w-full rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-sm p-3 text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[#E82121] resize-none"
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      fullWidth
                      size="lg"
                      isLoading={isSubmittingQuiz}
                      onClick={submitQuiz}
                    >
                      Submit quiz
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prev / Next nav */}
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 flex items-center justify-between shrink-0">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              disabled={!lesson.prevLesson}
              onClick={() => lesson.prevLesson && (router.push(`/learn/${slug}/${lesson.prevLesson.id}`))}
            >
              Previous
            </Button>
            <p className="text-xs text-[var(--color-text-muted)] hidden sm:block">
              +{lesson.xpReward} XP on completion
            </p>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              disabled={!lesson.nextLesson}
              onClick={() => lesson.nextLesson && (router.push(`/learn/${slug}/${lesson.nextLesson.id}`))}
            >
              {lesson.nextLesson ? 'Next lesson' : 'Course complete'}
            </Button>
          </div>
        </main>

        {/* AI Tutor Drawer */}
        {isAiDrawerOpen && (
          <AiTutorDrawer lessonId={lessonId} onClose={closeAiDrawer} />
        )}
      </div>

      {/* Lesson complete modal */}
      {isLessonCompleteModalOpen && (
        <LessonCompleteModal
          xpEarned={lastXpEarned}
          nextLessonTitle={lesson.nextLesson?.title}
          onClose={closeLessonCompleteModal}
          onNext={() => {
            closeLessonCompleteModal();
            if (lesson.nextLesson) {
              router.push(`/learn/${slug}/${lesson.nextLesson.id}`);
            }
          }}
        />
      )}
    </div>
  );
}
