'use client';

import Link from 'next/link';
import { ApocryphaVerseCard } from './ApocryphaVerseCard';
import { useState } from 'react';
import { AddLinkModal } from './AddLinkModal';
import { AnnotationModal } from './AnnotationModal';

interface ApocryphaContentProps {
  book: {
    id: string;
    name_fr: string;
    slug: string;
  };
  chapters: Record<string, Array<{
    id: string;
    chapter: number;
    verse: number;
    text_original: string;
    text_fr: string;
  }>>;
  isAuthenticated?: boolean;
}

export function ApocryphaContent({ book, chapters, isAuthenticated = false }: ApocryphaContentProps) {
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

    // Charger les contributions (placeholder pour l'instant)
    // TODO: Implement getApocryphaContributionsAction
    setContributions({
      links: [],
      annotations: [],
      external_sources: [],
    });
  };

  const handleCloseContributions = () => {
    setShowContributionsModal(false);
    setSelectedVerse(null);
    setContributions(null);
  };

  return (
    <>
      <div>
        {Object.entries(chapters).map(([chapterNum, verses]) => (
          <section
            key={chapterNum}
            id={`chapter-${chapterNum}`}
            className="mb-12"
          >
            <h2 className="text-2xl font-serif text-primary mb-6 pb-2 border-b border-border">
              Chapitre {chapterNum}
            </h2>

            <div className="space-y-6">
              {verses.map((verse) => (
                <ApocryphaVerseCard
                  key={verse.id}
                  verseId={verse.id}
                  bookName={book.name_fr}
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
          </section>
        ))}
      </div>

      {/* Modal Ajouter un lien */}
      {selectedVerse && showAddLinkModal && (
        <AddLinkModal
          verseId={selectedVerse}
          isOpen={showAddLinkModal}
          onClose={handleCloseAddLink}
        />
      )}

      {/* Modal Annotations/Contributions */}
      {selectedVerse && showContributionsModal && (
        <AnnotationModal
          verseId={selectedVerse}
          verseReference={`${book.name_fr} (Verset)`}
          contributions={contributions || { links: [], annotations: [], external_sources: [] }}
          isOpen={showContributionsModal}
          onClose={handleCloseContributions}
        />
      )}
    </>
  );
}

