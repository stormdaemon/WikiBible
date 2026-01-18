'use client';

import { useState, useEffect } from 'react';
import { VerseCardMemo as VerseCard } from './VerseCard';
import { ContributionButton } from './ContributionButton';
import { getVerseContributionsAction, getVerseAction, getBibleEntitiesAction } from '@/app/actions';
import type { BibleEntity } from '@/app/actions';

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
  currentUserId?: string;
  isContributive?: boolean;
  currentTranslation?: string;
  currentTranslationName?: string;
  translations?: { id: string; name: string; }[];
  onVerseAdded?: () => void;
}

export function ChapterContent({
  bookName,
  bookId,
  bookSlug,
  chapter,
  verses,
  isAuthenticated,
  currentUserId,
  isContributive = false,
  currentTranslation,
  currentTranslationName,
  translations,
  onVerseAdded,
}: ChapterContentProps) {
  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [contributions, setContributions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // État pour stocker les entités bibliques
  const [entities, setEntities] = useState<BibleEntity[]>([]);

  // Helper pour récupérer le nom de la traduction depuis la liste
  const getTranslationName = (translationId: string): string => {
    // En mode contributif, utiliser le nom de la traduction courante déjà récupéré
    if (isContributive && currentTranslationName && translationId === currentTranslation) {
      return currentTranslationName;
    }
    // Sinon, chercher dans la liste des traductions
    const translation = translations?.find(t => t.id === translationId);
    return translation?.name || translationId;
  };

  // NOTE: Le préchargement des annotations pour tous les versets a été supprimé
  // pour des raisons de performance. Les annotations sont maintenant chargées
  // à la demande (lazy loading) quand l'utilisateur clique sur un verset.

  // Charger les entités bibliques au montage
  useEffect(() => {
    const loadEntities = async () => {
      const result = await getBibleEntitiesAction();
      if (result.success && result.entities) {
        setEntities(result.entities);
      }
    };

    loadEntities();
  }, []);

  const handleOpenContributions = async (verseId: string, verseNumber: number) => {
    setSelectedVerseId(verseId);
    setSelectedVerseNumber(verseNumber);
    setLoading(true);

    // Fetch contributions for this verse
    const result = await getVerseContributionsAction(verseId);
    setContributions(result);
    setLoading(false);
  };

  const handleRefreshContributions = async () => {
    if (selectedVerseId) {
      console.log('[ChapterContent] handleRefreshContributions START for verse:', selectedVerseId);
      setLoading(true);
      const result = await getVerseContributionsAction(selectedVerseId);
      console.log('[ChapterContent] getVerseContributionsAction result:', result);
      setContributions(result);
      setLoading(false);
      console.log('[ChapterContent] handleRefreshContributions END');
    }
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
      linkDetails: contributions.link_details || [],
      wiki_links: contributions.wiki_links || [],
      annotations: contributions.annotations?.length || 0,
      external_sources: contributions.external_sources?.length || 0,
    };
  }

  return (
    <>
      {/* Info banner for contributive mode */}
      {isContributive && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✏️</span>
            <div>
              <p className="font-semibold text-accent">Mode Contributif</p>
              <p className="text-sm text-secondary">
                Vous naviguez dans la Bible Contributive. Les traductions affichées proviennent de la communauté.
                {isAuthenticated ? (
                  <span> Utilisez le bouton <strong>Contribuer</strong> sur chaque verset pour ajouter votre propre traduction.</span>
                ) : (
                  <a href="/auth/login" className="text-accent hover:underline ml-1">
                    Connectez-vous pour contribuer
                  </a>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-6">
        {verses.map((verse) => {
          const isMissing = !verse.text || verse.text.trim() === '';

          return (
            <div key={verse.id} className="relative">
              {/* Contribution button for contributive mode */}
              {isContributive && (
                <div className="absolute -top-3 -right-3 z-10">
                  <ContributionButton
                    verseId={verse.id}
                    bookName={bookName}
                    chapter={chapter}
                    verse={verse.verse}
                    translation={verse.translation_id}
                    isAuthenticated={isAuthenticated}
                    isMissing={isMissing}
                    bookId={bookId}
                    onSuccess={onVerseAdded}
                  />
                </div>
              )}

              <VerseCard
                verseId={verse.id}
                bookName={bookName}
                chapter={chapter}
                verseNumber={verse.verse}
                text={verse.text || '[Traduction manquante]'}
                translation={isContributive ? currentTranslationName : getTranslationName(verse.translation_id)}
                translationId={verse.translation_id}
                bookId={bookId}
                isMissing={isMissing}
                isContributive={isContributive}
                contributions={verseContributions[verse.id]}
                onOpenContributions={() => handleOpenContributions(verse.id, verse.verse)}
                onOpenAddLink={() => handleOpenAddLink(verse.id, verse.verse)}
                isAuthenticated={isAuthenticated}
                entities={entities}
                onEntityAdded={(newEntity) => setEntities([...entities, newEntity])}
              />
            </div>
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
          currentUserId={currentUserId}
          onRefresh={handleRefreshContributions}
        />
      )}

      {/* Add Link Modal */}
      {selectedVerseId && showAddLinkModal && (
        <AddLinkModal
          verseId={selectedVerseId}
          isOpen={showAddLinkModal}
          onClose={handleCloseAddLink}
          onRefresh={handleRefreshContributions}
        />
      )}
    </>
  );
}

// Import des composants modaux
import { AnnotationModal } from './AnnotationModal';
import { AddLinkModal } from './AddLinkModal';
