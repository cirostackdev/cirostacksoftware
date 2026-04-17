import crypto from 'crypto';
import { secrets } from '@/config/secrets.js';

const BASE = 'https://api.paystack.co';

function headers() {
  return {
    Authorization: `Bearer ${secrets().paystackSecretKey}`,
    'Content-Type': 'application/json',
  };
}

export async function initializeTransaction(
  email: string,
  amount: number, // in kobo
  metadata: Record<string, unknown>,
): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, amount, metadata }),
  });
  const body = (await res.json()) as { data: { authorization_url: string; reference: string } };
  return { authorizationUrl: body.data.authorization_url, reference: body.data.reference };
}

export async function createSubscription(
  customerCode: string,
  planCode: string,
): Promise<{ subscriptionCode: string }> {
  const res = await fetch(`${BASE}/subscription`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ customer: customerCode, plan: planCode }),
  });
  const body = (await res.json()) as { data: { subscription_code: string } };
  return { subscriptionCode: body.data.subscription_code };
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', secrets().paystackWebhookSecret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

export async function createOrGetCustomer(email: string, fullName: string): Promise<string> {
  const res = await fetch(`${BASE}/customer`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, first_name: fullName.split(' ')[0], last_name: fullName.split(' ').slice(1).join(' ') }),
  });
  const body = (await res.json()) as { data: { customer_code: string } };
  return body.data.customer_code;
}
