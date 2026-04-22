import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, Users, Award, Code2, ArrowRight, Briefcase } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'About — CiroStack Academy',
  description: 'Learn about CiroStack Academy — who we are, our teaching philosophy, and the talent pipeline.',
};

const instructors = [
  { name: 'Tobi Adeyemi', role: 'Lead Frontend · 8 yrs React + TypeScript', courses: 5, students: 6200, emoji: '👨🏿‍💻' },
  { name: 'Kemi Lawal', role: 'UI/UX Director · Figma evangelist', courses: 3, students: 3100, emoji: '👩🏿‍🎨' },
  { name: 'Chidi Okonkwo', role: 'Backend Lead · Node.js + Postgres', courses: 4, students: 2800, emoji: '👨🏿‍🔧' },
];

const values = [
  { icon: Code2, title: 'Learn to build, not copy', desc: 'We teach you to understand AI output, not blindly accept it. Every AI-generated line of code gets explained.' },
  { icon: Briefcase, title: 'Real-world projects only', desc: 'No toy apps. Every capstone is a deployable product with a live URL. We use the same briefs CiroStack uses for actual clients.' },
  { icon: Users, title: 'Community-first', desc: 'Every course comes with a WhatsApp study group. The Launchpad community has 3,200+ builders across Nigeria and the diaspora.' },
  { icon: Award, title: 'Certificates that mean something', desc: 'A CiroStack Academy certificate verifies you shipped a real product — not just passed a multiple-choice quiz.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-28 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="blue" className="mb-6">Our story</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6 leading-tight">
            We&apos;re a dev agency that got tired of the gap between coding tutorials and real work.
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
            CiroStack has been building products for clients since 2019. In 2024 we launched Academy to share exactly how we build — AI-assisted workflows, client briefs, and all.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-[var(--color-text)] mb-3">Our teaching philosophy</h2>
            <p className="text-[var(--color-text-muted)]">Four principles that guide every course we build.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                <div className="h-10 w-10 rounded-xl bg-[#E53935]/10 flex items-center justify-center mb-4">
                  <v.icon className="h-5 w-5 text-[#E53935]" />
                </div>
                <h3 className="font-display font-semibold text-[var(--color-text)] mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Philosophy */}
      <section className="py-20 bg-[var(--color-surface)]" id="ai">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Badge variant="purple" className="mb-6">AI manifesto</Badge>
          <h2 className="font-display text-3xl font-bold text-[var(--color-text)] mb-6">
            AI is a power tool. You still need to know how to use a hammer.
          </h2>
          <div className="space-y-4 text-[var(--color-text-muted)] leading-relaxed">
            <p>
              We build with AI every day at CiroStack. Claude generates our boilerplate. Copilot suggests completions. GPT-4 writes our test cases. We love these tools.
            </p>
            <p>
              But we&apos;ve also hired developers who couldn&apos;t debug AI-generated code because they didn&apos;t understand what it was doing. That&apos;s what we&apos;re fixing.
            </p>
            <p>
              Every AI-assisted lesson in CiroStack Academy shows the AI output, then breaks down the logic step by step — the same way a senior dev would explain it to a junior.
            </p>
            <p className="font-semibold text-[var(--color-text)]">
              The goal isn&apos;t to replace your thinking. It&apos;s to make you 10x faster while making you a better engineer.
            </p>
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--color-text)] mb-3">Meet the instructors</h2>
            <p className="text-[var(--color-text-muted)]">The CiroStack team — all active practitioners, no lecture-only academics.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {instructors.map((i) => (
              <div key={i.name} className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-center">
                <div className="text-5xl mb-4">{i.emoji}</div>
                <h3 className="font-display font-semibold text-[var(--color-text)] mb-1">{i.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">{i.role}</p>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <p className="font-display font-bold text-[var(--color-text)]">{i.courses}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Courses</p>
                  </div>
                  <div>
                    <p className="font-display font-bold text-[var(--color-text)]">{i.students.toLocaleString()}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Students</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Talent pipeline */}
      <section className="py-20 bg-[var(--color-surface)]" id="talent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Badge variant="gold" className="mb-6">Talent pipeline</Badge>
          <h2 className="font-display text-3xl font-bold text-[var(--color-text)] mb-4">
            Graduate and get noticed by real clients.
          </h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
            The best capstone projects get flagged for CiroStack&apos;s talent pipeline. When a client project needs a specific skill set, our team pulls from the pipeline first — real opportunities for Academy graduates.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { step: '1', label: 'Complete a course', desc: 'Build and deploy your Ship It capstone project.' },
              { step: '2', label: 'Get reviewed', desc: 'Instructors score your project and may flag it for the pipeline.' },
              { step: '3', label: 'Get referred', desc: 'CiroStack connects top graduates to client project opportunities.' },
            ].map((s) => (
              <div key={s.step} className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                <div className="h-7 w-7 rounded-full bg-[#E53935] text-white text-sm font-bold flex items-center justify-center mb-3">
                  {s.step}
                </div>
                <p className="font-semibold text-sm text-[var(--color-text)] mb-1">{s.label}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{s.desc}</p>
              </div>
            ))}
          </div>
          <Button rightIcon={<ArrowRight className="h-4 w-4" />} asChild>
            <Link href="/courses">Start your first course</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
