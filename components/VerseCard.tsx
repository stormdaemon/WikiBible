'use client';

import { useState } from 'react';

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
  };
  onOpenContributions: () => void;
  onOpenAddLink: () => void;
}

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
}: VerseCardProps) {
  const hasContributions =
    contributions &&
    (contributions.links > 0 ||
      contributions.annotations > 0 ||
      contributions.external_sources > 0);

  const totalContributions = hasContributions
    ? (contributions.links! + contributions.annotations! + contributions.external_sources!)
    : 0;

  return (
    <div
      className={`verse-card transition-all hover:shadow-lg ${
        hasContributions ? 'verse-card--highlight' : 'verse-card--accent'
      }`}
    >
      <div className="verse-card__header">
        <span className="verse-card__reference">
          {bookName} {chapter}:{verseNumber}
        </span>

        <div className="verse-card__actions flex items-center gap-2">
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

          {/* Bouton Ajouter un lien */}
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
        </div>
      </div>

      <p className="verse-card__text">"{text}"</p>

      <div className="verse-card__meta">
        <span className="badge badge--default">{translation}</span>
      </div>
    </div>
  );
}
