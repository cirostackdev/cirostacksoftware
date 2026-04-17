'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from '@/lib/store/useToastStore';
import { apiPost } from '@/lib/api/client';
import type { User } from '@/types';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setIsGoogleLoading(true);
    try {
      const res = await apiPost<{ user: User; accessToken: string }>('/auth/google', { idToken: credential });
      login(res.user, res.accessToken);
      toast.success(`Welcome, ${res.user.fullName.split(' ')[0]}!`);
      router.push(redirect);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed. Try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [login, redirect, router]);

  const initGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => handleGoogleCredential(response.credential),
    });
  }, [handleGoogleCredential]);

  useEffect(() => {
    if (window.google) initGoogle();
  }, [initGoogle]);

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
      return;
    }
    if (!window.google) {
      toast.error('Google sign-in is loading. Please try again in a moment.');
      return;
    }
    window.google.accounts.id.prompt();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      const res = await apiPost<{ user: User; accessToken: string }>('/auth/login', { email, password });
      login(res.user, res.accessToken);
      toast.success(`Welcome back, ${res.user.fullName.split(' ')[0]}!`);
      router.push(redirect);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid email or password');
      setErrors({ password: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
          onLoad={initGoogle}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="ada@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          autoComplete="email"
        />

        <div>
          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            required
          />
          <div className="flex justify-end mt-1.5">
            <Link href="/auth/forgot-password" className="text-xs text-[#E82121] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Sign in
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--color-bg)] px-3 text-[var(--color-text-muted)]">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isGoogleLoading}
          className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors text-sm font-medium text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <div className="h-4 w-4 border-2 border-[var(--color-border)] border-t-[#4285F4] rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </button>

        <p className="text-center text-sm text-[var(--color-text-muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#E82121] font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout title="Sign in" subtitle="Good to have you back.">
      <Suspense fallback={<div className="h-48" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
