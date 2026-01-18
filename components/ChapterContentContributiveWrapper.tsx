'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getChapterAction, getMissingVersesAction } from '@/app/actions';
import { ChapterContent } from './ChapterContent';

interface Translation {
  id: string;
  name: string;
}

interface ChapterContentContributiveWrapperProps {
  bookName: string;
  bookId: string;
  bookSlug: string;
  chapter: number;
  verses: any[];
  isAuthenticated: boolean;
  initialTranslation: string;
  translations: readonly Translation[];
}

export function ChapterContentContributiveWrapper({
  bookName,
  bookId,
  bookSlug,
  chapter,
  verses,
  isAuthenticated,
  initialTranslation,
  translations,
}: ChapterContentContributiveWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTranslation, setCurrentTranslation] = useState(initialTranslation);
  const [displayVerses, setDisplayVerses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour recharger les versets (appelée après ajout d'un verset)
  const refreshVerses = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Récupérer le nom de la traduction courante
  const currentTranslationName = translations.find(t => t.id === currentTranslation)?.name || currentTranslation;

  // Charger les versets pour la traduction sélectionnée ET les versets manquants
  useEffect(() => {
    const loadVerses = async () => {
      setIsLoading(true);

      // Charger les versets existants
      const result = await getChapterAction(bookSlug, chapter, currentTranslation);

      if (result.success && result.verses) {
        // Charger les versets manquants en comparant avec Crampon
        const missingResult = await getMissingVersesAction(bookSlug, chapter, currentTranslation);

        if (missingResult.success && missingResult.missingVerses) {
          // Créer des versets "vides" pour les manquants
          const missingVerseObjects = (missingResult.missingVerses as any[]).map(missing => ({
            id: `missing-${missing.verse_number}`, // ID temporaire
            verse: missing.verse_number,
            text: '', // Vide pour indiquer manquant
            translation_id: currentTranslation,
            book_id: missing.book_id,
            isMissing: true, // Flag pour indiquer que c'est manquant
          }));

          // Fusionner les versets existants avec les manquants
          const allVerses = [...result.verses, ...missingVerseObjects];
          // Trier par numéro de verset
          allVerses.sort((a, b) => a.verse - b.verse);

          setDisplayVerses(allVerses);
        } else {
          setDisplayVerses(result.verses);
        }
      }
      setIsLoading(false);
    };

    loadVerses();
  }, [currentTranslation, bookSlug, chapter, refreshKey]);

  const handleTranslationChange = (newTranslation: string) => {
    setCurrentTranslation(newTranslation);
    const url = `${pathname}?translation=${newTranslation}`;
    router.push(url, { scroll: false });
  };

  return (
    <>
      {/* Translation Selector */}
      <div className="mb-6">
        <label htmlFor="contributive-translation-select" className="block text-sm font-medium text-secondary mb-2">
          Traduction communautaire :
        </label>
        <select
          id="contributive-translation-select"
          value={currentTranslation}
          onChange={(e) => handleTranslationChange(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
        >
          {translations.map((translation) => (
            <option key={translation.id} value={translation.id}>
              {translation.name}
            </option>
          ))}
        </select>
        {!isAuthenticated && (
          <p className="mt-2 text-sm text-secondary">
            <a href="/auth/login" className="text-accent hover:underline">
              Connectez-vous
            </a>
            {' '}pour contribuer une traduction
          </p>
        )}
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
          isContributive={true}
          currentTranslation={currentTranslation}
          currentTranslationName={currentTranslationName}
          translations={translations}
          onVerseAdded={refreshVerses}
        />
      )}
    </>
  );
}
