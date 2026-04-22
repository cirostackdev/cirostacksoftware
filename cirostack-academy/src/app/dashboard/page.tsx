'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, BookOpen, Award, Zap, Users, Calendar } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Button from '@/components/ui/Button';
import CourseProgressCard from '@/components/dashboard/CourseProgressCard';
import StreakCalendar from '@/components/dashboard/StreakCalendar';
import XpBar from '@/components/dashboard/XpBar';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { apiGet } from '@/lib/api/client';
import { xpToLevel } from '@/lib/utils';
import type { Enrollment, LiveSession } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [activityDates, setActivityDates] = useState<string[]>([]);

  useEffect(() => {
    apiGet<Enrollment[]>('/enrollments')
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setIsLoading(false));

    apiGet<LiveSession[]>('/live-sessions')
      .then((sessions) => setLiveSession(sessions[0] ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.streakLastActivity) {
      const dates: string[] = [];
      const today = new Date(user.streakLastActivity);
      for (let i = 0; i < user.streakCurrent; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
      }
      setActivityDates(dates);
    }
  }, [user]);

  const firstName = user?.fullName.split(' ')[0] ?? 'there';
  const level = user ? xpToLevel(user.xpTotal) : 1;
  const inProgress = enrollments.filter((e) => !e.completedAt);
  const completed = enrollments.filter((e) => e.completedAt);
  const resumeCourse = inProgress[0];

  const statsCards = [
    { label: 'Courses in progress', value: inProgress.length, icon: BookOpen, color: 'text-[#E53935] bg-[#E53935]/10' },
    { label: 'Completed', value: completed.length, icon: Award, color: 'text-[#10B981] bg-[#10B981]/10' },
    { label: 'Current streak', value: `${user?.streakCurrent ?? 0}d`, icon: Flame, color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
    { label: 'Level', value: `Lv ${level}`, icon: Zap, color: 'text-[#7C3AED] bg-[#7C3AED]/10' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {user?.streakCurrent ? `${user.streakCurrent} day streak — keep it up!` : 'Start learning to build your streak.'}
          </p>
        </div>
        {resumeCourse && (
          <Button rightIcon={<ArrowRight className="h-4 w-4" />} asChild>
            <Link href={`/learn/${resumeCourse.course?.slug}`}>Resume</Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
          >
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <p className="font-display text-2xl font-bold text-[var(--color-text)]">{s.value}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* In-progress courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Continue learning
            </h2>
            <Link href="/dashboard/learning" className="text-sm text-[#E53935] hover:underline">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : inProgress.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
              <BookOpen className="h-8 w-8 text-[var(--color-border-2)] mx-auto mb-3" />
              <p className="text-[var(--color-text-muted)] text-sm mb-4">No courses started yet.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/courses">Browse courses</Link>
              </Button>
            </div>
          ) : (
            inProgress.map((e) => <CourseProgressCard key={e.id} enrollment={e} />)
          )}

          {/* Upcoming live session */}
          {liveSession && (
            <div className="flex items-start gap-4 p-5 bg-[#E53935]/5 border border-[#E53935]/20 rounded-xl">
              <div className="h-10 w-10 rounded-xl bg-[#E53935]/10 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-[#E53935]" />
              </div>
              <div className="flex-1">
                <Badge variant="blue" className="mb-1 text-[10px]">Live session</Badge>
                <p className="font-medium text-sm text-[var(--color-text)]">{liveSession.title}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {new Date(liveSession.scheduledAt).toLocaleString('en-US', {
                    weekday: 'long', hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
                  })}
                </p>
              </div>
              <Button variant="outline" size="sm">RSVP</Button>
            </div>
          )}
        </div>

        {/* Right column: XP + Streak + community */}
        <div className="space-y-6">
          {user && <XpBar xpTotal={user.xpTotal} />}

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
            <StreakCalendar
              activityDates={activityDates}
              streakCurrent={user?.streakCurrent ?? 0}
            />
          </div>

          {/* Launchpad link */}
          <div className="flex items-start gap-3 p-4 bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl">
            <Users className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Launchpad community</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Join 3,200+ developers in the WhatsApp learning group.
              </p>
              <a
                href="https://chat.whatsapp.com/launchpad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#10B981] hover:underline"
              >
                Join group →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
