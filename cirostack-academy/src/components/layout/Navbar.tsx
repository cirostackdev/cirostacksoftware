'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useThemeStore } from '@/lib/store/useThemeStore';
import { publicNavItems } from '@/config/nav';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center">
            <Image src="/logo.png" alt="CiroStack Academy" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-display font-bold text-[var(--color-text)] text-lg">
            CiroStack <span className="text-[#E82121]">Academy</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'text-[#E82121] bg-[#E82121]/10'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="hidden md:flex">
                Log out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Start learning</Link>
              </Button>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 flex flex-col gap-1 animate-fade-in">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2 mt-2">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="md" fullWidth>Dashboard</Button>
                </Link>
                <Button variant="ghost" size="md" fullWidth onClick={() => { logout(); setIsOpen(false); }}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="md" fullWidth>Log in</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                  <Button size="md" fullWidth>Start learning</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
