'use client';

import { useState } from 'react';

interface ApocryphaVerseCardProps {
  verseId: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  textOriginal: string;
  textFr: string;
  onOpenAddLink: () => void;
  onOpenContributions: () => void;
  isAuthenticated: boolean;
  contributions?: {
    links: number;
    annotations: number;
  };
}

export function ApocryphaVerseCard({
  verseId,
  bookName,
  chapter,
  verseNumber,
  textOriginal,
  textFr,
  onOpenAddLink,
  onOpenContributions,
  isAuthenticated,
  contributions,
}: ApocryphaVerseCardProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  const hasContributions =
    contributions &&
    (contributions.links > 0 || contributions.annotations > 0);

  const totalContributions = hasContributions
    ? (contributions.links! + contributions.annotations!)
    : 0;

  const toggleOriginal = () => {
    setShowOriginal(!showOriginal);
  };

  return (
    <article
      id={`verse-${verseNumber}`}
      className="bg-white p-6 rounded-lg border border-border hover:border-accent transition-colors"
    >
      {/* Header avec numéro et actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Numéro de verset */}
          <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
            {verseNumber}
          </span>

          {/* Badge contributions */}
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
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Bouton Voir les contributions */}
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

          {/* Bouton Ajouter un lien - SEULEMENT si connecté */}
          {isAuthenticated === true && (
            <button
              onClick={onOpenAddLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
              title="Ajouter une contribution"
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

      {/* Texte français */}
      <div className="mb-4">
        <p className="text-lg text-slate-800 leading-relaxed">
          {textFr}
        </p>
      </div>

      {/* Texte original en toggle avec animation fluide */}
      <div className="mb-4">
        <button
          onClick={toggleOriginal}
          className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showOriginal ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          Voir le texte original
        </button>

        {/* Contenu avec animation */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showOriginal ? 'max-h-96 mt-3 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 bg-slate-50 rounded text-slate-600 italic">
            <p className="text-sm leading-relaxed">
              {textOriginal}
            </p>
          </div>
        </div>
      </div>

      {/* Lien permanent */}
      <a
        href={`#${chapter}:${verseNumber}`}
        className="text-xs text-slate-400 hover:text-accent inline-flex items-center gap-1"
      >
        🔗 Lien permanent
      </a>
    </article>
  );
}
