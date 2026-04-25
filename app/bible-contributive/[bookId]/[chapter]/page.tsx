import { getBookAction, getChapterAction } from '@/app/actions';
import Link from 'next/link';
import { ChapterContentContributiveWrapper } from '@/components/ChapterContentContributiveWrapper';
import { ChapterNavigation } from '@/components/ChapterNavigation';
import { VerseAnchorScroll } from '@/components/VerseAnchorScroll';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const COMMUNITY_TRANSLATIONS = [
  { id: 'osty', name: 'Bible Osty' },
  { id: 'liturgique', name: 'Traduction Liturgique' },
  { id: 'tob', name: 'Bible Tob' },
  { id: 'vulgate', name: 'Vulgate' },
  { id: 'hebreu', name: 'Texte Hébreu' },
  { id: 'latin', name: 'Texte Latin' },
] as const;

export default async function ContributiveChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string; chapter: string }>;
  searchParams: Promise<{ translation?: string }>;
}) {
  const { bookId, chapter: chapterStr } = await params;
  const { translation = 'osty' } = await searchParams;
  const chapter = parseInt(chapterStr);

  const [bookResult, chapterResult] = await Promise.all([
    getBookAction(bookId),
    getChapterAction(bookId, chapter, translation),
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
      {/* Gestion du scroll vers l'ancre de verset */}
      <VerseAnchorScroll />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li><Link href="/bible-contributive" className="text-secondary hover:text-primary">Bible Contributive</Link></li>
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
            basePath="/bible-contributive"
          />
        </div>

        {/* Navigation précédent/suivant */}
        <div className="flex justify-between items-center mb-8">
          {chapter > 1 ? (
            <Link
              href={`/bible-contributive/${bookId}/${chapter - 1}`}
              className="btn btn--secondary"
            >
              ← Chapitre précédent
            </Link>
          ) : (
            <div></div>
          )}

          {chapter < book.chapters ? (
            <Link
              href={`/bible-contributive/${bookId}/${chapter + 1}`}
              className="btn btn--primary"
            >
              Chapitre suivant →
            </Link>
          ) : (
            <div></div>
          )}
        </div>

        {/* Verses */}
        <ChapterContentContributiveWrapper
          bookName={book.name}
          bookId={book.id}
          bookSlug={bookId}
          chapter={chapter}
          verses={verses}
          isAuthenticated={isAuthenticated}
          initialTranslation={translation}
          translations={COMMUNITY_TRANSLATIONS}
        />

        {/* Chapter Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-bold text-primary mb-4">Navigation</h3>
          <ChapterNavigation
            bookId={book.id}
            bookSlug={bookId}
            chapter={chapter}
            totalChapters={book.chapters}
            basePath="/bible-contributive"
          />
        </div>
      </div>
    </main>
  );
}
