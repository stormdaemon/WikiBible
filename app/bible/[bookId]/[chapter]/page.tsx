import { getBookAction, getChapterAction } from '@/app/actions';
import Link from 'next/link';
import { ChapterContentWrapper } from '@/components/ChapterContentWrapper';
import { ChapterNavigation } from '@/components/ChapterNavigation';
import { VerseAnchorScroll } from '@/components/VerseAnchorScroll';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
// Note: revalidate est retiré car dynamic='force-dynamic' le rend inutile


export default async function ChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string; chapter: string }>;
  searchParams: Promise<{ translation?: string }>;
}) {
  const { bookId, chapter: chapterStr } = await params;
  const { translation = 'crampon' } = await searchParams;
  const chapter = parseInt(chapterStr);

  // Valider que la traduction est correcte
  const validTranslation: 'crampon' | 'jerusalem' = (translation === 'jerusalem' || translation === 'crampon')
    ? translation as 'crampon' | 'jerusalem'
    : 'crampon';

  const [bookResult, chapterResult] = await Promise.all([
    getBookAction(bookId),
    getChapterAction(bookId, chapter, validTranslation),
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
  const currentUserId = user?.id;

  return (
    <main className="min-h-screen">
      {/* Gestion du scroll vers l'ancre de verset */}
      <VerseAnchorScroll />

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
        <h1 className="text-4xl font-serif text-primary mb-4">
          {book.name} - Chapitre {chapter}
        </h1>

        {/* Chapter Navigation en haut */}
        <div className="mb-6 pb-4 border-b border-border">
          <ChapterNavigation
            bookId={book.id}
            bookSlug={bookId}
            chapter={chapter}
            totalChapters={book.chapters}
            basePath="/bible"
          />
        </div>

        {/* Navigation précédent/suivant */}
        <div className="flex justify-between items-center mb-8">
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
        <ChapterContentWrapper
          bookName={book.name}
          bookId={book.id}
          bookSlug={bookId}
          chapter={chapter}
          verses={verses}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          initialTranslation={validTranslation}
        />

        {/* Chapter Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-bold text-primary mb-4">Navigation</h3>
          <ChapterNavigation
            bookId={book.id}
            bookSlug={bookId}
            chapter={chapter}
            totalChapters={book.chapters}
            basePath="/bible"
          />
        </div>
      </div>
    </main>
  );
}
