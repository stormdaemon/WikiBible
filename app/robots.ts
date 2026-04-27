import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/auth/',
        '/profil/',
        '/moderation/',
        '/wiki/new',
        '/wiki/*/edit',
        '/bible-contributive/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
