import { Router } from 'express';
import { z } from 'zod';
import express from 'express';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { payments, promoCodes, courses, enrollments, subscriptions, users } from '@/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import * as paystack from './paystack.js';
import * as stripe from './stripe.js';

export const paymentsRouter = Router();

const SITE_URL = process.env.SITE_URL ?? 'https://academy.cirostack.com';

// ─── Course checkout ──────────────────────────────────────────────────────────

paymentsRouter.post('/checkout/course', requireAuth, async (req, res, next) => {
  try {
    const { courseId, promoCode, provider } = z
      .object({
        courseId: z.string().uuid(),
        promoCode: z.string().optional(),
        provider: z.enum(['paystack', 'stripe']).default('paystack'),
      })
      .parse(req.body);

    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    if (!course) throw new AppError(404, 'Course not found');
    if (!course.isPublished) throw new AppError(400, 'Course not available');

    const existingEnrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, req.user!.sub), eq(enrollments.courseId, courseId)),
    });
    if (existingEnrollment) throw new AppError(409, 'Already enrolled');

    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.sub) });
    if (!user) throw new AppError(404, 'User not found');

    let promo: typeof promoCodes.$inferSelect | undefined;
    if (promoCode) {
      promo = await db.query.promoCodes.findFirst({
        where: and(eq(promoCodes.code, promoCode), eq(promoCodes.isActive, true)),
      });
      if (!promo) throw new AppError(400, 'Invalid promo code');
      if (promo.expiresAt && promo.expiresAt < new Date()) throw new AppError(400, 'Promo code expired');
      if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
        throw new AppError(400, 'Promo code usage limit reached');
      }
    }

    const isNgn = provider === 'paystack';
    let amount = isNgn ? course.priceNgn : course.priceUsd;

    if (promo) {
      if (promo.type === 'percentage') {
        amount = Math.round(amount * (1 - promo.value / 100));
      } else {
        amount = Math.max(0, amount - promo.value);
      }
    }

    // Create pending payment record
    const reference = `course_${courseId}_${Date.now()}`;
    const [payment] = await db
      .insert(payments)
      .values({
        userId: req.user!.sub,
        courseId,
        promoCodeId: promo?.id ?? null,
        amount,
        currency: isNgn ? 'NGN' : 'USD',
        status: 'pending',
        provider,
        providerReference: reference,
        metadata: { courseId, userId: req.user!.sub },
      })
      .returning();

    let paymentUrl: string;

    if (provider === 'paystack') {
      const tx = await paystack.initializeTransaction(user.email, amount, {
        paymentId: payment.id,
        courseId,
        userId: req.user!.sub,
      });
      await db.update(payments).set({ providerReference: tx.reference }).where(eq(payments.id, payment.id));
      paymentUrl = tx.authorizationUrl;
    } else {
      // Stripe — requires a price ID; use ad-hoc price
      const stripeCustomerId = user.stripeCustomerId ?? await stripe.createOrGetCustomer(user.email, user.fullName);
      if (!user.stripeCustomerId) {
        await db.update(users).set({ stripeCustomerId }).where(eq(users.id, user.id));
      }
      // For one-off purchase, create a price on the fly or use a pre-configured price ID
      // Simplified: pass amount directly
      const session = await stripe.createCheckoutSession(
        '', // price_id — in practice set per course in Stripe dashboard
        stripeCustomerId,
        { paymentId: payment.id, courseId, userId: req.user!.sub },
        `${SITE_URL}/checkout/success?ref=${payment.id}`,
        `${SITE_URL}/checkout/course?courseId=${courseId}`,
      );
      paymentUrl = session.url;
    }

    res.json({ data: { paymentId: payment.id, paymentUrl, provider } });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get('/invoices', requireAuth, async (req, res, next) => {
  try {
    const invoices = await db.query.payments.findMany({
      where: and(eq(payments.userId, req.user!.sub), eq(payments.status, 'success')),
    });
    res.json({ data: invoices });
  } catch (err) {
    next(err);
  }
});

// ─── Promo code validation ────────────────────────────────────────────────────

paymentsRouter.post('/validate-promo', requireAuth, async (req, res, next) => {
  try {
    const { code, courseId } = z
      .object({ code: z.string(), courseId: z.string().uuid() })
      .parse(req.body);

    const promo = await db.query.promoCodes.findFirst({
      where: and(eq(promoCodes.code, code), eq(promoCodes.isActive, true)),
    });
    if (!promo) throw new AppError(400, 'Invalid promo code');
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new AppError(400, 'Promo code expired');
    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      throw new AppError(400, 'Promo code usage limit reached');
    }
    if (promo.courseId && promo.courseId !== courseId) {
      throw new AppError(400, 'Promo code not valid for this course');
    }

    res.json({ data: { valid: true, type: promo.type, value: promo.value } });
  } catch (err) {
    next(err);
  }
});

// ─── Paystack webhook ─────────────────────────────────────────────────────────

paymentsRouter.post(
  '/webhook/paystack',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const sig = req.headers['x-paystack-signature'] as string;
      const isValid = paystack.verifyWebhookSignature(req.body.toString(), sig);
      if (!isValid) {
        res.status(400).json({ error: 'Invalid signature' });
        return;
      }

      const event = JSON.parse(req.body.toString()) as {
        event: string;
        data: {
          reference: string;
          metadata: { paymentId?: string; courseId?: string; userId?: string; subscriptionId?: string };
          amount: number;
          customer: { email: string };
        };
      };

      if (event.event === 'charge.success') {
        const { metadata, reference } = event.data;
        const payment = await db.query.payments.findFirst({
          where: eq(payments.providerReference, reference),
        });

        if (payment) {
          await db.update(payments).set({ status: 'success', updatedAt: new Date() }).where(eq(payments.id, payment.id));

          if (payment.courseId) {
            // Enroll student
            await db
              .insert(enrollments)
              .values({ userId: payment.userId, courseId: payment.courseId, paymentId: payment.id })
              .onConflictDoNothing();
            await db
              .update(courses)
              .set({ enrolmentCount: sql`${courses.enrolmentCount} + 1` })
              .where(eq(courses.id, payment.courseId));
          } else if (payment.subscriptionId) {
            await db
              .update(subscriptions)
              .set({ status: 'active', updatedAt: new Date() })
              .where(eq(subscriptions.id, payment.subscriptionId));
          }

          // Increment promo code usage
          if (payment.promoCodeId) {
            await db
              .update(promoCodes)
              .set({ usageCount: sql`${promoCodes.usageCount} + 1` })
              .where(eq(promoCodes.id, payment.promoCodeId));
          }
        }
      }

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Stripe webhook ───────────────────────────────────────────────────────────

paymentsRouter.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const event = stripe.constructWebhookEvent(req.body, sig);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as { metadata: { paymentId?: string; courseId?: string; userId?: string } };
        const { paymentId } = session.metadata ?? {};
        if (paymentId) {
          const payment = await db.query.payments.findFirst({ where: eq(payments.id, paymentId) });
          if (payment) {
            await db.update(payments).set({ status: 'success', updatedAt: new Date() }).where(eq(payments.id, payment.id));
            if (payment.courseId) {
              await db
                .insert(enrollments)
                .values({ userId: payment.userId, courseId: payment.courseId, paymentId: payment.id })
                .onConflictDoNothing();
              await db
                .update(courses)
                .set({ enrolmentCount: sql`${courses.enrolmentCount} + 1` })
                .where(eq(courses.id, payment.courseId));
            }
          }
        }
      } else if (event.type === 'customer.subscription.deleted') {
        const sub = event.data.object as { id: string };
        await db
          .update(subscriptions)
          .set({ status: 'cancelled', cancelledAt: new Date(), updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      }

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Admin promo code CRUD ────────────────────────────────────────────────────

const promoSchema = z.object({
  code: z.string().min(3).max(50),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().int().positive(),
  currency: z.enum(['NGN', 'USD']).optional(),
  courseId: z.string().uuid().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

paymentsRouter.post('/admin/promo-codes', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const raw = promoSchema.parse(req.body);
    const body = { ...raw, expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined };
    const [promo] = await db.insert(promoCodes).values(body).returning();
    res.status(201).json({ data: promo });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get('/admin/promo-codes', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const all = await db.query.promoCodes.findMany();
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.patch('/admin/promo-codes/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const raw = promoSchema.partial().parse(req.body);
    const body = { ...raw, expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined };
    const [updated] = await db.update(promoCodes).set(body).where(eq(promoCodes.id, req.params.id)).returning();
    if (!updated) throw new AppError(404, 'Promo code not found');
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.delete('/admin/promo-codes/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const deleted = await db.delete(promoCodes).where(eq(promoCodes.id, req.params.id)).returning();
    if (!deleted.length) throw new AppError(404, 'Promo code not found');
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});
