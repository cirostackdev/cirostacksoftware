import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { certificates } from '@/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { getDownloadUrl, s3KeyForCertificate } from '@/services/s3.js';

export const certificatesRouter = Router();

certificatesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const certs = await db.query.certificates.findMany({
      where: eq(certificates.userId, req.user!.sub),
      with: { course: { columns: { id: true, title: true, thumbnailUrl: true } } },
    });
    res.json({ data: certs });
  } catch (err) {
    next(err);
  }
});

certificatesRouter.get('/verify/:code', async (req, res, next) => {
  try {
    const cert = await db.query.certificates.findFirst({
      where: eq(certificates.verificationCode, req.params.code),
      with: {
        user: { columns: { id: true, fullName: true, username: true } },
        course: { columns: { id: true, title: true, thumbnailUrl: true } },
      },
    });
    if (!cert) throw new AppError(404, 'Certificate not found');
    res.json({ data: cert });
  } catch (err) {
    next(err);
  }
});

certificatesRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const cert = await db.query.certificates.findFirst({
      where: and(eq(certificates.id, req.params.id), eq(certificates.userId, req.user!.sub)),
      with: { course: { columns: { id: true, title: true } } },
    });
    if (!cert) throw new AppError(404, 'Certificate not found');
    res.json({ data: cert });
  } catch (err) {
    next(err);
  }
});

certificatesRouter.get('/:id/download', requireAuth, async (req, res, next) => {
  try {
    const cert = await db.query.certificates.findFirst({
      where: and(eq(certificates.id, req.params.id), eq(certificates.userId, req.user!.sub)),
    });
    if (!cert) throw new AppError(404, 'Certificate not found');

    const key = s3KeyForCertificate(cert.userId, cert.courseId);
    const url = await getDownloadUrl(key, 300);
    res.json({ data: { url } });
  } catch (err) {
    next(err);
  }
});
