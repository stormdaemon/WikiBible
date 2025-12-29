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
            <Link href="/bible" className="text-sm font-medium text-accent">Bible</Link>
            <Link href="/wiki" className="text-sm font-medium text-secondary hover:text-primary">Wiki</Link>
          </nav>
        </div>
      </header>

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
                href={`/bible/${book.id}/1`}
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
                href={`/bible/${book.id}/1`}
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
