import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/instructor/', '/api/', '/learn/'],
      },
    ],
    sitemap: 'https://academy.cirostack.com/sitemap.xml',
    host: 'https://academy.cirostack.com',
  };
}
