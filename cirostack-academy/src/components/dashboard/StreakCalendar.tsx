'use client';

import { cn } from '@/lib/utils';

interface StreakCalendarProps {
  activityDates: string[]; // ISO date strings of days with activity
  streakCurrent: number;
  className?: string;
}

function getLast12Weeks() {
  const weeks: Date[][] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from 12 weeks ago (Sunday)
  const start = new Date(today);
  start.setDate(today.getDate() - 83); // ~12 weeks
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);

  const cursor = new Date(start);
  while (cursor <= today) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export default function StreakCalendar({
  activityDates,
  streakCurrent,
  className,
}: StreakCalendarProps) {
  const weeks = getLast12Weeks();
  const activeSet = new Set(activityDates.map((d) => d.slice(0, 10)));
  const today = new Date().toISOString().slice(0, 10);

  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[var(--color-text)]">
          Activity
        </span>
        <span className="text-sm text-[var(--color-text-muted)]">
          {streakCurrent} day streak 🔥
        </span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {/* Day labels column */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 w-3 flex items-center justify-center">
              <span className="text-[9px] text-[var(--color-text-subtle)]">{label}</span>
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              const iso = day.toISOString().slice(0, 10);
              const isActive = activeSet.has(iso);
              const isToday = iso === today;
              const isFuture = iso > today;

              return (
                <div
                  key={di}
                  title={iso}
                  className={cn(
                    'h-3 w-3 rounded-sm',
                    isFuture
                      ? 'bg-[var(--color-border)]'
                      : isActive
                      ? 'bg-[#E82121]'
                      : 'bg-[var(--color-surface-2)]',
                    isToday && !isActive && 'ring-1 ring-[#E82121]'
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
