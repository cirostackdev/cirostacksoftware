import { randomBytes } from 'crypto';
import { db } from '@/db/index.js';
import { certificates } from '@/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getDownloadUrl, s3KeyForCertificate } from './s3.js';
import { sendCertificateEmail } from './email.js';

function generateVerificationCode(): string {
  return randomBytes(16).toString('hex');
}

async function renderCertificatePdf(
  userFullName: string,
  courseTitle: string,
  issuedAt: Date,
  verificationCode: string,
): Promise<Buffer> {
  // Dynamic import so puppeteer is optional in environments that don't support it
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 60px; background: #fff; }
    .cert { border: 8px solid #1A6FE8; padding: 60px; text-align: center; min-height: 500px; }
    h1 { color: #1A6FE8; font-size: 40px; margin-bottom: 0; }
    h2 { font-size: 28px; margin-top: 10px; }
    .name { font-size: 36px; font-weight: bold; color: #0A0E1A; margin: 30px 0; }
    .course { font-size: 24px; color: #1A6FE8; margin: 20px 0; }
    .date { color: #666; margin-top: 40px; }
    .code { font-size: 12px; color: #999; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="cert">
    <h1>CiroStack Academy</h1>
    <h2>Certificate of Completion</h2>
    <p>This certifies that</p>
    <div class="name">${userFullName}</div>
    <p>has successfully completed</p>
    <div class="course">${courseTitle}</div>
    <div class="date">Issued on ${issuedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <div class="code">Verification Code: ${verificationCode}</div>
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true });
  await browser.close();
  return Buffer.from(pdf);
}

export async function generateCertificate(
  userId: string,
  courseId: string,
  userFullName: string,
  userEmail: string,
  courseTitle: string,
): Promise<string> {
  // Check if already issued
  const existing = await db.query.certificates.findFirst({
    where: and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)),
  });
  if (existing?.pdfUrl) return existing.pdfUrl;

  const verificationCode = generateVerificationCode();
  const issuedAt = new Date();

  // Insert certificate row first
  let certId: string;
  if (existing) {
    certId = existing.id;
  } else {
    const [cert] = await db
      .insert(certificates)
      .values({ userId, courseId, verificationCode })
      .onConflictDoNothing()
      .returning({ id: certificates.id });
    if (!cert) throw new Error('Failed to insert certificate row');
    certId = cert.id;
  }

  try {
    const pdfBuffer = await renderCertificatePdf(userFullName, courseTitle, issuedAt, verificationCode);

    // Upload to S3
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { secrets } = await import('@/config/secrets.js');
    const s = secrets();
    const client = new S3Client({
      region: 'us-east-1',
      credentials: { accessKeyId: s.awsAccessKey, secretAccessKey: s.awsSecretKey },
    });
    const key = s3KeyForCertificate(userId, courseId);
    await client.send(
      new PutObjectCommand({
        Bucket: s.awsS3Bucket,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }),
    );

    const pdfUrl = `https://${s.awsS3Bucket}.s3.amazonaws.com/${key}`;

    await db
      .update(certificates)
      .set({ pdfUrl })
      .where(eq(certificates.id, certId));

    await sendCertificateEmail(userEmail, courseTitle, pdfUrl);
    return pdfUrl;
  } catch (err) {
    console.error('[certificate] PDF generation failed:', err);
    return '';
  }
}
