import type { Metadata } from 'next';
import { getBookAction, getBooksAction, getChapterAction, getOfficialBibleTranslationsAction } from '@/app/actions';
import { BiblePathSelector } from '@/components/BiblePathSelector';
import { ChapterContentWrapper } from '@/components/ChapterContentWrapper';
import { ChapterNavigation } from '@/components/ChapterNavigation';
import { VerseAnchorScroll } from '@/components/VerseAnchorScroll';
import { createClient, createPublicClient } from '@/utils/supabase/server';
import { DEFAULT_OG_IMAGE, JsonLd, absoluteUrl, breadcrumbJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';
// Note: revalidate est retiré car dynamic='force-dynamic' le rend inutile

interface TranslationOption {
  id: string;
  name: string;
  disabled?: boolean;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string; chapter: string }>;
}): Promise<Metadata> {
  const { bookId, chapter: chapterStr } = await params;
  const chapter = parseInt(chapterStr);
  const bookResult = await getBookAction(bookId);

  if (!bookResult.success || !bookResult.book) {
    return {
      title: 'Chapitre non trouvé',
      robots: { index: false, follow: false },
    };
  }

  const book = bookResult.book;
  const title = `${book.name} ${chapter} - Bible Catholique`;
  const description = `Lire ${book.name} chapitre ${chapter} dans la Bible catholique sur WikiBible, avec les traductions officielles disponibles.`;
  const canonical = `/bible/${bookId}/${chapter}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | WikiBible`,
      description,
      url: absoluteUrl(canonical),
      type: 'article',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${book.name} ${chapter} - WikiBible`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

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

  const [bookResult, booksResult] = await Promise.all([
    getBookAction(bookId),
    getBooksAction(),
  ]);

  if (!bookResult.success || !bookResult.book) {
    return <div className="text-center py-12 text-danger">Chapitre non trouvé</div>;
  }

  const book = bookResult.book;
  const books = booksResult.books && booksResult.books.length > 0 ? booksResult.books : [book];
  const publicSupabase = createPublicClient();
  const translationsResult = await getOfficialBibleTranslationsAction();
  const officialTranslations = translationsResult.translations || [];
  const activeTranslationIds = officialTranslations.map((item) => item.id);
  const { data: chapterTranslationRows } = activeTranslationIds.length > 0
    ? await publicSupabase
      .from('bible_verses')
      .select('translation_id')
      .eq('book_id', book.id)
      .eq('chapter', chapter)
      .in('translation_id', activeTranslationIds)
    : { data: [] };

  const chapterTranslationIds = new Set((chapterTranslationRows || []).map((row) => row.translation_id));
  const translations: TranslationOption[] = officialTranslations.map((item) => ({
    ...item,
    disabled: !chapterTranslationIds.has(item.id),
  }));
  const availableTranslations = translations.filter((item) => !item.disabled);
  const fallbackTranslation = availableTranslations.find((item) => item.id === 'crampon')?.id
    || availableTranslations[0]?.id
    || 'crampon';
  const validTranslation = availableTranslations.some((item) => item.id === translation)
    ? translation
    : fallbackTranslation;
  const currentTranslationName = translations.find((item) => item.id === validTranslation)?.name || validTranslation;
  const encodedTranslation = encodeURIComponent(validTranslation);

  const chapterResult = await getChapterAction(bookId, chapter, validTranslation);

  if (!chapterResult.success || !chapterResult.verses) {
    return <div className="text-center py-12 text-danger">Chapitre non trouvé</div>;
  }

  const verses = chapterResult.verses;
  const verseNumbers = verses.map((verse) => verse.verse);

  // Vérifier l'authentification
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  const currentUserId = user?.id;

  return (
    <main className="min-h-screen">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Accueil', url: '/' },
            { name: 'Bible', url: '/bible' },
            { name: currentTranslationName, url: `/bible?translation=${encodedTranslation}` },
            { name: book.name, url: `/bible/${bookId}/1?translation=${encodedTranslation}` },
            { name: `Chapitre ${chapter}`, url: `/bible/${bookId}/${chapter}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: `${book.name} ${chapter}`,
            headline: `${book.name} - Chapitre ${chapter}`,
            description: `Chapitre ${chapter} du livre ${book.name} dans la Bible catholique.`,
            isPartOf: {
              '@type': 'Book',
              name: 'Bible catholique',
            },
            url: absoluteUrl(`/bible/${bookId}/${chapter}`),
            inLanguage: 'fr',
          },
        ]}
      />
      {/* Gestion du scroll vers l'ancre de verset */}
      <VerseAnchorScroll />

      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <BiblePathSelector
          books={books}
          translations={translations}
          currentBookSlug={bookId}
          currentChapter={chapter}
          currentTranslation={validTranslation}
          verseNumbers={verseNumbers}
        />

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
            translation={validTranslation}
          />
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
          initialTranslationName={currentTranslationName}
          translations={translations.length > 0 ? translations : [{ id: validTranslation, name: validTranslation }]}
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
            translation={validTranslation}
          />
        </div>
      </div>
    </main>
  );
}
