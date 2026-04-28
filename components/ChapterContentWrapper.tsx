'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getChapterAction } from '@/app/actions';
import { ChapterContent } from './ChapterContent';

interface TranslationOption {
  id: string;
  name: string;
  disabled?: boolean;
}

interface ChapterContentWrapperProps {
  bookName: string;
  bookId: string;
  bookSlug: string;
  chapter: number;
  verses: any[];
  isAuthenticated: boolean;
  currentUserId?: string;
  initialTranslation: string;
  translations: TranslationOption[];
}

export function ChapterContentWrapper({
  bookName,
  bookId,
  bookSlug,
  chapter,
  verses,
  isAuthenticated,
  currentUserId,
  initialTranslation,
  translations,
}: ChapterContentWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTranslation, setCurrentTranslation] = useState(initialTranslation);
  const [displayVerses, setDisplayVerses] = useState(verses);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentTranslation(initialTranslation);
    setDisplayVerses(verses);
  }, [initialTranslation, verses]);

  // Charger les versets avec gestion des traductions manquantes.
  useEffect(() => {
    let cancelled = false;

    const loadVersesWithGaps = async () => {
      setIsLoading(true);

      const result = currentTranslation === initialTranslation
        ? { success: true, verses }
        : await getChapterAction(bookSlug, chapter, currentTranslation);

      if (cancelled) return;

      if (!result.success || !result.verses) {
        setDisplayVerses([]);
        setIsLoading(false);
        return;
      }

      if (currentTranslation === 'jerusalem') {
        const cramponResult = await getChapterAction(bookSlug, chapter, 'crampon');
        if (cancelled) return;

        if (cramponResult.success && cramponResult.verses && cramponResult.verses.length > 0) {
          const combinedVerses = cramponResult.verses.map((cramponVerse) => {
            const jerusalemVerse = result.verses.find((v) => v.verse === cramponVerse.verse);
            return jerusalemVerse || {
              ...cramponVerse,
              id: `missing-${cramponVerse.id}`,
              text: cramponVerse.text,
              translation_id: 'jerusalem',
              isMissing: true,
            };
          });
          setDisplayVerses(combinedVerses);
        } else {
          setDisplayVerses(result.verses);
        }
      } else {
        setDisplayVerses(result.verses);
      }

      setIsLoading(false);
    };

    loadVersesWithGaps();

    return () => {
      cancelled = true;
    };
  }, [currentTranslation, initialTranslation, verses, bookSlug, chapter]);

  const handleTranslationChange = (newTranslation: string) => {
    setCurrentTranslation(newTranslation);
    const url = `${pathname}?translation=${newTranslation}`;
    router.push(url, { scroll: false });
  };

  return (
    <>
      {/* Translation Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="chapter-translation-select" className="text-sm font-medium text-secondary">
          Traduction :
        </label>
        <select
          id="chapter-translation-select"
          value={currentTranslation}
          onChange={(e) => handleTranslationChange(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
        >
          {translations.map((translation) => (
            <option key={translation.id} value={translation.id} disabled={translation.disabled}>
              {translation.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chapter Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="mt-4 text-secondary">Chargement de la traduction...</p>
        </div>
      ) : (
        <ChapterContent
          bookName={bookName}
          bookId={bookId}
          bookSlug={bookSlug}
          chapter={chapter}
          verses={displayVerses}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          currentTranslation={currentTranslation}
          currentTranslationName={translations.find((item) => item.id === currentTranslation)?.name || currentTranslation}
          translations={translations}
        />
      )}
    </>
  );
}
