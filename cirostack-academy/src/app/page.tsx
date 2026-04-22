import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Zap, Code2, Wand2, Trophy, Users, BookOpen, Star, CheckCircle, Play } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LevelBadge from '@/components/ui/LevelBadge';
import { getCategoryColor } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'CiroStack Academy — Learn to build with AI',
  description: 'Real-world dev skills, AI-assisted coding techniques, and a direct path into the tech industry.',
};

const stats = [
  { value: '12,000+', label: 'Students learning' },
  { value: '47', label: 'Courses live' },
  { value: '94%', label: 'Completion rate' },
  { value: '₦0', label: 'To start (free preview)' },
];

const categories = [
  { label: 'UI/UX Design', href: '/courses?category=ui_ux', emoji: '🎨' },
  { label: 'Web Dev', href: '/courses?category=web_dev', emoji: '⚡' },
  { label: 'AI & ML', href: '/courses?category=ai_ml', emoji: '🤖' },
  { label: 'Mobile', href: '/courses?category=mobile', emoji: '📱' },
  { label: 'Cloud & DevOps', href: '/courses?category=cloud_devops', emoji: '☁️' },
  { label: 'Architecture', href: '/courses?category=architecture', emoji: '🏗️' },
  { label: 'Startups', href: '/courses?category=startups', emoji: '🚀' },
];

const features = [
  {
    icon: Wand2,
    color: 'text-[#7C3AED] bg-[#7C3AED]/10',
    title: 'AI vs Manual Split View',
    description: 'See the AI-assisted approach side by side with the manual approach. Understand the "why" behind each decision.',
  },
  {
    icon: Code2,
    color: 'text-[#E53935] bg-[#E53935]/10',
    title: 'Steal the Prompt',
    description: 'Every code lesson ships with the exact prompts the instructor used. Copy them to your personal library and adapt them.',
  },
  {
    icon: Trophy,
    color: 'text-[#F59E0B] bg-[#F59E0B]/10',
    title: 'Ship It Capstone',
    description: 'Build and deploy a real project. Get instructor review, a score, and potentially get flagged for the CiroStack talent pipeline.',
  },
  {
    icon: Zap,
    color: 'text-[#10B981] bg-[#10B981]/10',
    title: 'Cipher AI Tutor',
    description: 'Stuck on a concept? Ask Cipher — an AI tutor that knows exactly which lesson you\'re on and gives context-aware answers.',
  },
];

const testimonials = [
  {
    name: 'Tunde Okafor',
    role: 'Frontend Dev, Lagos',
    body: 'The Prompt Lab feature changed how I think about AI tools. I can actually explain my prompts now, not just copy-paste from ChatGPT.',
    rating: 5,
  },
  {
    name: 'Amara Nwosu',
    role: 'UX Designer, Abuja',
    body: 'Completed the UI/UX course in 3 weeks. The client brief simulator felt exactly like working with a real client. Got hired a month later.',
    rating: 5,
  },
  {
    name: 'Emeka Eze',
    role: 'Bootcamp grad, Port Harcourt',
    body: "The AI vs Manual split view is genuinely something I've never seen anywhere else. You understand the code, not just paste it.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#E53935]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#7C3AED]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="purple" className="mb-6 text-sm px-4 py-1.5">
            <Wand2 className="h-3.5 w-3.5" />
            AI-assisted coding for the real world
          </Badge>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-[var(--color-text)] mb-6 leading-tight">
            Learn to build.{' '}
            <span className="text-gradient">Ship with AI.</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Practical dev skills taught the way professionals actually work — using AI as a collaborator, not a crutch. Built by CiroStack.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
            <Button size="lg" variant="outline" leftIcon={<Play className="h-5 w-5" />} asChild>
              <Link href="/courses?is_free=true">Watch free lessons</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-bold text-[var(--color-text)]">{s.value}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-center mb-8">
            Browse by category
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[#E53935]/40 transition-all"
              >
                <span>{c.emoji}</span>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features section */}
      <section className="py-20 bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <Badge variant="blue" className="mb-4">What makes us different</Badge>
            <h2 className="font-display text-4xl font-bold text-[var(--color-text)] mb-4">
              Not another coding tutorial site
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
              We built features that don&apos;t exist anywhere else — because we actually use AI in client projects every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[#E53935]/30 transition-colors"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-[var(--color-text)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses — placeholder grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-[var(--color-text)]">
                Featured courses
              </h2>
              <p className="text-[var(--color-text-muted)] mt-1">Start with what the community loves</p>
            </div>
            <Link href="/courses" className="text-sm font-medium text-[#E53935] hover:text-[#D32F2F] flex items-center gap-1">
              All courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Course cards placeholder grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { title: 'AI-Assisted Frontend Dev', level: 'beginner', category: 'web_dev', categoryLabel: 'Web Dev', emoji: '⚡', price: '₦29,000', features: ['Prompt Lab', 'AI vs Manual'] },
              { title: 'Figma to Code with AI', level: 'beginner', category: 'ui_ux', categoryLabel: 'UI/UX', emoji: '🎨', price: '₦25,000', features: ['Client Brief'] },
              { title: 'Node.js + Drizzle + Postgres', level: 'intermediate', category: 'web_dev', categoryLabel: 'Web Dev', emoji: '🔧', price: '₦45,000', features: ['Ship It'] },
              { title: 'Flutter & AI Copilot', level: 'intermediate', category: 'mobile', categoryLabel: 'Mobile', emoji: '📱', price: '₦39,000', features: ['AI vs Manual'] },
            ].map((c) => {
              const catColor = getCategoryColor(c.category);
              return (
                <Link key={c.title} href="/courses" className="group flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[#E53935]/40 hover:shadow-lg transition-all duration-200">
                  <div className="aspect-video bg-gradient-to-br from-[#E53935]/10 to-[#7C3AED]/10 flex items-center justify-center text-4xl">
                    {c.emoji}
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block w-fit"
                      style={{ backgroundColor: catColor.bg, color: catColor.text }}
                    >
                      {c.categoryLabel}
                    </span>
                    <h3 className="font-display font-semibold text-sm text-[var(--color-text)] group-hover:text-[#E53935] transition-colors">{c.title}</h3>
                    <div className="flex gap-1 flex-wrap">
                      {c.features.map((f) => (
                        <Badge key={f} variant="purple" className="text-[10px]">{f}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] mt-1">
                      <LevelBadge level={c.level as 'beginner' | 'intermediate'} />
                      <span className="text-sm font-semibold text-[var(--color-text)]">{c.price}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-20 bg-[var(--color-surface)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-[var(--color-text)] mb-4">
            Simple pricing
          </h2>
          <p className="text-[var(--color-text-muted)] mb-10">
            Buy individual courses or get all-access. Nigerian Naira or USD — your pick.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-left">
              <h3 className="font-display text-xl font-bold mb-2 text-[var(--color-text)]">Per course</h3>
              <p className="text-[var(--color-text-muted)] text-sm mb-4">Own it forever.</p>
              <p className="text-3xl font-display font-bold text-[var(--color-text)] mb-6">
                From ₦15,000
                <span className="text-base font-normal text-[var(--color-text-muted)] ml-1">/ $15</span>
              </p>
              <Button variant="outline" fullWidth asChild>
                <Link href="/courses">Browse courses</Link>
              </Button>
            </div>
            <div className="p-8 rounded-2xl border-2 border-[#E53935] bg-[#E53935]/5 text-left relative">
              <Badge variant="blue" className="absolute top-4 right-4">Best value</Badge>
              <h3 className="font-display text-xl font-bold mb-2 text-[var(--color-text)]">All-access</h3>
              <p className="text-[var(--color-text-muted)] text-sm mb-4">Every course, always.</p>
              <p className="text-3xl font-display font-bold text-[var(--color-text)] mb-6">
                ₦9,500<span className="text-base font-normal text-[var(--color-text-muted)]">/mo</span>
                <span className="text-sm font-normal text-[var(--color-text-muted)] ml-2">$9/mo</span>
              </p>
              <Button fullWidth asChild>
                <Link href="/pricing">See full pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-center text-[var(--color-text)] mb-12">
            What students say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-sm text-[var(--color-text)] leading-relaxed mb-4">
                  &ldquo;{t.body}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{t.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--color-surface)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold text-[var(--color-text)] mb-4">
            Ready to build?
          </h2>
          <p className="text-[var(--color-text-muted)] mb-8 text-lg">
            Sign up free, browse the catalog, and start with a free preview lesson.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} asChild>
              <Link href="/auth/signup">Start for free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">Browse catalog</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
