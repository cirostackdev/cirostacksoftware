import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://academy.cirostack.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cirostack.com/v1';

const STATIC_PAGES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/courses', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/paths', priority: 0.8, changeFrequency: 'monthly' },
] as const;

async function getCourseSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/courses?limit=500&status=published`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const courses = json.data?.items ?? json.data ?? [];
    return courses.map((c: { slug: string }) => c.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const slugs = await getCourseSlugs();
  const courseEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/courses/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...courseEntries];
}
