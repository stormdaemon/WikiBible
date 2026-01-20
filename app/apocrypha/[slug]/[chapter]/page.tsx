import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChapterNavigation } from '@/components/ChapterNavigation';
import { ApocryphaVerseClientWrapper } from '@/components/ApocryphaVerseClientWrapper';
import { VerseAnchorScroll } from '@/components/VerseAnchorScroll';

export const dynamic = 'force-dynamic';

interface ApocryphaChapterPageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export default async function ApocryphaChapterPage({ params }: ApocryphaChapterPageProps) {
  const { slug, chapter: chapterStr } = await params;
  const chapter = parseInt(chapterStr);
  const supabase = await createClient();

  // Récupérer le livre
  const { data: book } = await supabase
    .from('apocryphal_books')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!book) {
    notFound();
  }

  // Récupérer les versets du chapitre spécifique
  const { data: verses } = await supabase
    .from('apocryphal_verses')
    .select('*')
    .eq('book_id', book.id)
    .eq('chapter', chapter)
    .order('verse', { ascending: true });

  if (!verses || verses.length === 0) {
    return <div className="text-center py-12 text-danger">Chapitre non trouvé</div>;
  }

  // Vérifier l'authentification
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <main className="min-h-screen">
      {/* Gestion du scroll vers l'ancre de verset */}
      <VerseAnchorScroll />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li><Link href="/apocrypha" className="text-secondary hover:text-primary">Apocryphes</Link></li>
            <li><span className="text-slate-300">/</span></li>
            <li><Link href={`/apocrypha/${slug}`} className="text-secondary hover:text-primary">{book.name_fr}</Link></li>
            <li><span className="text-slate-300">/</span></li>
            <li><span className="text-primary">Chapitre {chapter}</span></li>
          </ol>
        </nav>

        {/* Title */}
        <h1 className="text-4xl font-serif text-primary mb-2">
          {book.name_fr}
        </h1>

        <p className="text-lg text-slate-600 mb-4">
          {book.name}
        </p>

        {book.description_fr && (
          <p className="text-slate-700 mb-4">
            {book.description_fr}
          </p>
        )}

        <h2 className="text-2xl font-serif text-primary mb-6">Chapitre {chapter}</h2>

        {/* Chapter Navigation en haut */}
        <div className="mb-6 pb-4 border-b border-border">
          <ChapterNavigation
            bookId={book.id}
            bookSlug={slug}
            chapter={chapter}
            totalChapters={book.chapters || 1}
            basePath="/apocrypha"
          />
        </div>

        {/* Verses */}
        <ApocryphaVerseClientWrapper
          verses={verses}
          bookName={book.name_fr}
          isAuthenticated={isAuthenticated}
        />

        {/* Chapter Navigation en bas */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-bold text-primary mb-4">Navigation</h3>
          <ChapterNavigation
            bookId={book.id}
            bookSlug={slug}
            chapter={chapter}
            totalChapters={book.chapters || 1}
            basePath="/apocrypha"
          />
        </div>
      </div>
    </main>
  );
}
