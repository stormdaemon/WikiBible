'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useState } from 'react';
import { VerseExtension } from './extensions/verse-extension';
import EditorToolbar from './EditorToolbar';
import VersePicker from './VersePicker';
import { type BibleSourceType } from '@/app/actions';

interface WikiEditorProps {
  content: string;
  onChange: (content: string, markdown: string) => void;
  placeholder?: string;
}

/**
 * WikiEditor - Éditeur WYSIWYG basé sur TipTap
 *
 * Phase 2 complète avec :
 * - Toolbar de formatage
 * - VersePicker pour insérer des versets
 * - Extensions personnalisées
 */
export default function WikiEditor({ content, onChange, placeholder = 'Écrivez votre article...' }: WikiEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [showVersePicker, setShowVersePicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      CharacterCount.configure({
        limit: null,
      }),
      VerseExtension,
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange(html, text);
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // Hydration fix pour Next.js
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mise à jour du contenu quand la prop change
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Insérer une référence de verset
  const handleInsertVerse = (reference: string, sourceType: BibleSourceType) => {
    if (!editor) return;

    // Parser la référence
    const match = reference.match(/^([A-Za-zÀ-ÿ\s]+)\s+(\d+):(\d+)$/);
    if (!match) return;

    const [, book, chapter, verse] = match;

    // Créer le lien avec le bon format (utiliser wiki-parser pour le slug)
    const bookSlug = bookToSlug(book.trim());
    const href = `/bible/${bookSlug}/${chapter}/${verse}`;
    const verseNum = parseInt(verse);

    // Insérer un lien stylé au lieu d'un Node complexe
    const html = `<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-sm font-medium hover:bg-amber-200 cursor-pointer transition-colors border border-amber-300" data-verse-ref="${reference}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
      <a href="${href}" class="no-underline">${reference}</a>
    </span>`;

    editor.commands.insertContent(html);
  };

  // Fonction utilitaire pour convertir un nom de livre en slug
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

  // Insérer un lien wiki (pour l'instant simple)
  const handleInsertWikiLink = () => {
    if (!editor) return;
    // Pour l'instant, on insère un template
    const linkText = prompt('Entrez le titre de l\'article wiki:');
    if (linkText) {
      editor.commands.insertContent(
        `<a href="/wiki/${linkText.toLowerCase().replace(/\s+/g, '-')}" data-type="wiki-link" class="text-accent hover:text-accent/80 underline">${linkText}</a>`
      );
    }
  };

  if (!isClient || !editor) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="animate-pulse flex gap-2">
            <div className="w-8 h-8 bg-slate-300 rounded" />
            <div className="w-8 h-8 bg-slate-300 rounded" />
            <div className="w-8 h-8 bg-slate-300 rounded" />
          </div>
        </div>
        <div className="p-4 min-h-[400px] font-mono text-sm text-slate-400">
          Chargement de l'éditeur...
        </div>
      </div>
    );
  }

  return (
    <div className="wiki-editor">
      {/* Toolbar */}
      <EditorToolbar
        editor={editor}
        onInsertVerse={() => setShowVersePicker(true)}
        onInsertWikiLink={handleInsertWikiLink}
      />

      {/* Zone d'édition */}
      <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Verse Picker Modal */}
      {showVersePicker && (
        <VersePicker
          onInsert={handleInsertVerse}
          onClose={() => setShowVersePicker(false)}
        />
      )}

      {/* Info bar */}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Mode WYSIWYG
        </span>
        <span>{editor.storage.characterCount?.characters() || 0} caractères</span>
      </div>
    </div>
  );
}
