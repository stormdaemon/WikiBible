'use client';

import { useState, useEffect, useRef, ReactNode, useActionState } from 'react';
import { createAnnotationAction, deleteVerseLinkAction, deleteAnnotationAction, getVerseContributionsAction } from '@/app/actions';
import { LikeButton } from './LikeButton';

interface VerseLink {
  id: string;
  link_type: string;
  description: string | null;
  likes_count?: number;
  created_at?: string;
  bible_verses: {
    id: string;
    verse: number;
    chapter: number;
    text: string;
    translation_id?: string;
    bible_books: {
      id: string;
      name: string;
      slug: string;
    };
  } | null;
  author_id: string | null;
  author?: {
    id: string;
    username: string | null;
    confession: string | null;
  };
  target_reference?: string | null;
  target_verse_type?: 'bible' | 'apocryphal' | 'contribution' | null;
}

interface WikiLink {
  id: string;
  link_type: string;
  description: string | null;
  wiki_article: {
    id: string;
    title: string;
    slug: string;
  } | null;
  author_id: string | null;
}

interface Annotation {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  annotation_type?: 'annotation' | 'commentary' | 'meditation';
  likes_count?: number;
  user_profile?: {
    user_id: string;
    username: string | null;
    full_name: string | null;
  };
  replies?: Array<{
    id: string;
    content: string;
    created_at: string;
    author_id: string;
    likes_count?: number;
    user_profile?: {
      user_id: string;
      username: string | null;
      full_name: string | null;
    };
  }>;
}

interface ExternalSource {
  id: string;
  link_type: string | null;
  external_source: {
    id: string;
    title: string;
    author_name: string | null;
    source_type: string;
    reference: string | null;
    content: string;
  };
  author_id: string | null;
}

interface AnnotationModalProps {
  verseId: string;
  verseReference: string;
  contributions: {
    links: VerseLink[];
    wiki_links?: WikiLink[];
    annotations: Annotation[];
    external_sources: ExternalSource[];
  };
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onRefresh?: () => void;
}

type TabType = 'links' | 'wiki' | 'sources' | 'annotations' | 'commentaries';

export function AnnotationModal({
  verseId,
  verseReference,
  contributions,
  isOpen,
  onClose,
  currentUserId,
  onRefresh,
}: AnnotationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('links');

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl min-h-[50vh] max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 md:py-4 border-b border-slate-200 bg-white">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate">Contributions</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{verseReference}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <svg width="18" height="18" className="w-4 h-4 sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-200 bg-slate-50 -mx-2 sm:mx-0 px-2 sm:px-0">
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-[10px] sm:text-xs md:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'links'
                ? 'border-accent text-accent bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <svg width="14" height="14" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Liens</span>
            {contributions.links.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                {contributions.links.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wiki')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-[10px] sm:text-xs md:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'wiki'
                ? 'border-accent text-accent bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <svg width="14" height="14" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Wiki</span>
            {contributions.wiki_links && contributions.wiki_links.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                {contributions.wiki_links.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-[10px] sm:text-xs md:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'sources'
                ? 'border-accent text-accent bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <svg width="14" height="14" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Sources</span>
            {contributions.external_sources.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                {contributions.external_sources.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('annotations')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-[10px] sm:text-xs md:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'annotations'
                ? 'border-accent text-accent bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <svg width="14" height="14" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Notes</span>
            {contributions.annotations.filter(a => !a.annotation_type || a.annotation_type === 'annotation').length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                {contributions.annotations.filter(a => !a.annotation_type || a.annotation_type === 'annotation').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('commentaries')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-[10px] sm:text-xs md:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'commentaries'
                ? 'border-accent text-accent bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <svg width="14" height="14" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>Commentaires</span>
            {contributions.annotations.filter(a => a.annotation_type === 'commentary' || a.annotation_type === 'meditation').length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                {contributions.annotations.filter(a => a.annotation_type === 'commentary' || a.annotation_type === 'meditation').length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 bg-white">
          {activeTab === 'links' && (
            <LinksTab links={contributions.links} currentUserId={currentUserId} onRefresh={onRefresh} />
          )}
          {activeTab === 'wiki' && (
            <WikiTab wiki_links={contributions.wiki_links || []} />
          )}
          {activeTab === 'sources' && (
            <SourcesTab sources={contributions.external_sources} />
          )}
          {activeTab === 'annotations' && (
            <AnnotationsTab
              verseId={verseId}
              annotations={contributions.annotations.filter(a => !a.annotation_type || a.annotation_type === 'annotation')}
              onRefresh={onRefresh}
              currentUserId={currentUserId}
              title="Notes personnelles"
            />
          )}
          {activeTab === 'commentaries' && (
            <AnnotationsTab
              verseId={verseId}
              annotations={contributions.annotations.filter(a => a.annotation_type === 'commentary' || a.annotation_type === 'meditation')}
              onRefresh={onRefresh}
              currentUserId={currentUserId}
              title="Commentaires & Méditations"
              allowAdd={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function LinksTab({ links, currentUserId, onRefresh }: { links: VerseLink[]; currentUserId?: string; onRefresh?: () => void }) {
  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-300 mb-3">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <p className="text-slate-500">Aucun lien pour ce verset</p>
        <p className="text-sm text-slate-400 mt-1">Soyez le premier à créer un lien !</p>
      </div>
    );
  }

  const linkTypeLabels: Record<string, string> = {
    citation: 'Citation directe',
    parallel: 'Parallèle thématique',
    prophecy: 'Prophétie accomplie',
    typology: 'Typologie',
    commentary: 'Commentaire',
    concordance: 'Concordance (autre version)',
  };

  const linkTypeColors: Record<string, string> = {
    citation: 'bg-blue-100 text-blue-700',
    parallel: 'bg-green-100 text-green-700',
    prophecy: 'bg-purple-100 text-purple-700',
    typology: 'bg-orange-100 text-orange-700',
    commentary: 'bg-slate-100 text-slate-700',
    concordance: 'bg-teal-100 text-teal-700',
  };

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <VerseLinkItem
          key={link.id}
          link={link}
          currentUserId={currentUserId}
          linkTypeLabels={linkTypeLabels}
          linkTypeColors={linkTypeColors}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

// Composant individuel pour un lien biblique avec bouton de suppression
function VerseLinkItem({
  link,
  currentUserId,
  linkTypeLabels,
  linkTypeColors,
  onRefresh,
}: {
  link: VerseLink;
  currentUserId?: string;
  linkTypeLabels: Record<string, string>;
  linkTypeColors: Record<string, string>;
  onRefresh?: () => void;
}) {
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteVerseLinkAction, null);
  const isOwner = currentUserId && link.author_id === currentUserId;

  // Effet pour détecter le succès de la suppression et rafraîchir
  useEffect(() => {
    if (deleteState?.success) {
      // Attendre un peu avant de rafraîchir pour montrer le succès
      setTimeout(() => {
        onRefresh?.();
      }, 500);
    }
  }, [deleteState, onRefresh]);

  // Debug log
  useEffect(() => {
    console.log('[VerseLinkItem] link data:', {
      linkId: link.id,
      hasBibleVerses: !!link.bible_verses,
      bibleVerses: link.bible_verses,
      currentUserId,
      authorId: link.author_id,
      isOwner,
    });
  }, [link, currentUserId, isOwner]);

  // Vérifier si c'est un lien biblique avec verse reliée ou une référence textuelle libre
  const isTextReference = !link.bible_verses;

  // Générer l'URL du livre (utiliser slug ou id en fallback)
  const bookSlug = link.bible_verses?.bible_books?.slug || link.bible_verses?.bible_books?.id || '';
  const hasVerseText = link.bible_verses?.text;

  // Générer l'URL correcte selon le type de verset (bible ou apocryphal)
  const isApocryphal = link.target_verse_type === 'apocryphal';
  const verseUrl = isApocryphal
    ? `/apocrypha/${bookSlug}/${link.bible_verses?.chapter}`
    : `/bible/${bookSlug}/${link.bible_verses?.chapter}`;

  // URL avec ancre vers le verset spécifique
  const verseUrlWithAnchor = link.bible_verses
    ? `${verseUrl}#verse-${link.bible_verses.verse}`
    : verseUrl;

  // Formater le nom de la traduction pour l'affichage
  const getTranslationName = (translationId?: string) => {
    if (!translationId) return '';
    if (translationId === 'auto') return 'Apocryphe';
    if (translationId === 'gemini-3-flash') return 'Apocryphe';
    if (translationId === 'original') return 'Texte original';

    // Noms des traductions bibliques
    const translationNames: Record<string, string> = {
      'crampon': 'Bible Crampon',
      'jerusalem': 'Bible de Jérusalem',
      'osty': 'Bible Osty',
      'tob': 'Bible Tob',
      'septante': 'Septante',
      'liturgique': 'Traduction Liturgique',
      'vulgate': 'Vulgate',
      'grec': 'Texte Grec',
      'hebreu': 'Texte Hébreu',
      'latin': 'Texte Latin',
    };
    return translationNames[translationId] || translationId;
  };

  const translationName = getTranslationName(link.bible_verses?.translation_id);

  return (
    <div className="relative">
      <div
        className={`p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg md:rounded-xl border ${isOwner ? 'border-accent/40' : 'border-slate-200'} hover:shadow-md transition-shadow`}
      >
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary text-sm sm:text-base md:text-lg">
              {isTextReference ? (
                <span className="text-slate-500">Référence libre</span>
              ) : link.bible_verses ? (
                <>
                  {link.bible_verses.bible_books.name} {link.bible_verses.chapter}:{link.bible_verses.verse}
                  {translationName && (
                    <span className="ml-2 text-xs font-normal text-slate-500">({translationName})</span>
                  )}
                </>
              ) : (
                <span className="text-slate-500">Sans cible</span>
              )}
            </h3>
            {link.target_reference && isTextReference && (
              <p className="text-[10px] sm:text-xs text-slate-500 italic truncate">"{link.target_reference}"</p>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <LikeButton
              contributionType="link"
              contributionId={link.id}
              initialLiked={false}
              initialCount={link.likes_count || 0}
              size="sm"
            />
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 py-1 rounded-full font-medium ${linkTypeColors[link.link_type]}`}>
              {linkTypeLabels[link.link_type] || link.link_type}
            </span>
            {isOwner && (
              <form action={deleteFormAction} className="inline">
                <input type="hidden" name="link_id" value={link.id} />
                <button
                  type="submit"
                  disabled={deletePending}
                  className="p-1 sm:p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Supprimer"
                >
                  <svg width="14" height="14" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={deletePending ? 'animate-pulse' : ''}>
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Texte du verset référencé + bouton de navigation */}
        {!isTextReference && link.bible_verses && (
          <>
            {hasVerseText ? (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border border-accent/30">
                <p className="text-slate-700 italic mb-2 text-xs sm:text-sm truncate">"{link.bible_verses.text}"</p>
                {bookSlug && (
                  <a
                    href={verseUrlWithAnchor}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <svg width="12" height="12" className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span className="hidden sm:inline">Voir</span> verset
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-700 text-xs sm:text-sm">Texte non disponible</p>
                {bookSlug && (
                  <a
                    href={verseUrlWithAnchor}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-xs sm:text-sm font-medium mt-2"
                  >
                    <svg width="12" height="12" className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span className="hidden sm:inline">Voir</span> chapitre
                  </a>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 sm:gap-3 mt-2 text-[10px] sm:text-xs text-slate-500 flex-wrap">
          {link.author && (
            <span className="flex items-center gap-1">
              <svg width="10" height="10" className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {link.author.username || 'Anonyme'}
            </span>
          )}
          {link.created_at && (
            <span>• {new Date(link.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          )}
        </div>
        {link.description && (
          <p className="text-slate-600 mt-2 text-xs sm:text-sm">{link.description}</p>
        )}
        {deleteState?.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            {deleteState.error}
          </div>
        )}
        {deleteState?.success && (
          <div className="absolute inset-0 bg-white/90 rounded-lg md:rounded-xl flex items-center justify-center">
            <div className="text-center p-2">
              <svg width="24" height="24" className="w-6 h-6 sm:w-8 sm:w-8 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500 mb-1 sm:mb-2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <p className="text-green-600 font-medium text-xs sm:text-sm">Supprimé !</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SourcesTab({ sources }: { sources: ExternalSource[] }) {
  if (sources.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10 md:py-12">
        <svg width="36" height="36" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-300 mb-2 sm:mb-3">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <p className="text-sm sm:text-base text-slate-500">Aucune source externe</p>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Ajoutez des citations de Saints</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {sources.map((item) => {
        if (!item.external_source) {
          return null;
        }

        return (
          <div
            key={item.id}
            className="p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg md:rounded-xl border border-amber-200 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-primary mb-1 text-sm sm:text-base">
              {item.external_source.title}
            </h3>
          {item.external_source.author_name && (
            <p className="text-xs sm:text-sm text-slate-600 mb-1 flex items-center gap-1">
              <svg width="12" height="12" className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {item.external_source.author_name}
            </p>
          )}
          {item.external_source.reference && (
            <p className="text-[10px] sm:text-xs text-slate-500 mb-2 italic">
              {item.external_source.reference}
            </p>
          )}
          <p className="text-xs sm:text-sm text-slate-700 italic border-l-2 sm:border-l-3 border-accent pl-2 sm:pl-3">
            "{item.external_source.content}"
          </p>
        </div>
        );
      })}
    </div>
  );
}

function WikiTab({ wiki_links }: { wiki_links: WikiLink[] }) {
  if (wiki_links.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10 md:py-12">
        <svg width="36" height="36" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-300 mb-2 sm:mb-3">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <p className="text-sm sm:text-base text-slate-500">Aucun article wiki lié</p>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Ce verset n'est pas lié au wiki</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {wiki_links.map((link) => (
        <div
          key={link.id}
          className="p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg md:rounded-xl border border-purple-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2 gap-2">
            <h3 className="font-semibold text-primary text-sm sm:text-base md:text-lg">
              {link.wiki_article?.title || 'Article inconnu'}
            </h3>
          </div>
          {link.description && (
            <p className="text-slate-600 mt-2 mb-2 sm:mb-3 text-xs sm:text-sm">{link.description}</p>
          )}
          <a
            href={`/wiki/${link.wiki_article?.slug || '#'}`}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium"
          >
            <svg width="12" height="12" className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span className="hidden sm:inline">Lire</span> l'article
          </a>
        </div>
      ))}
    </div>
  );
}

function AnnotationsTab({
  verseId,
  annotations,
  onRefresh,
  currentUserId,
  title = "Annotations",
  defaultType = "annotation",
  allowAdd = true,
}: {
  verseId: string;
  annotations: Annotation[];
  onRefresh?: () => void;
  currentUserId?: string;
  title?: string;
  defaultType?: string;
  allowAdd?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    console.log('[AnnotationsTab] handleSubmit START');
    setPending(true);
    setError(null);

    try {
      const result = await createAnnotationAction(null, formData);
      console.log('[AnnotationsTab] createAnnotationAction result:', result);

      if (result.error) {
        setError(result.error);
      } else {
        console.log('[AnnotationsTab] About to call onRefresh()...');
        await onRefresh?.();
        console.log('[AnnotationsTab] onRefresh() completed');
      }
    } catch (err) {
      console.error('[AnnotationsTab] Error:', err);
      setError("Une erreur est survenue");
    } finally {
      setPending(false);
      console.log('[AnnotationsTab] handleSubmit END');
    }
  };

  if (annotations.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="text-center py-8 sm:py-10 md:py-12">
          <svg width="36" height="36" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-300 mb-2 sm:mb-3">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm sm:text-base text-slate-500">Aucune {title.toLowerCase()}</p>
          {allowAdd && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {title === "Commentaires & Méditations" ? "Partagez votre commentaire ou méditation" : "Partagez votre réflexion"}
            </p>
          )}
        </div>
        {allowAdd && <AnnotationForm verseId={verseId} onSubmit={handleSubmit} pending={pending} error={error} defaultType={defaultType} />}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {allowAdd && <AnnotationForm verseId={verseId} onSubmit={handleSubmit} pending={pending} error={error} defaultType={defaultType} />}

      {annotations.map((annotation) => (
        <AnnotationItem
          key={annotation.id}
          annotation={annotation}
          verseId={verseId}
          onRefresh={onRefresh}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

function AnnotationForm({
  verseId,
  onSubmit,
  pending,
  error,
  parentId = null,
  placeholder = "Ajoutez votre annotation...",
  defaultType = "annotation",
}: {
  verseId: string;
  onSubmit: (formData: FormData) => void | Promise<void>;
  pending: boolean;
  error: string | null;
  parentId?: string | null;
  placeholder?: string;
  defaultType?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData).then(() => {
      if (!error) {
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-slate-50 p-2.5 sm:p-3 md:p-4 rounded-lg md:rounded-xl border border-slate-200">
      <input type="hidden" name="verse_id" value={verseId} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}

      {error && (
        <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs sm:text-sm">
          ⚠️ {error}
        </div>
      )}

      <textarea
        name="content"
        placeholder={placeholder}
        className="w-full p-2 sm:p-2.5 md:p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-xs sm:text-sm"
        rows={2}
        disabled={pending}
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-2 sm:mt-3 w-full bg-accent text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
      >
        {pending ? (
          <>
            <svg className="animate-spin" width="14" height="14" className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Envoi...
          </>
        ) : (
          <>
            <svg width="14" height="14" className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {parentId ? 'Répondre' : 'Ajouter'}
          </>
        )}
      </button>
    </form>
  );
}

interface AnnotationItemProps {
  annotation: Annotation;
  verseId: string;
  depth?: number;
  onRefresh?: () => void;
  currentUserId?: string;
}

function AnnotationItem({ annotation, verseId, depth = 0, onRefresh, currentUserId }: AnnotationItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const maxDepth = 3;

  const isOwner = currentUserId && annotation.author_id === currentUserId;

  const handleReplySubmit = async (formData: FormData) => {
    setPending(true);
    setError(null);

    try {
      const result = await createAnnotationAction(null, formData);

      if (result.error) {
        setError(result.error);
      } else {
        setShowReplyForm(false);
        onRefresh?.();
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const formData = new FormData();
      formData.append('annotation_id', annotation.id);
      const result = await deleteAnnotationAction(null, formData);

      if (result.error) {
        setError(result.error);
        setShowDeleteConfirm(false);
      } else {
        setShowDeleteConfirm(false);
        onRefresh?.();
      }
    } catch (err) {
      setError("Une erreur est survenue");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg md:rounded-xl border border-blue-200 hover:shadow-md transition-shadow ${depth > 0 ? 'ml-3 sm:ml-4 md:ml-6 mt-2 bg-white/70' : ''}`}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-xs sm:text-sm text-primary flex items-center gap-1 sm:gap-1.5">
            <svg width="12" height="12" className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="truncate">{annotation.user_profile?.username || 'Anonyme'}</span>
          </span>
          {/* Badge pour le type d'annotation */}
          {annotation.annotation_type === 'commentary' && (
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
              Commentaire
            </span>
          )}
          {annotation.annotation_type === 'meditation' && (
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              Méditation
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <LikeButton
            contributionType="annotation"
            contributionId={annotation.id}
            initialLiked={false}
            initialCount={annotation.likes_count || 0}
            size="sm"
          />
          <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">
            {new Date(annotation.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      </div>
      <p className="text-slate-700 text-xs sm:text-sm break-words">{annotation.content}</p>

      <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
        {depth < maxDepth && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs sm:text-sm text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
          >
            <svg width="12" height="12" className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.38 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {showReplyForm ? 'Annuler' : 'Répondre'}
          </button>
        )}

        {isOwner && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="text-xs sm:text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            {deleting ? 'Suppression...' : 'Supprimer'}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-3">
          <AnnotationForm
            verseId={verseId}
            onSubmit={handleReplySubmit}
            pending={pending}
            error={error}
            parentId={annotation.id}
            placeholder="Répondez à cette annotation..."
          />
        </div>
      )}

      {annotation.replies && annotation.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {annotation.replies.map((reply) => (
            <AnnotationItem
              key={reply.id}
              annotation={reply}
              verseId={verseId}
              depth={depth + 1}
              onRefresh={onRefresh}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">Supprimer l'annotation ?</h3>
              <p className="text-sm text-slate-600">Cette action est irréversible. Voulez-vous vraiment supprimer cette annotation ?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
