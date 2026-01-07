'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface BibleEntity {
  id: string;
  name: string;
  slug: string;
  entity_type: 'person' | 'place' | 'concept' | 'event';
  summary: string | null;
  wiki_article_id: string | null;
}

interface BibleTooltipProps {
  entity: BibleEntity;
  children: React.ReactNode;
}

export function BibleTooltip({ entity, children }: BibleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    setPosition({
      top: rect.bottom + scrollY + 8,
      left: rect.left + scrollX,
    });

    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Styles dynamiques pour positionner la tooltip
  const getTooltipStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'absolute',
      top: `${position.top}px`,
      left: `${position.left}px`,
      zIndex: 50,
    };

    // Ajuster si trop proche du bord droit
    if (tooltipRef.current && position.left + 320 > window.innerWidth) {
      style.left = `${window.innerWidth - 340}px`;
      style.right = '20px';
      style.maxWidth = '320px';
    }

    return style;
  };

  const entityTypeColors = {
    person: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    place: 'bg-green-50 border-green-200 hover:bg-green-100',
    concept: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    event: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  };

  const entityTypeIcons = {
    person: '👤',
    place: '📍',
    concept: '💡',
    event: '⚡',
  };

  return (
    <>
      <span
        ref={triggerRef}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border-b-2 border-dashed cursor-pointer transition-colors ${entityTypeColors[entity.entity_type]}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          style={getTooltipStyle()}
          className="pointer-events-none"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm">
            {/* En-tête avec icône et titre */}
            <div className="flex items-start gap-2 mb-2">
              <span className="text-2xl">{entityTypeIcons[entity.entity_type]}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg leading-tight">
                  {entity.name}
                </h4>
                <span className="text-xs text-gray-500 capitalize">
                  {entity.entity_type === 'person' ? 'Personnage' :
                   entity.entity_type === 'place' ? 'Lieu' :
                   entity.entity_type === 'concept' ? 'Concept' : 'Événement'}
                </span>
              </div>
            </div>

            {/* Résumé */}
            {entity.summary && (
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {entity.summary}
              </p>
            )}

            {/* Lien vers l'article wiki */}
            {entity.wiki_article_id ? (
              <Link
                href={`/wiki/${entity.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                En savoir plus
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="text-xs text-gray-400 italic">Article à venir</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
