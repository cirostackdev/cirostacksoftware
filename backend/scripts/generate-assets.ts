/**
 * Generates SVG assets for courses, badges, and learning paths,
 * uploads them to S3, then updates the DB with the public URLs.
 *
 * Usage: bun run scripts/generate-assets.ts
 */

import { S3Client, PutObjectCommand, GetBucketLocationCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { loadSecrets, secrets } from '../src/config/secrets.js';
import { getDb } from '../src/db/index.js';
import { courses, badges, learningPaths } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

// ─── Category colours ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { from: string; to: string; accent: string; label: string }> = {
  web_dev:      { from: '#1E3A8A', to: '#2563EB', accent: '#60A5FA', label: 'Web Dev' },
  ui_ux:        { from: '#831843', to: '#EC4899', accent: '#F9A8D4', label: 'UI / UX' },
  ai_ml:        { from: '#4C1D95', to: '#7C3AED', accent: '#C4B5FD', label: 'AI & ML' },
  cloud_devops: { from: '#134E4A', to: '#0D9488', accent: '#5EEAD4', label: 'DevOps' },
  startups:     { from: '#7F1D1D', to: '#E82121', accent: '#FCA5A5', label: 'Startups' },
  architecture: { from: '#1E293B', to: '#475569', accent: '#94A3B8', label: 'Architecture' },
  mobile:       { from: '#064E3B', to: '#059669', accent: '#6EE7B7', label: 'Mobile' },
};

// ─── SVG generators ───────────────────────────────────────────────────────────

function courseThumbnailSvg(title: string, category: string, level: string): string {
  const c = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.web_dev;
  const levelColors: Record<string, string> = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
  };
  const levelColor = levelColors[level] ?? '#10B981';

  // Wrap title at ~28 chars per line
  const words = title.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > 28 && current) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current.trim());

  const titleY = lines.length === 1 ? 340 : lines.length === 2 ? 320 : 300;
  const titleLines = lines
    .map((l, i) => `<text x="60" y="${titleY + i * 56}" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700" fill="white" opacity="0.95">${escXml(l)}</text>`)
    .join('\n    ');

  return `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.from}"/>
      <stop offset="100%" stop-color="${c.to}"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.45)"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#overlay)"/>

  <!-- Decorative circles -->
  <circle cx="1100" cy="120" r="280" fill="${c.accent}" opacity="0.07"/>
  <circle cx="180"  cy="600" r="200" fill="${c.accent}" opacity="0.05"/>
  <circle cx="1200" cy="600" r="150" fill="white"      opacity="0.03"/>

  <!-- Decorative grid dots -->
  ${Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 14 }, (_, col) =>
      `<circle cx="${800 + col * 40}" cy="${80 + row * 40}" r="1.5" fill="${c.accent}" opacity="0.2"/>`
    ).join('')
  ).join('\n  ')}

  <!-- Brand bar -->
  <rect x="60" y="60" width="5" height="60" rx="2.5" fill="${c.accent}"/>
  <text x="82" y="82"  font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="${c.accent}" letter-spacing="3">CIROSTACK ACADEMY</text>
  <text x="82" y="103" font-family="system-ui, sans-serif" font-size="13" fill="white" opacity="0.6">${escXml(c.label)}</text>

  <!-- Title -->
  ${titleLines}

  <!-- Level badge -->
  <rect x="60" y="${titleY + lines.length * 56 + 24}" width="${level.length * 9 + 28}" height="30" rx="15" fill="${levelColor}" opacity="0.9"/>
  <text x="${60 + (level.length * 9 + 28) / 2}" y="${titleY + lines.length * 56 + 44}" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="white" text-anchor="middle">${level.charAt(0).toUpperCase() + level.slice(1)}</text>

  <!-- Bottom accent line -->
  <rect x="0" y="710" width="1280" height="10" fill="${c.accent}" opacity="0.5"/>
</svg>`;
}

function badgeSvg(emoji: string, name: string, color: string): string {
  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}22"/>
      <stop offset="100%" stop-color="${color}44"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${color}" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Outer ring -->
  <circle cx="100" cy="100" r="96" fill="none" stroke="${color}" stroke-width="3" opacity="0.4"/>
  <!-- Inner fill -->
  <circle cx="100" cy="100" r="88" fill="url(#bg)" filter="url(#shadow)"/>
  <!-- Inner ring -->
  <circle cx="100" cy="100" r="80" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.3"/>

  <!-- Emoji -->
  <text x="100" y="118" font-size="64" text-anchor="middle" dominant-baseline="middle">${emoji}</text>

  <!-- Name -->
  <text x="100" y="164" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="${color}" text-anchor="middle" opacity="0.9">${escXml(name)}</text>
</svg>`;
}

function learningPathSvg(title: string): string {
  return `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1100" cy="150" r="300" fill="#7C3AED" opacity="0.08"/>
  <circle cx="200"  cy="580" r="220" fill="#E82121"  opacity="0.06"/>

  <!-- Stars -->
  ${Array.from({ length: 40 }, () => {
    const x = Math.floor(Math.random() * 1280);
    const y = Math.floor(Math.random() * 720);
    const r = (Math.random() * 1.5 + 0.5).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${(Math.random() * 0.4 + 0.1).toFixed(2)}"/>`;
  }).join('\n  ')}

  <rect x="60" y="60" width="5" height="60" rx="2.5" fill="#7C3AED"/>
  <text x="82" y="82"  font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#C4B5FD" letter-spacing="3">CIROSTACK ACADEMY</text>
  <text x="82" y="103" font-family="system-ui, sans-serif" font-size="13" fill="white" opacity="0.5">Learning Path</text>

  <text x="60" y="340" font-family="system-ui, sans-serif" font-size="52" font-weight="800" fill="white" opacity="0.95">${escXml(title)}</text>

  <rect x="0" y="710" width="1280" height="10" fill="#7C3AED" opacity="0.5"/>
</svg>`;
}

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── S3 upload ────────────────────────────────────────────────────────────────

async function upload(client: S3Client, bucket: string, key: string, body: string, contentType: string, baseUrl: string): Promise<string> {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return `${baseUrl}/${key}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await loadSecrets();
  const db = getDb();
  const { awsAccessKey, awsSecretKey, awsS3Bucket } = secrets();

  // Detect bucket region first (bucket may not be in us-east-1)
  const probe = new S3Client({
    region: 'us-east-1',
    credentials: { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey },
  });
  const { LocationConstraint } = await probe.send(new GetBucketLocationCommand({ Bucket: awsS3Bucket }));
  // us-east-1 buckets return null/undefined for LocationConstraint
  const region = LocationConstraint ?? 'us-east-1';
  console.log(`[assets] bucket region: ${region}`);

  const s3 = new S3Client({
    region,
    credentials: { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey },
  });

  // Also update the public URL base to use the detected region
  const s3Base = `https://${awsS3Bucket}.s3.${region}.amazonaws.com`;

  // Apply public-read bucket policy for static asset prefixes
  const policy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Sid: 'PublicReadAssets',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: [
        `arn:aws:s3:::${awsS3Bucket}/courses/*`,
        `arn:aws:s3:::${awsS3Bucket}/badges/*`,
        `arn:aws:s3:::${awsS3Bucket}/paths/*`,
      ],
    }],
  });

  try {
    await s3.send(new PutBucketPolicyCommand({ Bucket: awsS3Bucket, Policy: policy }));
    console.log('[assets] bucket policy set — assets will be publicly readable');
  } catch (err: any) {
    if (err.Code === 'AccessDenied' || err.message?.includes('Block')) {
      console.error('[assets] ⚠ Could not set bucket policy. Go to S3 → cirostack-academy-s3-bucket → Permissions → Block public access → uncheck "Block public policy", then re-run.');
      process.exit(1);
    }
    throw err;
  }

  console.log(`[assets] uploading to s3://${awsS3Bucket}`);

  // ── Course thumbnails ──────────────────────────────────────────────────────

  const allCourses = await db.query.courses.findMany();
  console.log(`[assets] found ${allCourses.length} courses`);

  for (const course of allCourses) {
    const svg = courseThumbnailSvg(course.title, course.category, course.level);
    const key = `courses/${course.slug}.svg`;
    try {
      const url = await upload(s3, awsS3Bucket, key, svg, 'image/svg+xml', s3Base);
      await db.update(courses).set({ thumbnailUrl: url }).where(eq(courses.id, course.id));
      console.log(`[assets] ✓ course  ${course.slug}`);
    } catch (err: any) {
      console.error(`[assets] ✗ course  ${course.slug}: ${err.message}`);
    }
  }

  // ── Learning path thumbnail ────────────────────────────────────────────────

  const allPaths = await db.query.learningPaths.findMany();
  for (const path of allPaths) {
    const svg = learningPathSvg(path.title);
    const key = `paths/${path.slug}.svg`;
    try {
      const url = await upload(s3, awsS3Bucket, key, svg, 'image/svg+xml', s3Base);
      await db.update(learningPaths).set({ thumbnailUrl: url }).where(eq(learningPaths.id, path.id));
      console.log(`[assets] ✓ path    ${path.slug}`);
    } catch (err: any) {
      console.error(`[assets] ✗ path    ${path.slug}: ${err.message}`);
    }
  }

  // ── Badge images ───────────────────────────────────────────────────────────

  const badgeConfigs: { conditionType: string; emoji: string; color: string }[] = [
    { conditionType: 'streak',         emoji: '🔥', color: '#F97316' },
    { conditionType: 'course_complete', emoji: '🎓', color: '#7C3AED' },
    { conditionType: 'prompt_lab',      emoji: '⚡', color: '#EAB308' },
    { conditionType: 'capstone',        emoji: '🚀', color: '#E82121' },
    { conditionType: 'xp_threshold',    emoji: '⭐', color: '#F59E0B' },
  ];

  const allBadges = await db.query.badges.findMany();
  for (const badge of allBadges) {
    const cfg = badgeConfigs.find((b) => b.conditionType === badge.conditionType)
      ?? { emoji: '🏆', color: '#10B981' };
    const slug = badge.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const svg = badgeSvg(cfg.emoji, badge.name, cfg.color);
    const key = `badges/${slug}.svg`;
    try {
      const url = await upload(s3, awsS3Bucket, key, svg, 'image/svg+xml', s3Base);
      await db.update(badges).set({ imageUrl: url }).where(eq(badges.id, badge.id));
      console.log(`[assets] ✓ badge   ${badge.name}`);
    } catch (err: any) {
      console.error(`[assets] ✗ badge   ${badge.name}: ${err.message}`);
    }
  }

  console.log('\n[assets] done ✓');
  process.exit(0);
}

main().catch((err) => {
  console.error('[assets] fatal:', err);
  process.exit(1);
});
