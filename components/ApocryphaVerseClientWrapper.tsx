'use client';

import { useState } from 'react';
import { ApocryphaVerseCard } from '@/components/ApocryphaVerseCard';
import { AddLinkModal } from '@/components/AddLinkModal';
import { AnnotationModal } from '@/components/AnnotationModal';
import { getVerseContributionsAction } from '@/app/actions';

interface ApocryphaVerseClientWrapperProps {
  verses: Array<{
    id: string;
    chapter: number;
    verse: number;
    text_original: string;
    text_fr: string;
  }>;
  bookName: string;
  isAuthenticated: boolean;
}

export function ApocryphaVerseClientWrapper({
  verses,
  bookName,
  isAuthenticated,
}: ApocryphaVerseClientWrapperProps) {
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showContributionsModal, setShowContributionsModal] = useState(false);
  const [contributions, setContributions] = useState<any>(null);

  const handleOpenAddLink = (verseId: string) => {
    setSelectedVerse(verseId);
    setShowAddLinkModal(true);
  };

  const handleCloseAddLink = () => {
    setShowAddLinkModal(false);
    setSelectedVerse(null);
  };

  const handleOpenContributions = async (verseId: string) => {
    setSelectedVerse(verseId);
    setShowContributionsModal(true);
    const result = await getVerseContributionsAction(verseId);
    setContributions(result);
  };

  const handleCloseContributions = () => {
    setShowContributionsModal(false);
    setSelectedVerse(null);
    setContributions(null);
  };

  const handleRefreshContributions = async () => {
    if (selectedVerse) {
      const result = await getVerseContributionsAction(selectedVerse);
      setContributions(result);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {verses.map((verse) => (
          <ApocryphaVerseCard
            key={verse.id}
            verseId={verse.id}
            bookName={bookName}
            chapter={verse.chapter}
            verseNumber={verse.verse}
            textOriginal={verse.text_original}
            textFr={verse.text_fr}
            onOpenAddLink={() => handleOpenAddLink(verse.id)}
            onOpenContributions={() => handleOpenContributions(verse.id)}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>

      {/* Modal Ajouter un lien */}
      {selectedVerse && showAddLinkModal && (
        <AddLinkModal
          verseId={selectedVerse}
          isOpen={showAddLinkModal}
          onClose={handleCloseAddLink}
          sourceType="apocryphal"
        />
      )}

      {/* Modal Annotations/Contributions */}
      {selectedVerse && showContributionsModal && (
        <AnnotationModal
          verseId={selectedVerse}
          verseReference={`${bookName} (Verset)`}
          contributions={contributions || { links: [], annotations: [], external_sources: [] }}
          isOpen={showContributionsModal}
          onClose={handleCloseContributions}
          onRefresh={handleRefreshContributions}
        />
      )}
    </>
  );
}
