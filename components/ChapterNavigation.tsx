'use client';

import { useRouter, usePathname } from 'next/navigation';

interface ChapterNavigationProps {
  bookId: string;
  bookSlug: string;
  chapter: number;
  totalChapters: number;
  basePath: '/bible' | '/bible-contributive';
}

export function ChapterNavigation({
  bookId,
  bookSlug,
  chapter,
  totalChapters,
  basePath,
}: ChapterNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChapter = parseInt(e.target.value);
    router.push(`${basePath}/${bookSlug}/${newChapter}`);
  };

  return (
    <div className="flex items-center gap-4">
      {chapter > 1 ? (
        <a
          href={`${basePath}/${bookSlug}/${chapter - 1}`}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          ← Précédent
        </a>
      ) : (
        <div className="w-24"></div>
      )}

      <select
        value={chapter}
        onChange={handleChapterChange}
        className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
      >
        {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
          <option key={ch} value={ch}>
            Chapitre {ch}
          </option>
        ))}
      </select>

      {chapter < totalChapters ? (
        <a
          href={`${basePath}/${bookSlug}/${chapter + 1}`}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Suivant →
        </a>
      ) : (
        <div className="w-24"></div>
      )}
    </div>
  );
}
