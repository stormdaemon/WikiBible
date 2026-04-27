import type { Metadata } from 'next';
import { createPublicClient } from '@/utils/supabase/server';
import { WikiContent } from '@/components/WikiContent';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DEFAULT_OG_IMAGE, JsonLd, absoluteUrl, breadcrumbJsonLd, truncateDescription } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getArticle(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc('get_wiki_article_by_slug', { p_slug: slug });

  if (error || !data || data.length === 0) {
    return null;
  }

  const article = data[0];
  if (typeof article.wiki_revisions === 'string') {
    try {
      article.wiki_revisions = JSON.parse(article.wiki_revisions);
    } catch {
      article.wiki_revisions = [];
    }
  }

  return article;
}

function getCurrentRevision(article: any) {
  return Array.isArray(article.wiki_revisions)
    ? article.wiki_revisions[0]
    : article.wiki_revisions;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Article non trouvé',
      robots: { index: false, follow: false },
    };
  }

  const currentRevision = getCurrentRevision(article);
  const description = truncateDescription(
    currentRevision?.content || `Article encyclopédique catholique sur ${article.title}.`
  );
  const canonical = `/wiki/${article.slug}`;

  return {
    title: article.title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${article.title} | WikiBible`,
      description,
      url: absoluteUrl(canonical),
      type: 'article',
      publishedTime: article.created_at || undefined,
      modifiedTime: article.updated_at || undefined,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${article.title} - WikiBible`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const currentRevision = getCurrentRevision(article);
  const description = truncateDescription(
    currentRevision?.content || `Article encyclopédique catholique sur ${article.title}.`
  );

  return (
    <main className="min-h-screen">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Accueil', url: '/' },
            { name: 'Wiki', url: '/wiki' },
            { name: article.title, url: `/wiki/${article.slug}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description,
            datePublished: article.created_at,
            dateModified: article.updated_at || article.created_at,
            mainEntityOfPage: absoluteUrl(`/wiki/${article.slug}`),
            publisher: {
              '@type': 'Organization',
              name: 'WikiBible',
              logo: {
                '@type': 'ImageObject',
                url: DEFAULT_OG_IMAGE,
              },
            },
          },
        ]}
      />
      <article className="max-w-4xl mx-auto px-6 py-12">
        <nav className="flex mb-8 text-sm">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li><Link href="/wiki" className="text-secondary hover:text-primary">Wiki</Link></li>
            <li><span className="text-slate-300">/</span></li>
            <li><span className="text-accent font-medium">{article.title}</span></li>
          </ol>
        </nav>

        <h1 className="text-5xl font-serif text-primary mb-8">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border text-sm text-secondary">
          <span>Créé le {new Date(article.created_at || '').toLocaleDateString('fr-FR')}</span>
          <span>•</span>
          <span>Modifié le {new Date(article.updated_at || '').toLocaleDateString('fr-FR')}</span>
          {currentRevision?.comment && currentRevision.comment !== 'Initial version' && (
            <>
              <span>•</span>
              <span>{currentRevision.comment}</span>
            </>
          )}
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          {currentRevision?.content ? (
            <WikiContent content={currentRevision.content} />
          ) : (
            <p className="text-gray-500 italic">Contenu non disponible</p>
          )}
        </div>

        <div className="flex gap-4 pt-8 border-t border-border">
          <Link href={`/wiki/${article.slug}/edit`} className="btn btn--primary">
            Modifier cet article
          </Link>
          <Link href={`/wiki/${article.slug}/history`} className="btn btn--secondary">
            Voir l'historique
          </Link>
        </div>
      </article>
    </main>
  );
}
