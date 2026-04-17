import jwt from 'jsonwebtoken';
import { secrets } from '@/config/secrets.js';

const MUX_BASE = 'https://api.mux.com';

function muxAuthHeader(): string {
  const { muxTokenId, muxTokenSecret } = secrets();
  return 'Basic ' + Buffer.from(`${muxTokenId}:${muxTokenSecret}`).toString('base64');
}

export async function getUploadUrl(lessonId: string): Promise<{ uploadId: string; url: string }> {
  const res = await fetch(`${MUX_BASE}/video/v1/uploads`, {
    method: 'POST',
    headers: {
      Authorization: muxAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['signed'],
        passthrough: lessonId,
      },
    }),
  });
  if (!res.ok) throw new Error(`Mux upload URL failed: ${res.status}`);
  const body = (await res.json()) as { data: { id: string; url: string } };
  return { uploadId: body.data.id, url: body.data.url };
}

export function getPlaybackToken(playbackId: string, ttlMinutes = 15): string {
  const { muxTokenId, muxTokenSecret } = secrets();
  return jwt.sign(
    { sub: playbackId, aud: 'v', exp: Math.floor(Date.now() / 1000) + ttlMinutes * 60 },
    muxTokenSecret,
    { keyid: muxTokenId, algorithm: 'RS256' },
  );
}

export async function getAsset(assetId: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${MUX_BASE}/video/v1/assets/${assetId}`, {
    headers: { Authorization: muxAuthHeader() },
  });
  if (!res.ok) throw new Error(`Mux get asset failed: ${res.status}`);
  const body = (await res.json()) as { data: Record<string, unknown> };
  return body.data;
}
