import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, Clock, Users, Star, BookOpen, Play, Award, MessageCircle, Zap, Code2, Wand2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EnrolButton from '@/components/courses/EnrolButton';
import LevelBadge from '@/components/ui/LevelBadge';
import { formatDuration, formatPrice } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/config/nav';
import type { Course, Section } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface CourseDetail extends Course {
  instructor: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl: string | null;
    bio?: string;
    courseCount?: number;
    studentCount?: number;
  };
  sections: (Section & { lessons: { id: string; title: string; position: number; type: string; durationSecs: number | null; xpReward: number; isFreePreview: boolean }[] })[];
}

async function getCourse(slug: string): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${API_URL}/courses/slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  return { title: course ? `${course.title} — CiroStack Academy` : `Course — ${slug.replace(/-/g, ' ')}` };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) notFound();

  const priceNgn = formatPrice(course.priceNgn, 'NGN');
  const priceUsd = formatPrice(course.priceUsd, 'USD');

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: course info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="blue">{CATEGORY_LABELS[course.category]}</Badge>
                <LevelBadge level={course.level} />
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4 leading-tight">
                {course.title}
              </h1>

              <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)] mb-6">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <strong className="text-[var(--color-text)]">{course.ratingAverage}</strong>
                  <span>({course.ratingCount} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {course.enrolmentCount.toLocaleString()} enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDuration(course.totalDurationSecs)}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {course.totalLessons} lessons
                </span>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {course.hasPromptLab && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-medium">
                    <Wand2 className="h-3.5 w-3.5" /> Prompt Lab
                  </div>
                )}
                {course.hasAiVsManual && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-medium">
                    <Code2 className="h-3.5 w-3.5" /> AI vs Manual
                  </div>
                )}
                {course.hasCapstone && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E82121]/10 text-[#E82121] text-xs font-medium">
                    <Zap className="h-3.5 w-3.5" /> Ship It
                  </div>
                )}
                {course.hasClientBrief && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] text-xs font-medium">
                    <BookOpen className="h-3.5 w-3.5" /> Client Brief
                  </div>
                )}
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#E82121]/10 flex items-center justify-center text-[#E82121] font-semibold text-sm">
                    {course.instructor.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">Instructor</p>
                    <p className="text-sm font-medium text-[var(--color-text)]">{course.instructor.fullName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: sticky CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg">
                {/* Trailer placeholder */}
                <div className="aspect-video rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center mb-5 border border-[var(--color-border)] cursor-pointer group">
                  <div className="h-14 w-14 rounded-full bg-[#E82121] flex items-center justify-center group-hover:bg-[#C41B1B] transition-colors">
                    <Play className="h-6 w-6 text-white ml-1" />
                  </div>
                </div>

                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-display text-2xl font-bold text-[var(--color-text)]">{priceNgn}</span>
                  <span className="text-sm text-[var(--color-text-muted)]">/ {priceUsd}</span>
                </div>

                <EnrolButton courseId={course.id} slug={course.slug} />
                <p className="text-xs text-center text-[var(--color-text-muted)] mb-5">
                  7-day money-back guarantee
                </p>

                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  {[
                    `${course.totalLessons} lessons · ${formatDuration(course.totalDurationSecs)}`,
                    'Lifetime access',
                    'Certificate of completion',
                    'AI Tutor included',
                    course.whatsappGroupUrl && 'WhatsApp study group',
                  ].filter(Boolean).map((f) => (
                    <li key={f as string} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {course.whatYouLearn?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">What you&apos;ll learn</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                      <Check className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {course.sections?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">Curriculum</h2>
                <div className="space-y-3">
                  {course.sections.map((section) => (
                    <details key={section.id} className="group border border-[var(--color-border)] rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors">
                        <div>
                          <p className="font-medium text-sm text-[var(--color-text)]">{section.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {section.lessons?.length} lessons
                            {section.isFreePreview && <span className="ml-2 text-[#10B981]">Free preview</span>}
                          </p>
                        </div>
                      </summary>
                      <div className="divide-y divide-[var(--color-border)]">
                        {section.lessons?.map((lesson) => (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 text-sm bg-[var(--color-surface)]">
                            <div className="h-6 w-6 rounded bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
                              <Play className="h-3 w-3 text-[var(--color-text-muted)]" />
                            </div>
                            <span className={`flex-1 ${lesson.isFreePreview ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
                              {lesson.title}
                            </span>
                            {lesson.isFreePreview && (
                              <Badge variant="success" className="text-[10px]">Free</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor bio */}
            {course.instructor && (
              <div>
                <h2 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">About the instructor</h2>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-[#E82121]/10 flex items-center justify-center text-[#E82121] font-bold text-xl shrink-0">
                    {course.instructor.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text)] mb-1">{course.instructor.fullName}</p>
                    {(course.instructor.courseCount !== undefined || course.instructor.studentCount !== undefined) && (
                      <div className="flex gap-3 text-xs text-[var(--color-text-muted)] mb-3">
                        {course.instructor.courseCount !== undefined && (
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {course.instructor.courseCount} courses</span>
                        )}
                        {course.instructor.studentCount !== undefined && (
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.instructor.studentCount?.toLocaleString()} students</span>
                        )}
                      </div>
                    )}
                    {course.instructor.bio && (
                      <p className="text-sm text-[var(--color-text-muted)]">{course.instructor.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
