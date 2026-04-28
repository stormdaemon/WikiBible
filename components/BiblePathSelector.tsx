'use client';

import { useRouter } from 'next/navigation';

interface BibleBookOption {
  id: string;
  name: string;
  slug: string;
  chapters: number;
}

interface TranslationOption {
  id: string;
  name: string;
  disabled?: boolean;
}

interface BiblePathSelectorProps {
  books: BibleBookOption[];
  translations: TranslationOption[];
  currentBookSlug: string;
  currentChapter: number;
  currentTranslation: string;
  verseNumbers: number[];
}

export function BiblePathSelector({
  books,
  translations,
  currentBookSlug,
  currentChapter,
  currentTranslation,
  verseNumbers,
}: BiblePathSelectorProps) {
  const router = useRouter();
  const currentBook = books.find((book) => book.slug === currentBookSlug);
  const chapterCount = currentBook?.chapters || currentChapter;

  const chapterHref = (bookSlug = currentBookSlug, chapter = currentChapter, translation = currentTranslation) =>
    `/bible/${bookSlug}/${chapter}?translation=${encodeURIComponent(translation)}`;

  return (
    <nav aria-label="Chemin Bible" className="mb-8">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => router.push(`/bible?translation=${encodeURIComponent(currentTranslation)}`)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-secondary hover:text-primary hover:border-accent transition-colors"
        >
          Bible
        </button>
        <span className="text-slate-300">/</span>

        <select
          aria-label="Version de la Bible"
          value={currentTranslation}
          onChange={(event) => router.push(chapterHref(currentBookSlug, currentChapter, event.target.value))}
          className="max-w-full px-3 py-2 rounded-lg border border-border bg-background text-primary focus:ring-2 focus:ring-accent focus:border-accent"
        >
          {translations.map((translation) => (
            <option key={translation.id} value={translation.id} disabled={translation.disabled}>
              {translation.name}
            </option>
          ))}
        </select>
        <span className="text-slate-300">/</span>

        <select
          aria-label="Livre"
          value={currentBookSlug}
          onChange={(event) => router.push(chapterHref(event.target.value, 1))}
          className="max-w-full px-3 py-2 rounded-lg border border-border bg-background text-primary focus:ring-2 focus:ring-accent focus:border-accent"
        >
          {books.map((book) => (
            <option key={book.id} value={book.slug}>
              {book.name}
            </option>
          ))}
        </select>
        <span className="text-slate-300">/</span>

        <select
          aria-label="Chapitre"
          value={currentChapter}
          onChange={(event) => router.push(chapterHref(currentBookSlug, Number(event.target.value)))}
          className="max-w-full px-3 py-2 rounded-lg border border-border bg-background text-primary focus:ring-2 focus:ring-accent focus:border-accent"
        >
          {Array.from({ length: chapterCount }, (_, index) => index + 1).map((chapter) => (
            <option key={chapter} value={chapter}>
              Chapitre {chapter}
            </option>
          ))}
        </select>
        <span className="text-slate-300">/</span>

        <select
          aria-label="Verset"
          defaultValue=""
          onChange={(event) => {
            if (!event.target.value) return;
            router.push(`${chapterHref()}#verse-${event.target.value}`);
          }}
          className="max-w-full px-3 py-2 rounded-lg border border-border bg-background text-primary focus:ring-2 focus:ring-accent focus:border-accent"
        >
          <option value="" disabled>
            Verset
          </option>
          {verseNumbers.map((verse) => (
            <option key={verse} value={verse}>
              Verset {verse}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
