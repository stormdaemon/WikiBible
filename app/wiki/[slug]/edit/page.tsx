import { getArticleAction } from '@/app/actions';
import { notFound } from 'next/navigation';
import EditArticleForm from './EditArticleForm';

export default async function EditArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const result = await getArticleAction(params.slug);

  if (!result.success || !result.article) {
    notFound();
  }

  const article = result.article;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">WikiBible</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-primary mb-2">
            Modifier: {article.title}
          </h1>
          <p className="text-secondary">
            Créez une nouvelle révision de cet article
          </p>
        </div>

        <EditArticleForm article={article} />
      </div>
    </main>
  );
}
