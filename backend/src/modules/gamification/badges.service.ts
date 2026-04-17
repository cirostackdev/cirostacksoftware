import { db } from '@/db/index.js';
import { badges, userBadges, users } from '@/db/schema.js';
import { eq, and } from 'drizzle-orm';

type BadgeEventType = 'lesson_complete' | 'quiz_pass' | 'capstone' | 'prompt_lab' | 'course_complete' | 'streak';

export async function awardBadgesForEvent(
  userId: string,
  eventType: BadgeEventType,
  _referenceId?: string,
): Promise<void> {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) return;

    const conditionTypeMap: Record<BadgeEventType, string> = {
      lesson_complete: 'streak',
      quiz_pass: 'xp_threshold',
      capstone: 'capstone',
      prompt_lab: 'prompt_lab',
      course_complete: 'course_complete',
      streak: 'streak',
    };

    const conditionType = conditionTypeMap[eventType];
    const eligibleBadges = await db.query.badges.findMany({
      where: eq(badges.conditionType, conditionType),
    });

    for (const badge of eligibleBadges) {
      // Check if already earned
      const alreadyEarned = await db.query.userBadges.findFirst({
        where: and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badge.id)),
      });
      if (alreadyEarned) continue;

      let earned = false;

      if (badge.conditionType === 'streak') {
        earned = user.streakCurrent >= badge.conditionValue;
      } else if (badge.conditionType === 'xp_threshold') {
        earned = user.xpTotal >= badge.conditionValue;
      } else if (badge.conditionType === 'course_complete' || badge.conditionType === 'capstone') {
        earned = true; // If we're awarding for this event type, the condition is met
      } else if (badge.conditionType === 'prompt_lab') {
        earned = true;
      }

      if (earned) {
        await db
          .insert(userBadges)
          .values({ userId, badgeId: badge.id })
          .onConflictDoNothing();
      }
    }
  } catch (err) {
    console.error('[badges] awardBadgesForEvent error:', err);
  }
}
