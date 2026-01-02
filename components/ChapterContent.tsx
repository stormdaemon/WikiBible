'use client';

import { useState } from 'react';
import { VerseCard } from './VerseCard';
import { getVerseContributionsAction } from '@/app/actions';

interface Verse {
  id: string;
  verse: number;
  text: string;
  translation_id: string;
}

interface ChapterContentProps {
  bookName: string;
  bookId: string;
  chapter: number;
  verses: Verse[];
  isAuthenticated: boolean;
}

export function ChapterContent({
  bookName,
  bookId,
  chapter,
  verses,
  isAuthenticated,
}: ChapterContentProps) {
  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [contributions, setContributions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  // Calculate contribution counts for each verse
  const verseContributions: Record<string, any> = {};
  if (contributions && selectedVerseId) {
    verseContributions[selectedVerseId] = {
      links: contributions.links?.length || 0,
      annotations: contributions.annotations?.length || 0,
      external_sources: contributions.external_sources?.length || 0,
    };
  }

  return (
    <>
      {/* Verses */}
      <div className="space-y-6">
        {verses.map((verse) => (
          <VerseCard
            key={verse.id}
            verseId={verse.id}
            bookName={bookName}
            chapter={chapter}
            verseNumber={verse.verse}
            text={verse.text}
            translation="Bible Crampon"
            contributions={verseContributions[verse.id]}
            onOpenContributions={() => handleOpenContributions(verse.id, verse.verse)}
            onOpenAddLink={() => handleOpenAddLink(verse.id, verse.verse)}
            isAuthenticated={isAuthenticated}
          />
        ))}
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
