'use client';

import { useState, useEffect } from 'react';

export type Translation = 'crampon' | 'jerusalem';

export function useTranslationPreference() {
  const [translation, setTranslation] = useState<Translation>('crampon');
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger la préférence depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bibleTranslation') as Translation | null;
      if (saved === 'crampon' || saved === 'jerusalem') {
        setTranslation(saved);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la préférence de traduction:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const changeTranslation = (newTranslation: Translation) => {
    try {
      setTranslation(newTranslation);
      localStorage.setItem('bibleTranslation', newTranslation);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la préférence de traduction:', error);
    }
  };

  return { translation, changeTranslation, isLoaded };
}
