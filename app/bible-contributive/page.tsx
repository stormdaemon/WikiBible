import type { Metadata } from 'next';
import { getBooksAction } from '@/app/actions';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Bible Contributive',
  description: 'Espace de contribution pour compléter les traductions communautaires de WikiBible.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BibleContributivePage() {
  const result = await getBooksAction();

  if (!result.success || !result.books) {
    return <div className="text-center py-12 text-danger">Erreur lors du chargement des livres</div>;
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-primary mb-4">
            Bible Contributive
          </h1>
          <p className="text-secondary text-lg">
            Traductions communautaires participatives
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge badge--accent">Osty</span>
            <span className="badge badge--accent">Liturgique</span>
            <span className="badge badge--accent">Tob</span>
            <span className="badge badge--accent">Hébreu</span>
            <span className="badge badge--accent">Latin</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.books.map(book => (
            <a
              key={book.id}
              href={`/bible-contributive/${book.slug}/1`}
              className="card card--clickable hover:border-accent transition-colors"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-lg font-bold text-primary">
                    {book.name}
                  </h3>
                  {book.is_deuterocanonical && (
                    <span className="badge badge--accent text-xs">Deutérocanonique</span>
                  )}
                </div>
                <p className="text-sm text-secondary mb-2">{book.name_en}</p>
                <p className="text-xs text-slate-400">{book.chapters} chapitres</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
