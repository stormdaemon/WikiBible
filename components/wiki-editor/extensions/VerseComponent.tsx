'use client';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import Link from 'next/link';

interface VerseComponentProps {
  node: {
    attrs: {
      reference: string;
      book: string;
      chapter: string;
      verse?: string;
    };
  };
}

/**
 * VerseComponent - Composant React pour l'affichage des versets bibliques
 *
 * Affiche un badge cliquable avec un aperçu au survol
 */
export default function VerseComponent({ node }: VerseComponentProps) {
  const { reference, book, chapter, verse } = node.attrs;
  const [showTooltip, setShowTooltip] = useState(false);

  // Générer le lien vers la Bible
  const slug = bookToSlug(book);
  const href = verse
    ? `/bible/${slug}/${chapter}/${verse}`
    : `/bible/${slug}/${chapter}`;

  return (
    <NodeViewWrapper className="inline-block mx-1">
      <Link
        href={href}
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-sm font-medium hover:bg-amber-200 cursor-pointer transition-colors border border-amber-300 no-underline"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="flex-shrink-0"
        >
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span>{reference}</span>
      </Link>

      {showTooltip && (
        <div className="absolute z-50 mt-2 p-3 bg-slate-900 text-white text-sm rounded-lg shadow-xl max-w-xs">
          <p className="font-semibold mb-1">{reference}</p>
          <p className="text-slate-300 text-xs">Cliquez pour voir le verset</p>
        </div>
      )}
    </NodeViewWrapper>
  );
}

/**
 * Convertit un nom de livre en slug
 */
function bookToSlug(bookName: string): string {
  const bookMapping: Record<string, string> = {
    'Genèse': 'genese',
    'Exode': 'exode',
    'Lévitique': 'levitique',
    'Nombres': 'nombres',
    'Deutéronome': 'deuterome',
    'Josué': 'josue',
    'Juges': 'juges',
    'Ruth': 'ruth',
    '1 Samuel': '1-samuel',
    '2 Samuel': '2-samuel',
    '1 Rois': '1-rois',
    '2 Rois': '2-rois',
    '1 Chroniques': '1-chroniques',
    '2 Chroniques': '2-chroniques',
    'Esdras': 'esdras',
    'Néhémie': 'nehemie',
    'Tobie': 'tobie',
    'Judith': 'judith',
    'Esther': 'ester',
    '1 Maccabées': '1-macchabees',
    '2 Maccabées': '2-macchabees',
    'Job': 'job',
    'Psaumes': 'psaumes',
    'Proverbes': 'proverbes',
    'Ecclésiaste': 'ecclesiaste',
    'Cantique des Cantiques': 'cantique',
    'Cantique des cantiques': 'cantique',
    'Sagesse': 'sagesse',
    'Siracide': 'siracide',
    'Isaïe': 'eesaie',
    'Jérémie': 'jeremie',
    'Lamentations': 'lamentations',
    'Baruch': 'baruch',
    'Ézéchiel': 'ezechiel',
    'Daniel': 'daniel',
    'Osée': 'oslee',
    'Joël': 'joel',
    'Amos': 'amos',
    'Abdias': 'abdias',
    'Jonas': 'jonas',
    'Michée': 'michee',
    'Nahum': 'nahum',
    'Habacuc': 'habacuc',
    'Sophonie': 'sophonie',
    'Aggée': 'aggee',
    'Zacharie': 'zacharie',
    'Malachie': 'malachie',
    'Matthieu': 'matthieu',
    'Marc': 'marc',
    'Luc': 'luc',
    'Jean': 'jean',
    'Actes des Apôtres': 'actes',
    'Romains': 'romains',
    '1 Corinthiens': '1-corinthiens',
    '2 Corinthiens': '2-corinthiens',
    'Galates': 'galates',
    'Éphésiens': 'ephesiens',
    'Philippiens': 'philippiens',
    'Colossiens': 'colossiens',
    '1 Thessaloniciens': '1-thesaloniciens',
    '2 Thessaloniciens': '2-thesaloniciens',
    '1 Timothée': '1-timothee',
    '2 Timothée': '2-timothee',
    'Tite': 'tite',
    'Philémon': 'philemon',
    'Hébreux': 'hebreux',
    'Jacques': 'jacques',
    '1 Pierre': '1-pierre',
    '2 Pierre': '2-pierre',
    '1 Jean': '1-jean',
    '2 Jean': '2-jean',
    '3 Jean': '3-jean',
    'Jude': 'jude',
    'Apocalypse': 'apocalypse',
  };

  return (
    bookMapping[bookName] ||
    bookName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  );
}
