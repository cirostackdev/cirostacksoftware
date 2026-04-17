'use client';

import { Download, Share2, ExternalLink, Award } from 'lucide-react';
import type { Certificate } from '@/types';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface Props {
  certificate: Certificate;
  className?: string;
}

export default function CertificateCard({ certificate, className }: Props) {
  const course = certificate.course;
  const issueDate = new Date(certificate.issuedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const shareToLinkedIn = () => {
    const url = `https://academy.cirostack.com/certificates/verify/${certificate.verificationCode}`;
    const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedIn, '_blank');
  };

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Certificate preview */}
      <div className="aspect-[4/3] bg-gradient-to-br from-[#E82121]/5 via-[var(--color-surface-2)] to-[#7C3AED]/5 flex flex-col items-center justify-center gap-3 border-b border-[var(--color-border)]">
        <div className="h-14 w-14 rounded-full bg-[#E82121]/10 flex items-center justify-center">
          <Award className="h-7 w-7 text-[#E82121]" />
        </div>
        <div className="text-center px-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Certificate of Completion</p>
          <h3 className="font-display font-semibold text-sm text-[var(--color-text)] line-clamp-2">
            {course?.title ?? 'Course'}
          </h3>
        </div>
        <p className="text-xs text-[var(--color-text-subtle)]">{issueDate}</p>
      </div>

      {/* Actions */}
      <div className="p-4 flex flex-col gap-2">
        <p className="text-xs text-[var(--color-text-muted)] font-mono">
          ID: {certificate.verificationCode}
        </p>
        <div className="flex gap-2">
          {certificate.pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={() => window.open(certificate.pdfUrl!, '_blank')}
              className="flex-1"
            >
              PDF
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share2 className="h-3.5 w-3.5" />}
            onClick={shareToLinkedIn}
            className="flex-1"
          >
            LinkedIn
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/certificates/verify/${certificate.verificationCode}`, '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
