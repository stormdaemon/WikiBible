import { getBookAction, getChapterAction } from '@/app/actions';
import Link from 'next/link';
import { ChapterContent } from '@/components/ChapterContent';
import { createClient } from '@/utils/supabase/server';

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ bookId: string; chapter: string }>;
}) {
  const { bookId, chapter: chapterStr } = await params;
  const chapter = parseInt(chapterStr);

  const [bookResult, chapterResult] = await Promise.all([
    getBookAction(bookId),
    getChapterAction(bookId, chapter),
  ]);

  if (!bookResult.success || !chapterResult.success || !bookResult.book || !chapterResult.verses) {
    return <div className="text-center py-12 text-danger">Chapitre non trouvé</div>;
  }

  const book = bookResult.book;
  const verses = chapterResult.verses;

  // Vérifier l'authentification
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <main className="min-h-screen">
      {/* Header */}


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
        <ChapterContent
          bookName={book.name}
          bookId={book.id}
          bookSlug={bookId}
          chapter={chapter}
          verses={verses}
          isAuthenticated={isAuthenticated}
        />

        {/* Chapter Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-bold text-primary mb-4">Chapitres</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
              <Link
                key={ch}
                href={`/bible/${bookId}/${ch}`}
                className={`px-3 py-2 rounded text-sm ${ch === chapter
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
