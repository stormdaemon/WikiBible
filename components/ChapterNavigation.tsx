'use client';

interface ChapterNavigationProps {
  bookId: string;
  bookSlug: string;
  chapter: number;
  totalChapters: number;
  basePath: '/bible' | '/bible-contributive' | '/apocrypha';
  translation?: string;
}

export function ChapterNavigation({
  bookSlug,
  chapter,
  totalChapters,
  basePath,
  translation,
}: ChapterNavigationProps) {
  const chapterHref = (targetChapter: number) => {
    const href = `${basePath}/${bookSlug}/${targetChapter}`;
    return translation ? `${href}?translation=${encodeURIComponent(translation)}` : href;
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {chapter > 1 ? (
        <a
          href={chapterHref(chapter - 1)}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          ← Précédent
        </a>
      ) : (
        <div className="w-24" />
      )}

      {chapter < totalChapters ? (
        <a
          href={chapterHref(chapter + 1)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Suivant →
        </a>
      ) : (
        <div className="w-24" />
      )}
    </div>
  );
}
