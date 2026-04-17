'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';
import Button from '@/components/ui/Button';
import CertificateCard from '@/components/dashboard/CertificateCard';
import Skeleton from '@/components/ui/Skeleton';
import { apiGet } from '@/lib/api/client';
import type { Certificate } from '@/types';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<Certificate[]>('/certificates')
      .then(setCertificates)
      .catch(() => setCertificates([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="h-16 w-16 rounded-full bg-[#E82121]/10 flex items-center justify-center mx-auto mb-5">
          <Award className="h-8 w-8 text-[#E82121]" />
        </div>
        <h3 className="font-display text-xl font-semibold text-[var(--color-text)] mb-2">
          No certificates yet
        </h3>
        <p className="text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto">
          Complete a course to earn your first CiroStack Academy certificate.
        </p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/learning">Continue learning</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <p className="text-[var(--color-text-muted)] mb-6">
        {certificates.length} certificate{certificates.length > 1 ? 's' : ''} earned
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <CertificateCard key={cert.id} certificate={cert} />
        ))}
      </div>
    </div>
  );
}
