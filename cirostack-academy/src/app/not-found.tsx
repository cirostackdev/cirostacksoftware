import Link from 'next/link';
import { Zap } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center mb-6">
        <Zap className="h-8 w-8 text-white" />
      </div>
      <h1 className="font-display text-6xl font-bold text-[var(--color-text)] mb-3">404</h1>
      <p className="text-xl text-[var(--color-text-muted)] mb-2">Page not found</p>
      <p className="text-[var(--color-text-subtle)] max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    </div>
  );
}
