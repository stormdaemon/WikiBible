'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useState, useCallback } from 'react';
import { VerseExtension } from './extensions/verse-extension';
import EditorToolbar from './EditorToolbar';
import VersePicker from './VersePicker';
import { type BibleSourceType, searchWikiArticlesAction } from '@/app/actions';

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
}

interface WikiEditorProps {
  content: string;
  onChange: (content: string, markdown: string) => void;
  placeholder?: string;
  minHeight?: string;
}

/**
 * WikiEditor - Éditeur WYSIWYG moderne basé sur TipTap
 */
export default function WikiEditor({
  content,
  onChange,
  placeholder = 'Écrivez votre article...',
  minHeight = '400px'
}: WikiEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [showVersePicker, setShowVersePicker] = useState(false);
  const [showWikiLinkModal, setShowWikiLinkModal] = useState(false);
  const [wikiLinkText, setWikiLinkText] = useState('');
  const [searchResults, setSearchResults] = useState<WikiArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
        class: `prose prose-slate max-w-none focus:outline-none px-5 py-4`,
        style: `min-height: ${minHeight}`,
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

  // Recherche d'articles wiki avec debounce
  useEffect(() => {
    if (!wikiLinkText.trim() || wikiLinkText.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const result = await searchWikiArticlesAction(wikiLinkText.trim());
      if (result.success && result.articles) {
        setSearchResults(result.articles);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [wikiLinkText]);

  // Fonction utilitaire pour convertir un nom de livre en slug
  const bookToSlug = useCallback((bookName: string): string => {
    const bookMapping: Record<string, string> = {
      'Genèse': 'genese',
      'Exode': 'exode',
      'Lévitique': 'levitique',
      'Nombres': 'nombres',
      'Deutéronome': 'deuteronome',
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
      'Esther': 'esther',
      '1 Maccabées': '1-maccabees',
      '2 Maccabées': '2-maccabees',
      'Job': 'job',
      'Psaumes': 'psaumes',
      'Proverbes': 'proverbes',
      'Ecclésiaste': 'ecclesiaste',
      'Cantique des Cantiques': 'cantique',
      'Sagesse': 'sagesse',
      'Siracide': 'siracide',
      'Isaïe': 'isaie',
      'Jérémie': 'jeremie',
      'Lamentations': 'lamentations',
      'Baruch': 'baruch',
      'Ézéchiel': 'ezechiel',
      'Daniel': 'daniel',
      'Osée': 'osee',
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
      '1 Thessaloniciens': '1-thessaloniciens',
      '2 Thessaloniciens': '2-thessaloniciens',
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
  }, []);

  // Insérer une référence de verset
  const handleInsertVerse = useCallback((reference: string, sourceType: BibleSourceType) => {
    if (!editor) return;

    // Parser la référence
    const match = reference.match(/^([A-Za-zÀ-ÿ\s0-9]+)\s+(\d+):(\d+)$/);
    if (!match) return;

    const [, book, chapter, verse] = match;

    // Créer le lien avec le bon format
    const bookSlug = bookToSlug(book.trim());
    const href = `/bible/${bookSlug}/${chapter}#verse-${verse}`;

    // Insérer un lien stylé
    const html = `<a href="${href}" class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-sm font-medium hover:bg-amber-200 no-underline border border-amber-200" data-verse-ref="${reference}">${reference}</a>&nbsp;`;

    editor.commands.insertContent(html);
  }, [editor, bookToSlug]);

  // Générer le slug à partir du titre
  const generateSlug = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }, []);

  // Insérer un lien wiki
  const handleInsertWikiLink = useCallback((title: string, slug?: string) => {
    if (!editor || !title.trim()) return;

    const finalSlug = slug || generateSlug(title);

    editor.commands.insertContent(
      `<a href="/wiki/${finalSlug}" class="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500" data-wiki-link="${finalSlug}">${title}</a>&nbsp;`
    );

    setWikiLinkText('');
    setSearchResults([]);
    setShowWikiLinkModal(false);
  }, [editor, generateSlug]);

  // Sélectionner un article depuis les résultats de recherche
  const handleSelectArticle = useCallback((article: WikiArticle) => {
    handleInsertWikiLink(article.title, article.slug);
  }, [handleInsertWikiLink]);

  if (!isClient || !editor) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="animate-pulse flex gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-9 h-9 bg-slate-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="p-5 min-h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            <span>Chargement de l'éditeur...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wiki-editor">
      {/* Container principal avec bordure */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <EditorToolbar
          editor={editor}
          onInsertVerse={() => setShowVersePicker(true)}
          onInsertWikiLink={() => setShowWikiLinkModal(true)}
        />

        {/* Zone d'édition */}
        <div className="border-t border-slate-100">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Barre d'info */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Éditeur actif
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Enregistrement auto
          </span>
        </div>
        <span className="px-2 py-1 bg-slate-100 rounded-full font-medium">
          {editor.storage.characterCount?.characters() || 0} caractères
        </span>
      </div>

      {/* Verse Picker Modal */}
      {showVersePicker && (
        <VersePicker
          onInsert={handleInsertVerse}
          onClose={() => setShowVersePicker(false)}
        />
      )}

      {/* Wiki Link Modal */}
      {showWikiLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowWikiLinkModal(false);
              setWikiLinkText('');
              setSearchResults([]);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">Insérer un lien Wiki</h3>
                    <p className="text-sm text-slate-600">Vers un article existant ou nouveau</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowWikiLinkModal(false);
                    setWikiLinkText('');
                    setSearchResults([]);
                  }}
                  className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-5 space-y-4">
              {/* Champ de recherche */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rechercher ou créer un article
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={wikiLinkText}
                    onChange={(e) => setWikiLinkText(e.target.value)}
                    placeholder="Ex: Saint Pierre, Concile de Trente..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && wikiLinkText.trim()) {
                        e.preventDefault();
                        handleInsertWikiLink(wikiLinkText);
                      }
                    }}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      Articles existants ({searchResults.length})
                    </p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {searchResults.map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => handleSelectArticle(article)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors flex items-center justify-between group"
                      >
                        <span className="font-medium text-slate-800 group-hover:text-blue-700">{article.title}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-blue-500">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Créer un nouvel article */}
              {wikiLinkText.trim() && searchResults.length === 0 && !isSearching && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Nouvel article</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Créer un lien vers "{wikiLinkText}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Aperçu */}
              {wikiLinkText.trim() && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Aperçu du lien :</p>
                  <p className="text-blue-600 underline decoration-blue-300 font-medium">{wikiLinkText}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    → /wiki/{generateSlug(wikiLinkText)}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowWikiLinkModal(false);
                  setWikiLinkText('');
                  setSearchResults([]);
                }}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-white font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleInsertWikiLink(wikiLinkText)}
                disabled={!wikiLinkText.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
