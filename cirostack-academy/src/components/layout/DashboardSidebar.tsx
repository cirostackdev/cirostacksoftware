'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut, BookOpen, Award, Code2, BarChart3, Settings, Users, ShieldCheck, Tag, Briefcase, Home, GraduationCap, Trophy, Library, Flame } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { cn } from '@/lib/utils';
import { xpToLevel, xpToNextLevel } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';

const studentNav = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'My Learning', href: '/dashboard/learning', icon: BookOpen },
  { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
  { label: 'My Projects', href: '/dashboard/projects', icon: Code2 },
  { label: 'Prompt Library', href: '/dashboard/prompts', icon: Library },
  { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const instructorNav = [
  { label: 'Overview', href: '/instructor', icon: Home },
  { label: 'My Courses', href: '/instructor/courses', icon: BookOpen },
  { label: 'Submissions', href: '/instructor/submissions', icon: GraduationCap },
  { label: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNav = [
  { label: 'Overview', href: '/admin', icon: Home },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen },
  { label: 'Promo Codes', href: '/admin/promos', icon: Tag },
  { label: 'Talent Pipeline', href: '/admin/talent', icon: Briefcase },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems =
    user?.role === 'admin'
      ? adminNav
      : user?.role === 'instructor'
        ? instructorNav
        : studentNav;

  const level = user ? xpToLevel(user.xpTotal) : 1;
  const xpNeeded = user ? xpToNextLevel(user.xpTotal) : 500;
  const xpProgress = user ? ((user.xpTotal % 500) / 500) * 100 : 0;

  return (
    <aside className="flex flex-col w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--color-border)]">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center">
            <Image src="/logo.png" alt="CiroStack Academy" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-display font-bold text-[var(--color-text)]">
            Academy
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || (href !== '/dashboard' && href !== '/instructor' && href !== '/admin' && pathname.startsWith(href))
                ? 'bg-[#E82121]/10 text-[#E82121]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* XP Widget (students only) */}
      {user?.role === 'student' && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-[#F59E0B]" />
            <span className="text-xs font-semibold text-[var(--color-text)]">
              {user.streakCurrent} day streak
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-muted)]">Level {level}</span>
            <span className="text-xs text-[var(--color-text-muted)]">{xpNeeded} XP to next</span>
          </div>
          <ProgressBar value={xpProgress} size="sm" color="brand" />
          <p className="text-xs text-[var(--color-text-subtle)] mt-1.5">{user.xpTotal} total XP</p>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-[var(--color-border)]">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
