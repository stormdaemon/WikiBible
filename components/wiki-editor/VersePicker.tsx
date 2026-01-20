'use client';

import { useState, useEffect } from 'react';
import {
  getBibleBooksForEditorAction,
  getVersePreviewAction,
  getAvailableTranslationsAction,
  type BibleBook,
  type VersePreview,
  type BibleSourceType,
} from '@/app/actions';

interface Translation {
  id: string;
  name: string;
  type: 'official' | 'community';
}

interface VersePickerProps {
  onInsert: (reference: string, sourceType: BibleSourceType) => void;
  onClose: () => void;
}

/**
 * VersePicker - Modal pour sélectionner un verset biblique
 *
 * Features:
 * - Sélection de la source (Bible normale / Contributive / Apocryphes)
 * - Récupération des livres depuis la DB
 * - Preview du verset avant insertion
 */
export default function VersePicker({ onInsert, onClose }: VersePickerProps) {
  const [sourceType, setSourceType] = useState<BibleSourceType>('bible');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedVerse, setSelectedVerse] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [versePreview, setVersePreview] = useState<VersePreview | null>(null);
  const [previewError, setPreviewError] = useState<string>('');
  const [chapters, setChapters] = useState<number[]>([]);
  const [translationId, setTranslationId] = useState<string>('crampon');
  const [translations, setTranslations] = useState<Translation[]>([]);

  // Charger les livres depuis la DB
  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      const result = await getBibleBooksForEditorAction();
      if (result.success && result.books) {
        setBooks(result.books);
      }
      setIsLoading(false);
    };
    loadBooks();
  }, []);

  // Charger les traductions disponibles
  useEffect(() => {
    const loadTranslations = async () => {
      const result = await getAvailableTranslationsAction();
      if (result.success && result.translations) {
        setTranslations(result.translations);
      }
    };
    loadTranslations();
  }, []);

  // Filtrer les livres selon la recherche et le type
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Utiliser sourceType pour distinguer Bible normale vs Apocryphes
    if (sourceType === 'apocryphal') {
      return matchesSearch && book.sourceType === 'apocryphal';
    }

    // Pour bible et contributive, on garde les livres avec sourceType === 'bible' ou undefined (ancien format)
    return matchesSearch && (book.sourceType === 'bible' || book.sourceType === undefined || book.testament);
  });

  // Mettre à jour les chapitres quand le livre change
  useEffect(() => {
    if (selectedBook) {
      // Nombre de chapitres par livre (approximation basée sur la Bible catholique)
      const book = books.find((b) => b.slug === selectedBook);
      if (book) {
        const chapterCount = getChapterCount(book.name);
        setChapters(Array.from({ length: chapterCount }, (_, i) => i + 1));
      }
    } else {
      setChapters([]);
    }
  }, [selectedBook, books]);

  // Charger le preview du verset quand la sélection change
  useEffect(() => {
    const loadVersePreview = async () => {
      if (!selectedBook || !selectedChapter) {
        setVersePreview(null);
        setPreviewError('');
        return;
      }

      setIsLoading(true);
      setPreviewError('');

      const result = await getVersePreviewAction(
        sourceType,
        selectedBook,
        parseInt(selectedChapter),
        selectedVerse ? parseInt(selectedVerse) : undefined,
        translationId
      );

      if (result.success && result.verse) {
        setVersePreview(result.verse);
      } else {
        setVersePreview(null);
        setPreviewError(result.error || 'Verset non trouvé');
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(loadVersePreview, 300);
    return () => clearTimeout(debounceTimer);
  }, [sourceType, selectedBook, selectedChapter, selectedVerse]);

  // Générer la référence
  const generateReference = () => {
    if (!selectedBook || !selectedChapter) return '';

    const book = books.find((b) => b.slug === selectedBook);
    if (!book) return '';

    return selectedVerse
      ? `${book.name} ${selectedChapter}:${selectedVerse}`
      : `${book.name} ${selectedChapter}`;
  };

  const handleInsert = () => {
    const reference = generateReference();
    if (reference) {
      onInsert(reference, sourceType);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Insérer un verset biblique
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Sélecteur de source - 2 onglets seulement */}
            <div>
              <label className="form__label">Source</label>
              <div className="flex gap-2">
                {/* Onglet Bible regroupe officielle + contributive */}
                <button
                  type="button"
                  onClick={() => {
                    setSourceType('bible');
                    setSelectedBook('');
                    setSelectedChapter('');
                    setSelectedVerse('');
                  }}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    sourceType === 'bible'
                      ? 'border-accent bg-amber-50 text-accent'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium">Bible</span>
                  </div>
                  <p className="text-xs mt-1">Officielle & Communautaire</p>
                </button>

                {/* Onglet Apocryphes */}
                <button
                  type="button"
                  onClick={() => {
                    setSourceType('apocryphal');
                    setSelectedBook('');
                    setSelectedChapter('');
                    setSelectedVerse('');
                  }}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    sourceType === 'apocryphal'
                      ? 'border-accent bg-amber-50 text-accent'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium">Apocryphes</span>
                  </div>
                  <p className="text-xs mt-1">Textes deutérocanoniques</p>
                </button>
              </div>
            </div>

            {/* Sélecteur de traduction (uniquement pour Bible) */}
            {sourceType === 'bible' && (
              <div>
                <label className="form__label">Traduction</label>
                {translations.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500">
                    Chargement des traductions...
                  </div>
                ) : (
                  <>
                    <select
                      value={translationId}
                      onChange={(e) => setTranslationId(e.target.value)}
                      className="form__input"
                    >
                      {translations.map((trans) => (
                        <option key={trans.id} value={trans.id}>
                          {trans.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {translations.find((t) => t.id === translationId)?.type === 'official'
                        ? 'Traduction officielle'
                        : 'Traduction communautaire'}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Recherche de livre */}
            <div>
              <label className="form__label">Rechercher un livre</label>
              <input
                type="text"
                placeholder="Ex: Jean, Psaumes, Genèse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form__input"
              />
            </div>

            {/* Sélection du livre */}
            <div>
              <label className="form__label">Livre</label>
              {isLoading && books.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500">
                  Chargement des livres...
                </div>
              ) : (
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(e.target.value);
                    setSelectedChapter('');
                    setSelectedVerse('');
                  }}
                  className="form__input"
                >
                  <option value="">-- Sélectionner un livre --</option>
                  {filteredBooks.map((book) => (
                    <option key={book.slug} value={book.slug}>
                      {book.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Sélection du chapitre */}
            {selectedBook && (
              <div>
                <label className="form__label">Chapitre</label>
                <select
                  value={selectedChapter}
                  onChange={(e) => {
                    setSelectedChapter(e.target.value);
                    setSelectedVerse('');
                  }}
                  className="form__input"
                >
                  <option value="">-- Sélectionner un chapitre --</option>
                  {chapters.map((chapter) => (
                    <option key={chapter} value={chapter.toString()}>
                      Chapitre {chapter}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sélection du verset */}
            {selectedChapter && (
              <div>
                <label className="form__label">Verset <span className="text-red-500">*</span></label>
                <select
                  value={selectedVerse}
                  onChange={(e) => setSelectedVerse(e.target.value)}
                  className="form__input"
                >
                  <option value="">-- Sélectionner un verset --</option>
                  {Array.from({ length: 176 }, (_, i) => i + 1).map((verse) => (
                    <option key={verse} value={verse.toString()}>
                      Verset {verse}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Preview du verset - uniquement si verset sélectionné */}
            {selectedBook && selectedChapter && selectedVerse && (
              <>
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Aperçu</p>
                </div>
                <div className="p-3">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span className="text-sm">Chargement...</span>
                    </div>
                  ) : previewError ? (
                    <div className="text-red-600 text-sm">{previewError}</div>
                  ) : versePreview ? (
                    <div>
                      <p className="text-xs font-semibold text-accent mb-2">
                        {versePreview.reference}
                      </p>
                      <p className="text-sm text-slate-700 italic">
                        "{versePreview.text}"
                      </p>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="btn btn--secondary flex-1"
          >
            Annuler
          </button>
          <button
            onClick={handleInsert}
            disabled={!generateReference()}
            className="btn btn--primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insérer
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Nombre de chapitres par livre (Bible catholique)
 */
function getChapterCount(bookName: string): number {
  const chapterCounts: Record<string, number> = {
    'Genèse': 50, 'Exode': 40, 'Lévitique': 27, 'Nombres': 36, 'Deutéronome': 34,
    'Josué': 24, 'Juges': 21, 'Ruth': 4,
    '1 Samuel': 31, '2 Samuel': 24, '1 Rois': 22, '2 Rois': 25,
    '1 Chroniques': 29, '2 Chroniques': 36, 'Esdras': 10, 'Néhémie': 13,
    'Tobie': 14, 'Judith': 16, 'Esther': 16,
    '1 Maccabées': 16, '2 Maccabées': 15,
    'Job': 42, 'Psaumes': 150, 'Proverbes': 31, 'Ecclésiaste': 12,
    'Cantique des Cantiques': 8, 'Sagesse': 19, 'Siracide': 51,
    'Isaïe': 66, 'Jérémie': 52, 'Lamentations': 5, 'Baruch': 6,
    'Ézéchiel': 48, 'Daniel': 14,
    'Osée': 14, 'Joël': 4, 'Amos': 9, 'Abdias': 1, 'Jonas': 4, 'Michée': 7,
    'Nahum': 3, 'Habacuc': 3, 'Sophonie': 3, 'Aggée': 2, 'Zacharie': 14, 'Malachie': 3,
    'Matthieu': 28, 'Marc': 16, 'Luc': 24, 'Jean': 21, 'Actes des Apôtres': 28,
    'Romains': 16, '1 Corinthiens': 16, '2 Corinthiens': 13, 'Galates': 6,
    'Éphésiens': 6, 'Philippiens': 4, 'Colossiens': 4, '1 Thessaloniciens': 5,
    '2 Thessaloniciens': 3, '1 Timothée': 6, '2 Timothée': 4, 'Tite': 3,
    'Philémon': 1, 'Hébreux': 13, 'Jacques': 5, '1 Pierre': 5, '2 Pierre': 3,
    '1 Jean': 5, '2 Jean': 1, '3 Jean': 1, 'Jude': 1, 'Apocalypse': 22,
  };

  return chapterCounts[bookName] || 50; // Default fallback
}
