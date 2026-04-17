import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { users, xpEvents, badges, userBadges } from '@/db/schema.js';
import { eq, desc, asc } from 'drizzle-orm';

export const gamificationRouter = Router();

gamificationRouter.get('/xp/me', requireAuth, async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.sub) });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const recentEvents = await db.query.xpEvents.findMany({
      where: eq(xpEvents.userId, req.user!.sub),
      orderBy: desc(xpEvents.createdAt),
      limit: 20,
    });

    const level = Math.floor(user.xpTotal / 500) + 1;
    const xpToNextLevel = level * 500 - user.xpTotal;

    res.json({
      data: {
        userId: user.id,
        xpTotal: user.xpTotal,
        level,
        xpToNextLevel,
        streakCurrent: user.streakCurrent,
        streakLastActivity: user.streakLastActivity,
        recentEvents,
      },
    });
  } catch (err) {
    next(err);
  }
});

gamificationRouter.get('/xp/leaderboard', requireAuth, async (req, res, next) => {
  try {
    const top = await db.query.users.findMany({
      orderBy: desc(users.xpTotal),
      limit: 100,
      columns: { id: true, username: true, fullName: true, avatarUrl: true, xpTotal: true, streakCurrent: true },
    });

    const entries = top.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      username: u.username,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      xpTotal: u.xpTotal,
      streakCurrent: u.streakCurrent,
      level: Math.floor(u.xpTotal / 500) + 1,
    }));

    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
});

gamificationRouter.get('/badges', async (_req, res, next) => {
  try {
    const all = await db.query.badges.findMany({ orderBy: asc(badges.conditionValue) });
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

gamificationRouter.get('/badges/me', requireAuth, async (req, res, next) => {
  try {
    const earned = await db.query.userBadges.findMany({
      where: eq(userBadges.userId, req.user!.sub),
      with: { badge: true },
    });
    res.json({
      data: earned.map((ub) => ({
        ...(ub.badge as typeof badges.$inferSelect),
        earnedAt: ub.earnedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});
