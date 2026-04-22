'use client';

import { useEffect, useState } from 'react';
import { Trophy, Flame, Zap } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { xpToLevel } from '@/lib/utils';
import { apiGet } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { LeaderboardEntry } from '@/types';

const medalColors = ['text-[#F59E0B]', 'text-[#94A3B8]', 'text-[#CD7F32]'];

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<LeaderboardEntry[]>('/xp/leaderboard')
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-3">
        {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-[var(--color-text-muted)]">
        Top students by XP earned. Rankings update daily.
      </p>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="divide-y divide-[var(--color-border)]">
          {entries.map((entry) => {
            const isMe = user?.id === entry.userId;
            return (
              <div
                key={entry.userId}
                className={cn(
                  'flex items-center gap-4 px-5 py-4 transition-colors',
                  isMe ? 'bg-[#E53935]/5 border-l-2 border-[#E53935]' : 'hover:bg-[var(--color-surface-2)]'
                )}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {entry.rank <= 3 ? (
                    <Trophy className={cn('h-4 w-4 mx-auto', medalColors[entry.rank - 1])} />
                  ) : (
                    <span className="text-sm font-mono text-[var(--color-text-muted)]">
                      {entry.rank}
                    </span>
                  )}
                </div>

                <Avatar src={entry.avatarUrl} name={entry.fullName} size="sm" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {entry.fullName}
                    </p>
                    {isMe && <Badge variant="blue" className="text-[10px]">You</Badge>}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">@{entry.username}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-[#F59E0B]">
                    <Flame className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{entry.streakCurrent}d</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#7C3AED]">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Lv {entry.level}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold text-[var(--color-text)]">
                      {entry.xpTotal.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">XP</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
