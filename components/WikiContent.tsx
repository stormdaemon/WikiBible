'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { VerseTooltipTrigger } from './VerseTooltipTrigger';
import Link from 'next/link';

interface WikiContentProps {
  content: string;
}

// Mapping des livres vers leurs slugs
const bookMapping: Record<string, string> = {
  'Genèse': 'genese', 'Exode': 'exode', 'Lévitique': 'levitique', 'Nombres': 'nombres', 'Deutéronome': 'deuterome',
  'Josué': 'josue', 'Juges': 'juges', 'Ruth': 'ruth', '1 Samuel': '1-samuel', '2 Samuel': '2-samuel',
  '1 Rois': '1-rois', '2 Rois': '2-rois', '1 Chroniques': '1-chroniques', '2 Chroniques': '2-chroniques',
  'Esdras': 'esdras', 'Néhémie': 'nehemie', 'Tobie': 'tobie', 'Judith': 'judith', 'Esther': 'ester',
  '1 Maccabées': '1-macchabees', '2 Maccabées': '2-macchabees', 'Job': 'job', 'Psaumes': 'psaumes',
  'Proverbes': 'proverbes', 'Ecclésiaste': 'ecclesiaste', 'Cantique des Cantiques': 'cantique', 'Cantique des cantiques': 'cantique',
  'Sagesse': 'sagesse', 'Siracide': 'siracide', 'Isaïe': 'eesaie', 'Jérémie': 'jeremie', 'Lamentations': 'lamentations',
  'Baruch': 'baruch', 'Ézéchiel': 'ezechiel', 'Daniel': 'daniel', 'Osée': 'oslee', 'Joël': 'joel', 'Amos': 'amos',
  'Abdias': 'abdias', 'Jonas': 'jonas', 'Michée': 'michee', 'Nahum': 'nahum', 'Habacuc': 'habacuc', 'Sophonie': 'sophonie',
  'Aggée': 'aggee', 'Zacharie': 'zacharie', 'Malachie': 'malachie', 'Matthieu': 'matthieu', 'Marc': 'marc', 'Luc': 'luc',
  'Jean': 'jean', 'Actes des Apôtres': 'actes', 'Romains': 'romains', '1 Corinthiens': '1-corinthiens',
  '2 Corinthiens': '2-corinthiens', 'Galates': 'galates', 'Éphésiens': 'ephesiens', 'Philippiens': 'philippiens',
  'Colossiens': 'colossiens', '1 Thessaloniciens': '1-thesaloniciens', '2 Thessaloniciens': '2-thesaloniciens',
  '1 Timothée': '1-timothee', '2 Timothée': '2-timothee', 'Tite': 'tite', 'Philémon': 'philemon', 'Hébreux': 'hebreux',
  'Jacques': 'jacques', '1 Pierre': '1-pierre', '2 Pierre': '2-pierre', '1 Jean': '1-jean', '2 Jean': '2-jean',
  '3 Jean': '3-jean', 'Jude': 'jude', 'Apocalypse': 'apocalypse',
};

function titleToSlug(title: string): string {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseBibleReference(reference: string): { bookSlug: string; chapter: number; verse?: number; verseEnd?: number } | null {
  const biblePattern = /^([A-Za-zÀ-ÿ\s]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/;
  const match = reference.match(biblePattern);
  if (!match) return null;

  const [, book, chapter, verseStart, verseEnd] = match;
  const slug = bookMapping[book.trim()] || titleToSlug(book.trim());
  const chapterNum = parseInt(chapter);

  return { bookSlug: slug, chapter: chapterNum, verse: verseStart ? parseInt(verseStart) : undefined, verseEnd: verseEnd ? parseInt(verseEnd) : undefined };
}

export function WikiContent({ content }: WikiContentProps) {
  // Diviser le contenu en segments (texte et liens wiki)
  const segments: Array<{ type: 'text' | 'wiki-link' | 'bible-link'; content: string; props?: any }> = [];
  let lastIndex = 0;
  const wikiLinkPattern = /\[\[([^\]]+)\]\]/g;
  let match;

  while ((match = wikiLinkPattern.exec(content)) !== null) {
    const fullMatch = match[0];
    const reference = match[1].trim();
    const matchIndex = match.index;

    // Ajouter le texte avant le lien
    if (matchIndex > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, matchIndex) });
    }

    // Parser la référence
    const bibleRef = parseBibleReference(reference);

    if (bibleRef) {
      if (bibleRef.verse) {
        // Verset spécifique avec tooltip
        segments.push({
          type: 'bible-link',
          content: reference,
          props: { bookSlug: bibleRef.bookSlug, chapter: bibleRef.chapter, verse: bibleRef.verse, reference }
        });
      } else {
        // Chapitre entier
        segments.push({
          type: 'wiki-link',
          content: reference,
          props: { href: `/bible/${bibleRef.bookSlug}/${bibleRef.chapter}` }
        });
      }
    } else {
      // Lien wiki vers article
      const slug = titleToSlug(reference);
      segments.push({
        type: 'wiki-link',
        content: reference,
        props: { href: `/wiki/${slug}` }
      });
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  // Ajouter le texte restant
  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return (
    <div className="wiki-content prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="text-4xl font-serif font-bold text-primary mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-3xl font-serif font-semibold text-primary mt-6 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-2xl font-serif font-semibold text-primary mt-5 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-xl font-semibold text-primary mt-4 mb-2">{children}</h4>,
          p: ({ children }) => {
            // Transformer les enfants pour remplacer les liens wiki par des composants
            const processedChildren = React.Children.map(children, (child) => {
              if (typeof child === 'string') {
                // Remplacer les patterns [[lien]] par les composants appropriés
                const parts: React.ReactNode[] = [];
                let lastIndex = 0;
                const wikiLinkPattern = /\[\[([^\]]+)\]\]/g;
                let match;

                while ((match = wikiLinkPattern.exec(child)) !== null) {
                  const fullMatch = match[0];
                  const reference = match[1].trim();
                  const matchIndex = match.index;

                  // Ajouter le texte avant le lien
                  if (matchIndex > lastIndex) {
                    parts.push(child.slice(lastIndex, matchIndex));
                  }

                  // Parser la référence
                  const bibleRef = parseBibleReference(reference);

                  if (bibleRef && bibleRef.verse) {
                    // Verset spécifique avec tooltip
                    parts.push(
                      <VerseTooltipTrigger
                        key={`${matchIndex}-${reference}`}
                        bookSlug={bibleRef.bookSlug}
                        chapter={bibleRef.chapter}
                        verse={bibleRef.verse}
                        reference={reference}
                      >
                        {reference}
                      </VerseTooltipTrigger>
                    );
                  } else if (bibleRef) {
                    // Chapitre entier
                    parts.push(
                      <Link key={`${matchIndex}-${reference}`} href={`/bible/${bibleRef.bookSlug}/${bibleRef.chapter}`} className="text-accent hover:underline font-medium not-italic">
                        {reference}
                      </Link>
                    );
                  } else {
                    // Lien wiki vers article
                    const slug = titleToSlug(reference);
                    parts.push(
                      <Link key={`${matchIndex}-${reference}`} href={`/wiki/${slug}`} className="text-accent hover:underline font-medium not-italic">
                        {reference}
                      </Link>
                    );
                  }

                  lastIndex = matchIndex + fullMatch.length;
                }

                // Ajouter le texte restant
                if (lastIndex < child.length) {
                  parts.push(child.slice(lastIndex));
                }

                return parts.length > 0 ? parts : child;
              }
              return child;
            });

            return <p className="my-4 leading-relaxed text-gray-800">{processedChildren}</p>;
          },
          strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside my-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside my-4 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-gray-800">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent bg-accent/5 pl-4 py-2 my-4 italic text-gray-700">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-700">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-accent hover:underline font-medium" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
