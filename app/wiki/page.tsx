import { getRecentArticlesAction } from '@/app/actions';
import Link from 'next/link';

export default async function WikiPage() {
  const result = await getRecentArticlesAction(20);

  const articles = result.success && result.articles ? result.articles : [];

  return (
    <main className="min-h-screen">


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
