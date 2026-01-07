'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { createAnnotationAction } from '@/app/actions';
import { LikeButton } from './LikeButton';

interface VerseLink {
  id: string;
  link_type: string;
  description: string | null;
  likes_count?: number;
  bible_verses: {
    id: string;
    verse: number;
    chapter: number;
    bible_books: {
      name: string;
    };
  };
  author_id: string | null;
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
  likes_count?: number;
  author?: {
    id: string;
    username: string | null;
  };
  replies?: Array<{
    id: string;
    content: string;
    created_at: string;
    author?: {
      id: string;
      username: string | null;
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
}

type TabType = 'links' | 'wiki' | 'sources' | 'annotations';

export function AnnotationModal({
  verseId,
  verseReference,
  contributions,
  isOpen,
  onClose,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-primary">Contributions</h2>
            <p className="text-sm text-slate-500 mt-0.5">{verseReference}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'links'
                ? 'border-accent text-accent bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Liens bibliques</span>
            {contributions.links.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                {contributions.links.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wiki')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'wiki'
                ? 'border-accent text-accent bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Articles Wiki</span>
            {contributions.wiki_links && contributions.wiki_links.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                {contributions.wiki_links.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'sources'
                ? 'border-accent text-accent bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Sources externes</span>
            {contributions.external_sources.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                {contributions.external_sources.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('annotations')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'annotations'
                ? 'border-accent text-accent bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Annotations</span>
            {contributions.annotations.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                {contributions.annotations.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
          {activeTab === 'links' && (
            <LinksTab links={contributions.links} />
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
              annotations={contributions.annotations}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function LinksTab({ links }: { links: VerseLink[] }) {
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
        <div
          key={link.id}
          className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-primary text-lg">
              {link.bible_verses.bible_books.name} {link.bible_verses.chapter}:{link.bible_verses.verse}
            </h3>
            <div className="flex items-center gap-2">
              <LikeButton
                contributionType="link"
                contributionId={link.id}
                initialLiked={false}
                initialCount={link.likes_count || 0}
                size="sm"
              />
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${linkTypeColors[link.link_type]}`}>
                {linkTypeLabels[link.link_type] || link.link_type}
              </span>
            </div>
          </div>
          {link.description && (
            <p className="text-slate-600 mt-2">{link.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function SourcesTab({ sources }: { sources: ExternalSource[] }) {
  if (sources.length === 0) {
    return (
      <div className="text-center py-12">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-300 mb-3">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <p className="text-slate-500">Aucune source externe</p>
        <p className="text-sm text-slate-400 mt-1">Ajoutez des citations de Saints ou Pères de l'Église</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((item) => (
        <div
          key={item.id}
          className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-primary mb-1">
            {item.external_source.title}
          </h3>
          {item.external_source.author_name && (
            <p className="text-sm text-slate-600 mb-1 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {item.external_source.author_name}
            </p>
          )}
          {item.external_source.reference && (
            <p className="text-xs text-slate-500 mb-2 italic">
              {item.external_source.reference}
            </p>
          )}
          <p className="text-sm text-slate-700 italic border-l-3 border-accent pl-3">
            "{item.external_source.content}"
          </p>
        </div>
      ))}
    </div>
  );
}

function WikiTab({ wiki_links }: { wiki_links: WikiLink[] }) {
  if (wiki_links.length === 0) {
    return (
      <div className="text-center py-12">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-300 mb-3">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <p className="text-slate-500">Aucun article wiki lié</p>
        <p className="text-sm text-slate-400 mt-1">Ce verset n'est pas lié à des articles du wiki</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {wiki_links.map((link) => (
        <div
          key={link.id}
          className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-primary text-lg">
              {link.wiki_article?.title || 'Article inconnu'}
            </h3>
          </div>
          {link.description && (
            <p className="text-slate-600 mt-2 mb-3">{link.description}</p>
          )}
          <a
            href={`/wiki/${link.wiki_article?.slug || '#'}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Lire l'article
          </a>
        </div>
      ))}
    </div>
  );
}

function AnnotationsTab({
  verseId,
  annotations,
}: {
  verseId: string;
  annotations: Annotation[];
}) {
  const [state, formAction, pending] = useActionState(createAnnotationAction, null);

  if (annotations.length === 0 && !state?.success) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-300 mb-3">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-slate-500">Aucune annotation</p>
          <p className="text-sm text-slate-400 mt-1">Partagez votre réflexion sur ce verset</p>
        </div>
        <AnnotationForm verseId={verseId} formAction={formAction} pending={pending} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnnotationForm verseId={verseId} formAction={formAction} pending={pending} />

      {annotations.map((annotation) => (
        <AnnotationItem
          key={annotation.id}
          annotation={annotation}
          verseId={verseId}
        />
      ))}
    </div>
  );
}

function AnnotationForm({
  verseId,
  formAction,
  pending,
  parentId = null,
  placeholder = "Ajoutez votre annotation...",
}: {
  verseId: string;
  formAction: any;
  pending: boolean;
  parentId?: string | null;
  placeholder?: string;
}) {
  return (
    <form action={formAction} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <input type="hidden" name="verse_id" value={verseId} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <textarea
        name="content"
        placeholder={placeholder}
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
        rows={3}
        disabled={pending}
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-3 w-full bg-accent text-white py-2.5 px-4 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Envoi...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {parentId ? 'Répondre' : 'Ajouter une annotation'}
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
}

function AnnotationItem({ annotation, verseId, depth = 0 }: AnnotationItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [state, formAction, pending] = useActionState(createAnnotationAction, null);
  const maxDepth = 3; // Limite de profondeur pour les réponses

  const handleReplySuccess = () => {
    if (state?.success) {
      setShowReplyForm(false);
    }
  };

  // Effet pour fermer le formulaire après succès
  useEffect(() => {
    handleReplySuccess();
  }, [state]);

  return (
    <div
      className={`p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow ${depth > 0 ? 'ml-6 mt-2 bg-white/70' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-medium text-sm text-primary flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {annotation.author?.username || 'Anonyme'}
        </span>
        <div className="flex items-center gap-2">
          <LikeButton
            contributionType="annotation"
            contributionId={annotation.id}
            initialLiked={false}
            initialCount={annotation.likes_count || 0}
            size="sm"
          />
          <span className="text-xs text-slate-500">
            {new Date(annotation.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
      <p className="text-slate-700">{annotation.content}</p>

      {/* Bouton Répondre */}
      {depth < maxDepth && (
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="mt-2 text-sm text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          {showReplyForm ? 'Annuler' : 'Répondre'}
        </button>
      )}

      {/* Formulaire de réponse */}
      {showReplyForm && (
        <div className="mt-3">
          <AnnotationForm
            verseId={verseId}
            formAction={formAction}
            pending={pending}
            parentId={annotation.id}
            placeholder="Répondez à cette annotation..."
          />
        </div>
      )}

      {/* Affichage des réponses imbriquées */}
      {annotation.replies && annotation.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {annotation.replies.map((reply) => (
            <AnnotationItem
              key={reply.id}
              annotation={{
                ...reply,
                author_id: reply.author?.id || '',
              }}
              verseId={verseId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
