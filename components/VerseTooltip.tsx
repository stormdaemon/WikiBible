'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface VerseTranslation {
  translation_id: string;
  translation_name: string;
  verse_text: string;
}

interface VerseTooltipProps {
  bookSlug: string;
  chapter: number;
  verse: number;
  children: React.ReactNode;
  reference?: string;
}

export function VerseTooltip({ bookSlug, chapter, verse, children, reference }: VerseTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [translations, setTranslations] = useState<VerseTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const fetchTranslations = async () => {
    if (translations.length > 0) return; // Déjà chargé

    setIsLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .rpc('get_verse_translations', {
        p_book_slug: bookSlug,
        p_chapter: chapter,
        p_verse: verse,
      });

    if (!error && data) {
      setTranslations(data);
    } else if (error) {
      console.error('[VerseTooltip] RPC error:', error);
    }
    setIsLoading(false);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    // Avec position: fixed, rect donne déjà les coordonnées relatives au viewport
    setPosition({
      top: rect.bottom + 8,
      left: rect.left,
    });

    setIsVisible(true);
    fetchTranslations();
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Styles dynamiques pour positionner la tooltip
  const getTooltipStyle = (): React.CSSProperties => {
    if (!triggerRef.current) {
      return { display: 'none' };
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const style: React.CSSProperties = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      zIndex: 9999,
    };

    // Ajuster si trop proche du bord droit
    if (rect.left + 400 > window.innerWidth) {
      style.left = `${window.innerWidth - 420}px`;
    }

    return style;
  };

  const translationColors: Record<string, string> = {
    crampon: 'border-amber-300 bg-amber-50',
    jerusalem: 'border-blue-300 bg-blue-50',
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border-b-2 border-dashed border-accent text-accent hover:bg-accent/10 transition-colors cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          style={getTooltipStyle()}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-md">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 text-lg">
                {reference || `${bookSlug} ${chapter}:${verse}`}
              </h4>
              <span className="text-xs text-gray-500">
                {translations.length} traduction{translations.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Contenu */}
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
              </div>
            ) : translations.length > 0 ? (
              <div className="space-y-3">
                {translations.map((t) => (
                  <div
                    key={t.translation_id}
                    className={`p-3 rounded-lg border-l-4 ${translationColors[t.translation_id] || 'border-gray-300 bg-gray-50'}`}
                  >
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t.translation_name}
                    </p>
                    <p className="text-gray-800 leading-relaxed">
                      {t.verse_text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Aucune traduction disponible
              </p>
            )}

            {/* Liens vers chaque traduction */}
            {translations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                {translations.map((t) => (
                  <Link
                    key={t.translation_id}
                    href={`/bible/${bookSlug}/${chapter}?translation=${t.translation_id}#verse-${verse}`}
                    className="block text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                    onClick={() => setIsVisible(false)}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>Voir {t.translation_name}</span>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
