import { createPublicClient } from '@/utils/supabase/server';
import { WikiContent } from '@/components/WikiContent';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Configuration pour forcer le rendu dynamique (pas de cache)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .rpc('get_wiki_article_by_slug', { p_slug: slug });

  if (error || !data || data.length === 0) {
    console.error('[ArticlePage] Error:', error);
    notFound();
  }

  const article = data[0];

  // Parser wiki_revisions si c'est une chaîne JSON
  if (typeof article.wiki_revisions === 'string') {
    try {
      article.wiki_revisions = JSON.parse(article.wiki_revisions);
    } catch (e) {
      console.error('[ArticlePage] Error parsing wiki_revisions:', e);
      article.wiki_revisions = [];
    }
  }

  const currentRevision = Array.isArray(article.wiki_revisions)
    ? article.wiki_revisions[0]
    : article.wiki_revisions;

  return (
    <main className="min-h-screen">
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li><Link href="/wiki" className="text-secondary hover:text-primary">Wiki</Link></li>
            <li><span className="text-slate-300">/</span></li>
            <li><span className="text-accent font-medium">{article.title}</span></li>
          </ol>
        </nav>

        {/* Title */}
        <h1 className="text-5xl font-serif text-primary mb-8">
          {article.title}
        </h1>

        {/* Meta */}
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

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {currentRevision?.content ? (
            <WikiContent content={currentRevision.content} />
          ) : (
            <p className="text-gray-500 italic">Contenu non disponible</p>
          )}
        </div>

        {/* Actions */}
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
