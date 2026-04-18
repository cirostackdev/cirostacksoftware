import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses',
  description:
    'Browse all CiroStack Academy courses — full-stack development, AI engineering, DevOps, and more. Hands-on projects, certificates, and real-world skills.',
  alternates: { canonical: 'https://academy.cirostack.com/courses' },
  openGraph: {
    url: 'https://academy.cirostack.com/courses',
    title: 'Courses | CiroStack Academy',
    description:
      'Browse full-stack, AI, and DevOps courses. Hands-on projects, certificates, and real-world skills.',
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
