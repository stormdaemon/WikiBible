import { getRecentArticlesAction } from '@/app/actions';
import Link from 'next/link';

export default async function WikiPage() {
  const result = await getRecentArticlesAction(20);

  const articles = result.success && result.articles ? result.articles : [];

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
            <span className="font-bold text-lg tracking-tight">WikiBible</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/bible" className="text-sm font-medium text-secondary hover:text-primary">Bible</Link>
            <Link href="/wiki" className="text-sm font-medium text-accent">Wiki</Link>
            <Link href="/wiki/new" className="btn btn--primary text-sm">
              + Nouvel Article
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif text-primary">
            Wiki Catholique
          </h1>
        </div>

        {articles.length === 0 ? (
          <div className="card">
            <div className="card__body text-center py-12">
              <p className="text-secondary mb-4">Aucun article pour le moment</p>
              <Link href="/wiki/new" className="btn btn--primary">
                Créer le premier article
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/wiki/${article.slug}`} className="card">
                <div className="p-6">
                  <h3 className="font-serif text-lg font-bold text-primary mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Modifié le {new Date(article.updated_at || '').toLocaleDateString('fr-FR')}
                  </p>
                  <span className="text-sm font-medium text-accent hover:underline">
                    Lire l'article →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
