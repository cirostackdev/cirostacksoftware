import { db } from '@/db/index.js';
import { users, xpEvents } from '@/db/schema.js';
import { eq, sql } from 'drizzle-orm';

export async function updateStreak(userId: string): Promise<void> {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const lastActivity = user.streakLastActivity;

    if (lastActivity === today) {
      // Already updated today
      return;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let newStreak: number;

    if (lastActivity === yesterday) {
      newStreak = user.streakCurrent + 1;
    } else {
      newStreak = 1;
    }

    await db
      .update(users)
      .set({ streakCurrent: newStreak, streakLastActivity: today, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Award streak milestone XP
    const milestones = [7, 30, 100];
    if (milestones.includes(newStreak)) {
      const xpAmount = newStreak === 7 ? 50 : newStreak === 30 ? 150 : 500;
      await db.insert(xpEvents).values({
        userId,
        eventType: 'streak_milestone',
        xpAmount,
        referenceId: null,
      });
      await db
        .update(users)
        .set({ xpTotal: sql`${users.xpTotal} + ${xpAmount}`, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }
  } catch (err) {
    console.error('[streak] updateStreak error:', err);
  }
}
