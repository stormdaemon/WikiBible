'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getChapterAction } from '@/app/actions';
import { ChapterContent } from './ChapterContent';

interface ChapterContentWrapperProps {
  bookName: string;
  bookId: string;
  bookSlug: string;
  chapter: number;
  verses: any[];
  isAuthenticated: boolean;
  currentUserId?: string;
  initialTranslation: 'crampon' | 'jerusalem';
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
}: ChapterContentWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTranslation, setCurrentTranslation] = useState(initialTranslation);
  const [displayVerses, setDisplayVerses] = useState(verses);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les versets manquants pour Jérusalem
  useEffect(() => {
    const loadVersesWithGaps = async () => {
      if (currentTranslation === 'jerusalem') {
        setIsLoading(true);

        // Récupérer les versets Crampon pour comparer
        const cramponResult = await getChapterAction(bookSlug, chapter, 'crampon');

        if (cramponResult.success && cramponResult.verses) {
          // Créer un Set des numéros de versets Jérusalem existants
          const jerusalemVerseNumbers = new Set(verses.map(v => v.verse));

          // Combiner les versets Jérusalem avec les placeholders pour les manquants
          const combinedVerses = cramponResult.verses.map((cramponVerse) => {
            const jerusalemVerse = verses.find(v => v.verse === cramponVerse.verse);
            return jerusalemVerse || {
              ...cramponVerse,
              id: `missing-${cramponVerse.id}`,
              text: cramponVerse.text, // Utiliser le texte Crampon comme fallback
              translation_id: 'jerusalem',
              isMissing: true,
            };
          });
          setDisplayVerses(combinedVerses);
        }
        setIsLoading(false);
      } else {
        // Pour Crampon, utiliser les versets directement
        setDisplayVerses(verses);
      }
    };

    loadVersesWithGaps();
  }, [currentTranslation, verses, bookSlug, chapter]);

  const handleTranslationChange = (newTranslation: 'crampon' | 'jerusalem') => {
    setCurrentTranslation(newTranslation);
    // Update URL without full page reload
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
          onChange={(e) => handleTranslationChange(e.target.value as 'crampon' | 'jerusalem')}
          className="px-4 py-2 border border-border rounded-lg bg-background text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
        >
          <option value="crampon">Bible Crampon</option>
          <option value="jerusalem">Bible de Jérusalem</option>
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
        />
      )}
    </>
  );
}
