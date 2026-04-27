import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/utils/supabase/server';
import { absoluteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/bible'), lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: absoluteUrl('/wiki'), lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: absoluteUrl('/apocrypha'), lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'yearly', priority: 0.35 },
    { url: absoluteUrl('/mentions-legales'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [{ data: bibleBooks }, { data: wikiArticles }, { data: apocryphalBooks }] = await Promise.all([
    supabase
      .from('bible_books')
      .select('slug, chapters, created_at')
      .not('slug', 'is', null)
      .order('position'),
    supabase
      .from('wiki_articles')
      .select('slug, updated_at, created_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false }),
    supabase
      .from('apocryphal_books')
      .select('slug, chapters, created_at')
      .order('slug'),
  ]);

  const bibleRoutes: MetadataRoute.Sitemap = (bibleBooks || []).flatMap((book) => {
    const chapters = Number(book.chapters || 0);
    return Array.from({ length: chapters }, (_, index) => ({
      url: absoluteUrl(`/bible/${book.slug}/${index + 1}`),
      lastModified: book.created_at ? new Date(book.created_at) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  });

  const wikiRoutes: MetadataRoute.Sitemap = (wikiArticles || []).map((article) => ({
    url: absoluteUrl(`/wiki/${article.slug}`),
    lastModified: article.updated_at || article.created_at ? new Date(article.updated_at || article.created_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const apocryphaRoutes: MetadataRoute.Sitemap = (apocryphalBooks || []).flatMap((book) => {
    const chapters = Number(book.chapters || 0);
    const bookRoute = {
      url: absoluteUrl(`/apocrypha/${book.slug}`),
      lastModified: book.created_at ? new Date(book.created_at) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    };
    const chapterRoutes = Array.from({ length: chapters }, (_, index) => ({
      url: absoluteUrl(`/apocrypha/${book.slug}/${index + 1}`),
      lastModified: book.created_at ? new Date(book.created_at) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.55,
    }));
    return [bookRoute, ...chapterRoutes];
  });

  return [
    ...staticRoutes,
    ...bibleRoutes,
    ...wikiRoutes,
    ...apocryphaRoutes,
  ];
}
