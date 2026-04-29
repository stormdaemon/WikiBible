import type { Metadata } from 'next';
import { getBookAction, getChapterAction } from '@/app/actions';
import Link from 'next/link';
import { ChapterContentContributiveWrapper } from '@/components/ChapterContentContributiveWrapper';
import { ChapterNavigation } from '@/components/ChapterNavigation';
import { VerseAnchorScroll } from '@/components/VerseAnchorScroll';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Bible Contributive',
  robots: {
    index: false,
    follow: false,
  },
};

const COMMUNITY_TRANSLATIONS = [
  { id: 'osty', name: 'Bible Osty' },
  { id: 'liturgique', name: 'Traduction Liturgique' },
  { id: 'tob', name: 'Bible Tob' },
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
            translation={translation}
          />
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
            translation={translation}
          />
        </div>
      </div>
    </main>
  );
}
