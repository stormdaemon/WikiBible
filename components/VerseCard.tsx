'use client';

import { useState } from 'react';

interface WikiLink {
  id: string;
  wiki_article: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

interface VerseCardProps {
  verseId: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  text: string;
  translation: string;
  contributions?: {
    links: number;
    annotations: number;
    external_sources: number;
    wiki_links?: WikiLink[];
    linkDetails?: Array<{
      id: string;
      link_type: string;
      link_subtype?: string;
      is_prophecy?: boolean;
      author: {
        username: string | null;
        confession: string;
      };
      target_verse?: {
        book_name: string;
        chapter: number;
        verse: number;
      };
    }>;
  };
  onOpenContributions: () => void;
  onOpenAddLink: () => void;
  isAuthenticated: boolean;
  currentUserId?: string;
}

// Couleurs pour les badges confession
const confessionColors = {
  catholic: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  orthodox: 'bg-blue-100 text-blue-800 border-blue-300',
  protestant: 'bg-purple-100 text-purple-800 border-purple-300',
  anglican: 'bg-green-100 text-green-800 border-green-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300',
};

const confessionLabels = {
  catholic: '🙏',
  orthodox: '✝️',
  protestant: '📖',
  anglican: '⛪',
  other: '❓',
};

// Logos f/t/p
const subtypeBadges = {
  figure: { icon: '🎭', letter: 'f', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  type: { icon: '⚏', letter: 't', color: 'bg-green-100 text-green-800 border-green-300' },
  prophecy: { icon: '☀️', letter: 'p', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
};

export function VerseCard({
  verseId,
  bookName,
  chapter,
  verseNumber,
  text,
  translation,
  contributions,
  onOpenContributions,
  onOpenAddLink,
  isAuthenticated,
}: VerseCardProps) {
  const hasContributions =
    contributions &&
    (contributions.links > 0 ||
      contributions.annotations > 0 ||
      contributions.external_sources > 0);

  const totalContributions = hasContributions
    ? (contributions.links! + contributions.annotations! + contributions.external_sources!)
    : 0;

  const hasWikiLinks = contributions?.wiki_links && contributions.wiki_links.length > 0;
  const firstWikiLink = hasWikiLinks ? contributions.wiki_links?.[0] : null;

  return (
    <div className="bg-white p-6 rounded-lg border border-border hover:border-accent transition-all hover:shadow-lg">
      {/* Header avec référence et actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        {/* Référence du verset avec badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-serif text-lg font-bold text-primary">
            {bookName} {chapter}:{verseNumber}
          </span>

          {/* Badges des sous-types de liens (f/t/p) */}
          {contributions?.linkDetails && contributions.linkDetails.map((link) => {
            if (!link.link_subtype) return null;
            const badge = subtypeBadges[link.link_subtype as keyof typeof subtypeBadges];
            if (!badge) return null;

            return (
              <span
                key={link.id}
                className={`px-2 py-1 rounded text-xs font-bold border ${badge.color}`}
                title={`Type: ${link.link_subtype}`}
              >
                {badge.icon} {badge.letter}
              </span>
            );
          })}

          {/* Soleil si prophétie accomplie */}
          {contributions?.linkDetails && contributions.linkDetails.some(link => link.is_prophecy) && (
            <span className="px-2 py-1 rounded text-xs font-bold border bg-yellow-100 text-yellow-800 border-yellow-300" title="Prophétie accomplie">
              ☀️
            </span>
          )}

          {/* Traduction */}
          <span className="badge badge--default">{translation}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Badge de contributions si existant */}
          {hasContributions && (
            <button
              onClick={onOpenContributions}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors text-sm font-medium"
              title={`${totalContributions} contribution(s)`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>{totalContributions}</span>
            </button>
          )}

          {/* Bouton Voir les liens */}
          <button
            onClick={onOpenContributions}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
            title="Voir les contributions"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden sm:inline">Voir</span>
          </button>

          {/* Bouton Lire l'article Wiki - SEULEMENT si lien wiki existe */}
          {hasWikiLinks && firstWikiLink?.wiki_article && (
            <a
              href={`/wiki/${firstWikiLink.wiki_article.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium shadow-sm"
              title="Lire l'article wiki associé"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="hidden sm:inline">Lire l'article</span>
            </a>
          )}

          {/* Bouton Ajouter un lien - SEULEMENT si connecté */}
          {isAuthenticated === true && (
            <button
              onClick={onOpenAddLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
              title="Ajouter un lien"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className="hidden sm:inline">Lier</span>
            </button>
          )}

          {/* Si pas connecté - Bouton de connexion */}
          {isAuthenticated === false && (
            <a
              href="/auth/login"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
              title="Connectez-vous pour ajouter des liens"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="hidden sm:inline">Connexion</span>
            </a>
          )}
        </div>
      </div>

      {/* Texte du verset */}
      <p className="text-lg text-slate-800 leading-relaxed mb-4">
        "{text}"
      </p>

      {/* Badges confession des auteurs de liens */}
      {contributions?.linkDetails && contributions.linkDetails.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {contributions.linkDetails.slice(0, 5).map((link) => {
            const colorClass = confessionColors[link.author.confession as keyof typeof confessionColors] || confessionColors.other;
            const label = confessionLabels[link.author.confession as keyof typeof confessionLabels] || confessionLabels.other;
            return (
              <span
                key={link.id}
                className={`px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}
                title={`Par ${link.author.username || 'Anonyme'} (${link.author.confession})`}
              >
                {label}
              </span>
            );
          })}
          {contributions.linkDetails.length > 5 && (
            <span className="text-xs text-slate-500">+{contributions.linkDetails.length - 5} autres</span>
          )}
        </div>
      )}
    </div>
  );
}
