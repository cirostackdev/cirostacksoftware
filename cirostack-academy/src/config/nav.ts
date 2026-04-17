import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  isHeader?: boolean;
  badge?: string;
}

// Public navbar links
export const publicNavItems = [
  { label: 'Courses', href: '/courses' },
  { label: 'Paths', href: '/paths' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

// Student dashboard sidebar
export const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Learning', href: '/dashboard/learning' },
  { label: 'Certificates', href: '/dashboard/certificates' },
  { label: 'My Projects', href: '/dashboard/projects' },
  { label: 'Prompt Library', href: '/dashboard/prompts' },
  { label: 'Leaderboard', href: '/dashboard/leaderboard' },
  { label: 'Settings', href: '/dashboard/settings' },
];

// Instructor sidebar
export const instructorNavItems: NavItem[] = [
  { label: 'Overview', href: '/instructor' },
  { label: 'My Courses', href: '/instructor/courses' },
  { label: 'Submissions', href: '/instructor/submissions' },
  { label: 'Analytics', href: '/instructor/analytics/select' },
];

// Admin sidebar
export const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Courses', href: '/admin/courses' },
  { label: 'Promo Codes', href: '/admin/promos' },
  { label: 'Talent Pipeline', href: '/admin/talent' },
];

export const PAGE_TITLE_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/learning': 'My Learning',
  '/dashboard/certificates': 'My Certificates',
  '/dashboard/projects': 'My Projects',
  '/dashboard/prompts': 'Prompt Library',
  '/dashboard/leaderboard': 'Leaderboard',
  '/dashboard/settings': 'Account Settings',
  '/billing': 'Billing',
  '/instructor': 'Overview',
  '/instructor/courses': 'My Courses',
  '/instructor/submissions': 'Ship It Submissions',
  '/admin': 'Platform Overview',
  '/admin/users': 'User Management',
  '/admin/courses': 'Course Management',
  '/admin/promos': 'Promo Codes',
  '/admin/talent': 'Talent Pipeline',
};

export function getPageTitle(pathname: string): string {
  if (PAGE_TITLE_MAP[pathname]) return PAGE_TITLE_MAP[pathname];
  const match = Object.keys(PAGE_TITLE_MAP)
    .filter((key) => pathname.startsWith(key) && key !== '/')
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLE_MAP[match] : 'Academy';
}

export const CATEGORY_LABELS: Record<string, string> = {
  ui_ux: 'UI/UX Design',
  web_dev: 'Web Development',
  mobile: 'Mobile (Flutter)',
  ai_ml: 'AI & ML',
  cloud_devops: 'Cloud & DevOps',
  architecture: 'Software Architecture',
  startups: 'Startup & Product',
};

export const LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const;
