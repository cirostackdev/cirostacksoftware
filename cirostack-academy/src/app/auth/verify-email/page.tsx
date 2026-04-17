'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { apiPost, apiGet } from '@/lib/api/client';
import { toast } from '@/lib/store/useToastStore';

function VerifyEmailContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle URL-based token verification (from email link click)
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;
    apiGet(`/auth/verify-email/${token}`)
      .then(() => setIsVerified(true))
      .catch(() => toast.error('Verification link is invalid or expired.'));
  }, [searchParams]);

  const handleChange = (idx: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    // Auto-focus next box
    if (digit && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...otp];
    digits.forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtp(next);
    // Focus the box after the last pasted digit
    const lastIdx = Math.min(digits.length, 5);
    inputRefs.current[lastIdx]?.focus();
  };

  const submitOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Enter all 6 digits.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiPost('/auth/verify-email', { otp: code });
      setIsVerified(true);
      toast.success('Email verified!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code. Check and try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendEmail = async () => {
    setIsResending(true);
    try {
      await apiPost('/auth/resend-verification', {});
      toast.success('New verification code sent!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <AuthLayout title="Email verified!">
        <div className="text-center space-y-5">
          <div className="h-14 w-14 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-7 w-7 text-[#10B981]" />
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">
            Your email is confirmed. Let&apos;s set up your profile.
          </p>
          <Button fullWidth onClick={() => router.push('/auth/onboarding')}>
            Continue
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Check your email"
      subtitle={`Enter the 6-digit code we sent to ${user?.email ?? 'your email'}`}
    >
      <div className="space-y-6">
        <div className="h-14 w-14 rounded-full bg-[#E82121]/10 flex items-center justify-center mx-auto">
          <Mail className="h-7 w-7 text-[#E82121]" />
        </div>

        {/* OTP input boxes */}
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 rounded-xl border-2 text-center text-xl font-bold text-[var(--color-text)] bg-[var(--color-surface)] transition-colors focus:outline-none focus:border-[#E82121] border-[var(--color-border-2)] caret-transparent"
            />
          ))}
        </div>

        <Button
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          onClick={submitOtp}
          disabled={otp.join('').length < 6}
        >
          Verify email
        </Button>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={resendEmail}
            disabled={isResending}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
          >
            {isResending
              ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />}
            Resend code
          </button>
          <Link
            href="/dashboard"
            className="text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] transition-colors"
          >
            Skip for now (limited access)
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthLayout title="Verify your email"><div className="h-48" /></AuthLayout>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
