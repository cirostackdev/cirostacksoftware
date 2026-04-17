import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { subscriptions, payments, users } from '@/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import * as paystack from '@/modules/payments/paystack.js';
import * as stripe from '@/modules/payments/stripe.js';

export const subscriptionsRouter = Router();

const SITE_URL = process.env.SITE_URL ?? 'https://academy.cirostack.com';

subscriptionsRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, req.user!.sub),
    });
    res.json({ data: sub ?? null });
  } catch (err) {
    next(err);
  }
});

subscriptionsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { plan, provider } = z
      .object({
        plan: z.enum(['monthly', 'annual']),
        provider: z.enum(['paystack', 'stripe']).default('paystack'),
      })
      .parse(req.body);

    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.sub) });
    if (!user) throw new AppError(404, 'User not found');

    const existing = await db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.userId, req.user!.sub), eq(subscriptions.status, 'active')),
    });
    if (existing) throw new AppError(409, 'Already subscribed');

    // Amounts in kobo/cents
    const prices = {
      paystack: { monthly: 950000, annual: 9000000 }, // ₦9,500 / ₦90,000
      stripe: { monthly: 995, annual: 9900 }, // $9.95 / $99
    };
    const amount = prices[provider][plan];

    let paymentUrl: string;

    if (provider === 'paystack') {
      const customerCode =
        user.paystackCustomerCode ??
        (await paystack.createOrGetCustomer(user.email, user.fullName));
      if (!user.paystackCustomerCode) {
        await db.update(users).set({ paystackCustomerCode: customerCode }).where(eq(users.id, user.id));
      }
      const tx = await paystack.initializeTransaction(user.email, amount, {
        type: 'subscription',
        plan,
        userId: user.id,
      });
      paymentUrl = tx.authorizationUrl;
    } else {
      const customerId =
        user.stripeCustomerId ?? (await stripe.createOrGetCustomer(user.email, user.fullName));
      if (!user.stripeCustomerId) {
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
      }
      // Stripe price IDs should be configured per plan in Stripe dashboard
      const priceId = plan === 'monthly' ? 'price_monthly' : 'price_annual';
      const session = await stripe.createSubscriptionSession(
        priceId,
        customerId,
        { type: 'subscription', plan, userId: user.id },
        `${SITE_URL}/checkout/success`,
        `${SITE_URL}/checkout/subscription`,
      );
      paymentUrl = session.url;
    }

    res.json({ data: { paymentUrl, provider } });
  } catch (err) {
    next(err);
  }
});

subscriptionsRouter.post('/me/cancel', requireAuth, async (req, res, next) => {
  try {
    const sub = await db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.userId, req.user!.sub), eq(subscriptions.status, 'active')),
    });
    if (!sub) throw new AppError(404, 'No active subscription');

    if (sub.stripeSubscriptionId) {
      await stripe.cancelSubscription(sub.stripeSubscriptionId);
    }

    await db
      .update(subscriptions)
      .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id));

    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

subscriptionsRouter.post('/me/pause', requireAuth, async (req, res, next) => {
  try {
    const sub = await db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.userId, req.user!.sub), eq(subscriptions.status, 'active')),
    });
    if (!sub) throw new AppError(404, 'No active subscription');

    if (sub.stripeSubscriptionId) {
      await stripe.pauseSubscription(sub.stripeSubscriptionId);
    }

    await db
      .update(subscriptions)
      .set({ status: 'paused', pauseCollectionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id));

    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});
