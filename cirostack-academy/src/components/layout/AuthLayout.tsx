import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center">
              <Image src="/logo.png" alt="CiroStack Academy" width={40} height={40} className="object-contain" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--color-text)]">
              CiroStack <span className="text-[#E82121]">Academy</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
          )}
        </div>

        {/* Form card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
