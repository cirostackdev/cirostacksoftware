import { clsx, type ClassValue } from 'clsx';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format seconds as "4h 23m" or "12m" */
export function formatDuration(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (hrs === 0) return `${mins}m`;
  if (remainMins === 0) return `${hrs}h`;
  return `${hrs}h ${remainMins}m`;
}

/** Format price in NGN or USD */
export function formatPrice(amount: number, currency: 'NGN' | 'USD'): string {
  if (currency === 'NGN') {
    // amount is in kobo
    const naira = amount / 100;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(naira);
  }
  // amount is in cents
  const dollars = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(dollars);
}

/** Compute XP level from total XP */
export function xpToLevel(xpTotal: number): number {
  return Math.floor(xpTotal / 500) + 1;
}

/** XP needed to reach next level */
export function xpToNextLevel(xpTotal: number): number {
  const level = xpToLevel(xpTotal);
  return level * 500 - xpTotal;
}

/** Get user's initials for avatar fallback */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Truncate text to n chars */
export function truncate(text: string, n: number): string {
  return text.length > n ? `${text.slice(0, n)}…` : text;
}

/** Relative time (e.g. "2 days ago") */
export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/** Get pastel bg/text color pair for a course category */
export function getCategoryColor(category: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    web_dev:      { bg: '#BDE7FF', text: '#1A5276' },
    ui_ux:        { bg: '#E5D0FF', text: '#4A1D8C' },
    mobile:       { bg: '#FFC8E4', text: '#7B1447' },
    ai_ml:        { bg: '#FFECC8', text: '#7B4B00' },
    cloud_devops: { bg: '#C8FFDF', text: '#0D5F27' },
    architecture: { bg: '#FFE8C8', text: '#7B3F00' },
    startups:     { bg: '#FFD6D6', text: '#7B0000' },
  };
  return map[category] ?? { bg: '#F7F1E8', text: '#2A2420' };
}

/** Slugify a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
