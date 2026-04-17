import { secrets } from '@/config/secrets.js';

type ArmoryPayload = Record<string, unknown>;

export async function emitEvent(eventType: string, payload: ArmoryPayload): Promise<void> {
  const { armoryUrl, armoryInternalKey } = secrets();
  const res = await fetch(`${armoryUrl}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Key': armoryInternalKey,
    },
    body: JSON.stringify({ eventType, source: 'academy-api', payload }),
  });
  if (!res.ok) {
    console.error(`[armory] emitEvent ${eventType} failed: ${res.status}`);
  }
}

export async function emitEventStream(
  eventType: string,
  payload: ArmoryPayload,
): Promise<ReadableStream<Uint8Array> | null> {
  const { armoryUrl, armoryInternalKey } = secrets();
  const res = await fetch(`${armoryUrl}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Key': armoryInternalKey,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ eventType, source: 'academy-api', payload }),
  });
  if (!res.ok || !res.body) {
    console.error(`[armory] emitEventStream ${eventType} failed: ${res.status}`);
    return null;
  }
  return res.body;
}
