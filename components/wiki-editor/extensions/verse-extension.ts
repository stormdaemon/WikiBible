import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import VerseComponent from './VerseComponent';

/**
 * VerseExtension - Extension TipTap pour les références bibliques
 *
 * Syntaxe: [[Jean 3:16]] ou [[Jean 3]]
 *
 * Affiche un badge interactif cliquable vers le verset
 */
export const VerseExtension = Node.create({
  name: 'verseReference',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      reference: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-reference'),
        renderHTML: (attributes) => {
          if (!attributes.reference) {
            return {};
          }
          return {
            'data-reference': attributes.reference,
          };
        },
      },
      book: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-book'),
        renderHTML: (attributes) => {
          if (!attributes.book) {
            return {};
          }
          return {
            'data-book': attributes.book,
          };
        },
      },
      chapter: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-chapter'),
        renderHTML: (attributes) => {
          if (!attributes.chapter) {
            return {};
          }
          return {
            'data-chapter': attributes.chapter,
          };
        },
      },
      verse: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-verse'),
        renderHTML: (attributes) => {
          if (!attributes.verse) {
            return {};
          }
          return {
            'data-verse': attributes.verse,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="verse-reference"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({
        'data-type': 'verse-reference',
        class: 'inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-sm font-medium hover:bg-amber-200 cursor-pointer transition-colors border border-amber-300',
      }, HTMLAttributes),
      [
        'svg',
        {
          width: '14',
          height: '14',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          class: 'flex-shrink-0',
        },
        [
          'path',
          {
            d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
          },
        ],
      ],
      ['span', {}, 0],
    ];
  },

  renderText({ node }) {
    return node.attrs.reference || '';
  },

  // IMPORTANT: Pour les nodes atom inline, le textContent est utilisé pour le contenu
  get textContent() {
    return 'verseReference';
  },

  addCommands() {
    return {
      insertVerseReference:
        (reference: string, book: string, chapter: string, verse?: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              reference,
              book,
              chapter,
              verse,
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VerseComponent);
  },
});

/**
 * Parse une référence biblique et retourne les composants
 * Ex: "Jean 3:16" -> { book: "Jean", chapter: "3", verse: "16" }
 */
export function parseBibleReference(reference: string): {
  book: string;
  chapter: string;
  verse?: string;
  displayText: string;
} | null {
  // Pattern pour "Livre Chapitre:Verset" ou "Livre Chapitre"
  const biblePattern = /^([A-Za-zÀ-ÿ\s]+)\s+(\d+)(?::(\d+))?$/;
  const match = reference.match(biblePattern);

  if (!match) {
    return null;
  }

  const [, book, chapter, verse] = match;

  return {
    book: book.trim(),
    chapter,
    verse,
    displayText: reference,
  };
}
