import { getBooksAction } from '@/app/actions';
import Link from 'next/link';

export default async function BiblePage() {
  const result = await getBooksAction();

  if (!result.success || !result.books) {
    return <div className="text-center py-12 text-danger">Erreur lors du chargement des livres</div>;
  }

  const oldTestament = result.books.filter(book => book.testament === 'old');
  const newTestament = result.books.filter(book => book.testament === 'new');

  return (
    <main className="min-h-screen">
      {/* Header */}


      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif text-primary mb-8">
          La Bible Catholique
        </h1>

        {/* Ancien Testament */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-primary">Ancien Testament</h2>
            <span className="badge badge--accent">46 livres</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oldTestament.map(book => (
              <Link
                key={book.id}
                href={`/bible/${book.slug}/1`}
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
              </Link>
            ))}
          </div>
        </section>

        {/* Nouveau Testament */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-primary">Nouveau Testament</h2>
            <span className="badge badge--accent">27 livres</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newTestament.map(book => (
              <Link
                key={book.id}
                href={`/bible/${book.slug}/1`}
                className="card card--clickable hover:border-accent transition-colors"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-lg font-bold text-primary">
                      {book.name}
                    </h3>
                  </div>
                  <p className="text-sm text-secondary mb-2">{book.name_en}</p>
                  <p className="text-xs text-slate-400">{book.chapters} chapitres</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
