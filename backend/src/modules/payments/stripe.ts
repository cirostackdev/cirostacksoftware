import Stripe from 'stripe';
import { secrets } from '@/config/secrets.js';

function getStripe(): Stripe {
  return new Stripe(secrets().stripeSecretKey);
}

export async function createCheckoutSession(
  priceId: string,
  customerId: string | null,
  metadata: Record<string, string>,
  successUrl: string,
  cancelUrl: string,
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ...(customerId && { customer: customerId }),
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return { url: session.url ?? '', sessionId: session.id };
}

export async function createSubscriptionSession(
  priceId: string,
  customerId: string | null,
  metadata: Record<string, string>,
  successUrl: string,
  cancelUrl: string,
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ...(customerId && { customer: customerId }),
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return { url: session.url ?? '', sessionId: session.id };
}

export async function createOrGetCustomer(email: string, name: string): Promise<string> {
  const stripe = getStripe();
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length) return existing.data[0].id;
  const customer = await stripe.customers.create({ email, name });
  return customer.id;
}

export function constructWebhookEvent(payload: string | Buffer, sig: string): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, sig, secrets().stripeWebhookSecret);
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

export async function pauseSubscription(subscriptionId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(subscriptionId, {
    pause_collection: { behavior: 'void' },
  });
}
