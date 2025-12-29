import { getBookAction, getChapterAction } from '@/app/actions';
import Link from 'next/link';

export default async function ChapterPage({
  params,
}: {
  params: { bookId: string; chapter: string };
}) {
  const bookId = params.bookId;
  const chapter = parseInt(params.chapter);

  const [bookResult, chapterResult] = await Promise.all([
    getBookAction(bookId),
    getChapterAction(bookId, chapter),
  ]);

  if (!bookResult.success || !chapterResult.success || !bookResult.book || !chapterResult.verses) {
    return <div className="text-center py-12 text-danger">Chapitre non trouvé</div>;
  }

  const book = bookResult.book;
  const verses = chapterResult.verses;

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

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li><Link href="/bible" className="text-secondary hover:text-primary">Bible</Link></li>
            <li><span className="text-slate-300">/</span></li>
            <li><span className="text-accent font-medium">{book.name}</span></li>
            <li><span className="text-slate-300">/</span></li>
            <li><span className="text-primary">Chapitre {chapter}</span></li>
          </ol>
        </nav>

        {/* Title */}
        <h1 className="text-4xl font-serif text-primary mb-8">
          {book.name} - Chapitre {chapter}
        </h1>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
          {chapter > 1 ? (
            <Link
              href={`/bible/${bookId}/${chapter - 1}`}
              className="btn btn--secondary"
            >
              ← Chapitre précédent
            </Link>
          ) : (
            <div></div>
          )}

          {chapter < book.chapters ? (
            <Link
              href={`/bible/${bookId}/${chapter + 1}`}
              className="btn btn--primary"
            >
              Chapitre suivant →
            </Link>
          ) : (
            <div></div>
          )}
        </div>

        {/* Verses */}
        <div className="space-y-6">
          {verses.map((verse) => (
            <div key={verse.id} className="verse-card verse-card--accent">
              <div className="verse-card__header">
                <span className="verse-card__reference">
                  {book.name} {chapter}:{verse.verse}
                </span>
                <div className="verse-card__actions">
                  <button className="text-secondary hover:text-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 7v9l5-5-5-5z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="verse-card__text">
                "{verse.text}"
              </p>
              <div className="verse-card__meta">
                <span className="badge badge--default">Bible Crampon</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chapter Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-bold text-primary mb-4">Chapitres</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
              <Link
                key={ch}
                href={`/bible/${bookId}/${ch}`}
                className={`px-3 py-2 rounded text-sm ${
                  ch === chapter
                    ? 'bg-accent text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ch}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
