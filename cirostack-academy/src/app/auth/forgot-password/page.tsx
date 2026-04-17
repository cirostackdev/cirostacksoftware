'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { apiPost } from '@/lib/api/client';
import { toast } from '@/lib/store/useToastStore';

type Step = 'email' | 'sent' | 'reset' | 'success';

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-advance to reset step if ?token= is present in the URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
      setStep('reset');
    }
  }, [searchParams]);

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await apiPost('/auth/forgot-password', { email });
      setStep('sent');
    } catch {
      toast.error('Failed to send reset email. Check the address and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    if (!resetToken) { toast.error('Invalid or missing reset token. Request a new link.'); return; }
    setIsLoading(true);
    try {
      await apiPost('/auth/reset-password', { newPassword, token: resetToken });
      setStep('success');
    } catch {
      toast.error('Reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const titleMap: Record<Step, string> = {
    email: 'Reset your password',
    sent: 'Check your email',
    reset: 'Set new password',
    success: 'Password updated',
  };

  return (
    <AuthLayout title={titleMap[step]}>
      {step === 'email' && (
        <form onSubmit={sendReset} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="ada@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
            hint="We'll send a reset link to this address."
          />
          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Send reset link
          </Button>
          <Link href="/auth/login" className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] justify-center">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </form>
      )}

      {step === 'sent' && (
        <div className="text-center space-y-5">
          <div className="h-14 w-14 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto">
            <Mail className="h-7 w-7 text-[#10B981]" />
          </div>
          <div>
            <p className="text-[var(--color-text-muted)] text-sm">
              We sent a reset link to <strong className="text-[var(--color-text)]">{email}</strong>.
              Check your inbox — it expires in 30 minutes.
            </p>
          </div>
          <Button variant="outline" fullWidth onClick={() => setStep('email')}>Use a different email</Button>
        </div>
      )}

      {step === 'reset' && (
        <form onSubmit={submitReset} className="space-y-5">
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            showConditions
            required
          />
          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Update password
          </Button>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center space-y-5">
          <div className="h-14 w-14 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-7 w-7 text-[#10B981]" />
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">
            Your password has been updated. You can now sign in.
          </p>
          <Button fullWidth asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthLayout title="Reset your password"><div className="h-48" /></AuthLayout>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
