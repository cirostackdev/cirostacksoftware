'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { getPageTitle } from '@/config/nav';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';

export default function DashboardTopNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const title = getPageTitle(pathname);

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      <h1 className="font-display text-lg font-semibold text-[var(--color-text)]">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <button className="relative h-9 w-9 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        {user && (
          <Link href="/dashboard/settings">
            <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
}
