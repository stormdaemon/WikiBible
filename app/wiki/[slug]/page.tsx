import { getArticleAction } from '@/app/actions';
import { parseWikiLinks } from '@/lib/wiki-parser';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const result = await getArticleAction(params.slug);

  if (!result.success || !result.article) {
    notFound();
  }

  const article = result.article;
  const currentRevision = Array.isArray(article.wiki_revisions)
    ? article.wiki_revisions[0]
    : article.wiki_revisions;

  const contentWithLinks = currentRevision?.content
    ? parseWikiLinks(currentRevision.content)
    : '';

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">WikiCatholic</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/bible" className="text-sm font-medium text-secondary hover:text-primary">Bible</Link>
            <Link href="/wiki" className="text-sm font-medium text-secondary hover:text-primary">Wiki</Link>
            <Link href={`/wiki/${article.slug}/edit`} className="btn btn--primary text-sm">
              Modifier
            </Link>
          </nav>
        </div>
      </header>

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
          {currentRevision?.comment && (
            <>
              <span>•</span>
              <span>{currentRevision.comment}</span>
            </>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: contentWithLinks }}
        />

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
