'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface VerseTranslation {
  translation_id: string;
  translation_name: string;
  verse_text: string;
}

interface VerseTooltipTriggerProps {
  bookSlug: string;
  chapter: number;
  verse: number;
  children: React.ReactNode;
  reference?: string;
}

export function VerseTooltipTrigger({ bookSlug, chapter, verse, children, reference }: VerseTooltipTriggerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [translations, setTranslations] = useState<VerseTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobileRef = useRef(false);

  // Detect mobile device
  useEffect(() => {
    isMobileRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const hideTooltip = useCallback(() => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 300); // 300ms delay before hiding
  }, [clearHideTimeout]);

  const showTooltip = useCallback(() => {
    clearHideTimeout();
    if (!triggerRef.current) return;

    setIsVisible(true);
    fetchTranslations();
  }, [clearHideTimeout]);

  const fetchTranslations = async () => {
    if (translations.length > 0) return;

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

  const handleMouseEnter = () => {
    if (!isMobileRef.current) {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobileRef.current) {
      hideTooltip();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isMobileRef.current) {
      e.preventDefault();
      e.stopPropagation();
      if (isVisible) {
        setIsVisible(false);
      } else {
        showTooltip();
      }
    }
  };

  // Close tooltip when clicking outside on mobile
  useEffect(() => {
    if (!isVisible || !isMobileRef.current) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, [clearHideTimeout]);

  const translationColors: Record<string, string> = {
    crampon: 'border-amber-300 bg-amber-50',
    jerusalem: 'border-blue-300 bg-blue-50',
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline px-1 border-b border-dashed border-accent text-accent hover:bg-accent/10 transition-colors cursor-help"
        style={{ lineHeight: 'inherit' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchEnd={(e) => {
          if (isMobileRef.current) {
            handleClick(e as any);
          }
        }}
      >
        {children}
      </span>

      {isVisible && createPortal(
        <>
          {/* Backdrop for mobile */}
          {isMobileRef.current && (
            <div
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={() => setIsVisible(false)}
            />
          )}
          <div
            ref={tooltipRef}
            className={isMobileRef.current ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90vw] max-h-[80vh] overflow-y-auto" : "absolute z-[9999]"}
            style={
              !isMobileRef.current && triggerRef.current
                ? {
                    top: `${triggerRef.current.getBoundingClientRect().bottom + window.scrollY + 8}px`,
                    left: `${triggerRef.current.getBoundingClientRect().left + window.scrollX}px`,
                  }
                : undefined
            }
            onMouseEnter={() => {
              if (!isMobileRef.current) {
                clearHideTimeout();
                setIsVisible(true);
              }
            }}
            onMouseLeave={() => {
              if (!isMobileRef.current) {
                hideTooltip();
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {reference || `${bookSlug} ${chapter}:${verse}`}
                </h4>
                <span className="text-xs text-gray-500">
                  {translations.length} traduction{translations.length > 1 ? 's' : ''}
                </span>
              </div>

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
        </>,
        document.body
      )}
    </>
  );
}
