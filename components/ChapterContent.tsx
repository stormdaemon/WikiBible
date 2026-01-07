'use client';

import { useState, useEffect } from 'react';
import { VerseCard } from './VerseCard';
import { getVerseContributionsAction, getVerseAction } from '@/app/actions';

interface Verse {
  id: string;
  verse: number;
  text: string;
  translation_id: string;
}

interface ChapterContentProps {
  bookName: string;
  bookId: string;
  bookSlug: string;
  chapter: number;
  verses: Verse[];
  isAuthenticated: boolean;
}

export function ChapterContent({
  bookName,
  bookId,
  bookSlug,
  chapter,
  verses,
  isAuthenticated,
}: ChapterContentProps) {
  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [contributions, setContributions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allAnnotations, setAllAnnotations] = useState<Record<string, any>>({});

  // État pour stocker la traduction de chaque verset individuellement
  const [versesTranslations, setVersesTranslations] = useState<Record<string, string>>(
    verses.reduce((acc, verse) => ({ ...acc, [verse.id]: verse.translation_id }), {})
  );

  // État pour stocker le texte de chaque verset
  const [versesTexts, setVersesTexts] = useState<Record<string, string>>(
    verses.reduce((acc, verse) => ({ ...acc, [verse.id]: verse.text }), {})
  );

  // Charger toutes les annotations au montage
  useEffect(() => {
    const loadAllAnnotations = async () => {
      const annotationsPromises = verses.map(async (verse) => {
        const result = await getVerseContributionsAction(verse.id);
        return { verseId: verse.id, data: result };
      });

      const results = await Promise.all(annotationsPromises);
      const annotationsMap = results.reduce((acc, { verseId, data }) => {
        acc[verseId] = data;
        return acc;
      }, {} as Record<string, any>);

      setAllAnnotations(annotationsMap);
    };

    loadAllAnnotations();
  }, [verses]);

  const handleOpenContributions = async (verseId: string, verseNumber: number) => {
    setSelectedVerseId(verseId);
    setSelectedVerseNumber(verseNumber);
    setLoading(true);

    // Fetch contributions for this verse
    const result = await getVerseContributionsAction(verseId);
    setContributions(result);
    setLoading(false);
  };

  const handleCloseContributions = () => {
    setSelectedVerseId(null);
    setSelectedVerseNumber(null);
    setContributions(null);
  };

  const handleOpenAddLink = (verseId: string, verseNumber: number) => {
    setSelectedVerseId(verseId);
    setSelectedVerseNumber(verseNumber);
    setShowAddLinkModal(true);
  };

  const handleCloseAddLink = () => {
    setShowAddLinkModal(false);
  };

  const handleSwitchTranslation = async (verseId: string, direction: 'prev' | 'next') => {
    const currentTranslation = versesTranslations[verseId];
    const newTranslationId = currentTranslation === 'crampon' ? 'jerusalem' : 'crampon';

    // Trouver le verset original pour récupérer bookSlug et chapter
    const originalVerse = verses.find(v => v.id === verseId);
    if (!originalVerse) return;

    try {
      // Récupérer le nouveau texte du verset dans l'autre traduction
      const result = await getVerseAction(bookSlug, chapter, originalVerse.verse, newTranslationId);

      if (result.success && result.verse) {
        // Mettre à jour seulement ce verset avec animation
        setVersesTranslations(prev => ({ ...prev, [verseId]: newTranslationId }));
        setVersesTexts(prev => ({ ...prev, [verseId]: result.verse!.text }));
      }
    } catch (error) {
      console.error('Erreur lors du changement de traduction:', error);
    }
  };

  // Calculate contribution counts for each verse
  const verseContributions: Record<string, any> = {};
  if (contributions && selectedVerseId) {
    verseContributions[selectedVerseId] = {
      links: contributions.links?.length || 0,
      linkDetails: contributions.link_details || [],
      wiki_links: contributions.wiki_links || [],
      annotations: contributions.annotations?.length || 0,
      external_sources: contributions.external_sources?.length || 0,
    };
  }

  return (
    <>
      {/* Verses */}
      <div className="space-y-6">
        {verses.map((verse) => {
          const translationId = versesTranslations[verse.id];
          const text = versesTexts[verse.id];

          return (
            <VerseCard
              key={verse.id}
              verseId={verse.id}
              bookName={bookName}
              chapter={chapter}
              verseNumber={verse.verse}
              text={text}
              translation={translationId === 'jerusalem' ? 'Bible de Jérusalem' : 'Bible Crampon'}
              translationId={translationId}
              bookId={bookId}
              contributions={verseContributions[verse.id]}
              allAnnotations={allAnnotations[verse.id]}
              onOpenContributions={() => handleOpenContributions(verse.id, verse.verse)}
              onOpenAddLink={() => handleOpenAddLink(verse.id, verse.verse)}
              onSwitchTranslation={(direction) => handleSwitchTranslation(verse.id, direction)}
              isAuthenticated={isAuthenticated}
            />
          );
        })}
      </div>

      {/* Annotation Modal */}
      {selectedVerseId && !showAddLinkModal && (
        <AnnotationModal
          verseId={selectedVerseId}
          verseReference={`${bookName} ${chapter}:${selectedVerseNumber}`}
          contributions={contributions || { links: [], annotations: [], external_sources: [] }}
          isOpen={!!selectedVerseId}
          onClose={handleCloseContributions}
        />
      )}

      {/* Add Link Modal */}
      {selectedVerseId && showAddLinkModal && (
        <AddLinkModal
          verseId={selectedVerseId}
          isOpen={showAddLinkModal}
          onClose={handleCloseAddLink}
        />
      )}
    </>
  );
}

// Import des composants modaux
import { AnnotationModal } from './AnnotationModal';
import { AddLinkModal } from './AddLinkModal';
