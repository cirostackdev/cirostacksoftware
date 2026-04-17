import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Learning Paths — CiroStack Academy',
};

const paths = [
  {
    id: '1',
    title: 'Full-Stack AI Developer',
    description: 'Go from zero to a deployed full-stack product using React, Node.js, and AI tools throughout the stack. The complete path for aspiring full-stack developers.',
    estimatedHours: 120,
    courses: ['AI-Assisted Frontend Dev', 'Node.js + Drizzle API', 'Cloud DevOps for Devs'],
    outcome: 'Build and deploy 3 full-stack projects. Ship It capstone is a multi-tenant SaaS.',
    level: 'beginner',
    emoji: '🚀',
    color: 'from-[#E82121]/10 to-[#7C3AED]/10',
    borderColor: 'border-[#E82121]/30',
  },
  {
    id: '2',
    title: 'AI-Assisted Product Designer',
    description: 'Learn UI/UX design and Figma-to-code workflow using AI. Ideal for designers who want to ship their own designs or collaborate better with developers.',
    estimatedHours: 60,
    courses: ['UI/UX Design Fundamentals', 'Figma to Code with AI'],
    outcome: 'Design and prototype 2 products. Build out one design system in code.',
    level: 'beginner',
    emoji: '🎨',
    color: 'from-[#F59E0B]/10 to-[#EF4444]/10',
    borderColor: 'border-[#F59E0B]/30',
  },
  {
    id: '3',
    title: 'AI & ML for Web Developers',
    description: 'Add AI features to your web apps. Build LLM-powered features, RAG pipelines, and AI agents using Claude, OpenAI, and LangChain.',
    estimatedHours: 80,
    courses: ['AI & ML for Web Devs', 'AI-Assisted Frontend Dev', 'React Architecture Patterns'],
    outcome: 'Build 4 AI-powered features. Final project: a deployable AI agent product.',
    level: 'intermediate',
    emoji: '🤖',
    color: 'from-[#7C3AED]/10 to-[#E82121]/10',
    borderColor: 'border-[#7C3AED]/30',
  },
  {
    id: '4',
    title: 'Mobile Developer (Flutter + AI)',
    description: 'Build cross-platform mobile apps with Flutter using AI as your pair programmer. Ship to both iOS and Android.',
    estimatedHours: 90,
    courses: ['Flutter & AI Copilot', 'AI & ML for Web Devs'],
    outcome: 'Ship 2 Flutter apps to the Play Store. Capstone: a mobile AI product.',
    level: 'intermediate',
    emoji: '📱',
    color: 'from-[#10B981]/10 to-[#E82121]/10',
    borderColor: 'border-[#10B981]/30',
  },
];

const levelColors = {
  beginner: 'bg-[#10B981]/10 text-[#10B981]',
  intermediate: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  advanced: 'bg-[#EF4444]/10 text-[#EF4444]',
};

export default function LearningPathsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h1 className="font-display text-4xl font-bold text-[var(--color-text)] mb-4">
            Learning paths
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">
            Curated course sequences with a clear outcome. Know exactly where you&apos;re going and what you&apos;ll be able to build.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {paths.map((path) => (
            <div
              key={path.id}
              className={`bg-gradient-to-br ${path.color} border ${path.borderColor} rounded-2xl p-7 flex flex-col`}
            >
              <div className="text-4xl mb-4">{path.emoji}</div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${levelColors[path.level as keyof typeof levelColors]}`}>
                  {path.level}
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Clock className="h-3 w-3" />
                  {path.estimatedHours}h total
                </span>
              </div>

              <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-3">
                {path.title}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5 flex-1">
                {path.description}
              </p>

              {/* Course sequence */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Course sequence</p>
                <div className="flex flex-col gap-2">
                  {path.courses.map((course, i) => (
                    <div key={course} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-[var(--color-text-muted)]">{i + 1}</span>
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)]">{course}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcome */}
              <div className="p-3 rounded-xl bg-[var(--color-surface)]/60 border border-[var(--color-border)] mb-5">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">You&apos;ll ship</p>
                <p className="text-xs text-[var(--color-text)]">{path.outcome}</p>
              </div>

              <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />} asChild className="self-start">
                <Link href={`/courses?path=${path.id}`}>Start this path</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
