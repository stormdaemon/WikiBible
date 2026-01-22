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
  type: string;
}

interface VersePickerProps {
  onInsert: (reference: string, sourceType: BibleSourceType) => void;
  onClose: () => void;
}

/**
 * VersePicker - Modal moderne pour sélectionner un verset biblique
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

    if (sourceType === 'apocryphal') {
      return matchesSearch && book.sourceType === 'apocryphal';
    }

    return matchesSearch && (book.sourceType === 'bible' || book.sourceType === undefined || book.testament);
  });

  // Mettre à jour les chapitres quand le livre change
  useEffect(() => {
    if (selectedBook) {
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
  }, [sourceType, selectedBook, selectedChapter, selectedVerse, translationId]);

  // Générer la référence
  const generateReference = () => {
    if (!selectedBook || !selectedChapter || !selectedVerse) return '';

    const book = books.find((b) => b.slug === selectedBook);
    if (!book) return '';

    return `${book.name} ${selectedChapter}:${selectedVerse}`;
  };

  const handleInsert = () => {
    const reference = generateReference();
    if (reference) {
      onInsert(reference, sourceType);
      onClose();
    }
  };

  // Calculer la progression
  const getProgress = () => {
    let steps = 0;
    if (selectedBook) steps++;
    if (selectedChapter) steps++;
    if (selectedVerse) steps++;
    return steps;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop avec blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-700">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="M12 6v7" />
                  <path d="M9 9h6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">Insérer un verset biblique</h3>
                <p className="text-sm text-slate-600">Sélectionnez un livre, chapitre et verset</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-xl transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    getProgress() >= step
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {step}
                </div>
                <span className={`text-xs hidden sm:block ${getProgress() >= step ? 'text-amber-700 font-medium' : 'text-slate-400'}`}>
                  {step === 1 ? 'Livre' : step === 2 ? 'Chapitre' : 'Verset'}
                </span>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 ${getProgress() > step ? 'bg-amber-500' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Sélecteur de source */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Source</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSourceType('bible');
                    setSelectedBook('');
                    setSelectedChapter('');
                    setSelectedVerse('');
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    sourceType === 'bible'
                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${sourceType === 'bible' ? 'bg-amber-200' : 'bg-slate-100'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={sourceType === 'bible' ? 'text-amber-700' : 'text-slate-500'}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className={`font-semibold ${sourceType === 'bible' ? 'text-amber-800' : 'text-slate-700'}`}>Bible</span>
                      <p className="text-xs text-slate-500">73 livres canoniques</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSourceType('apocryphal');
                    setSelectedBook('');
                    setSelectedChapter('');
                    setSelectedVerse('');
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    sourceType === 'apocryphal'
                      ? 'border-purple-400 bg-purple-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${sourceType === 'apocryphal' ? 'bg-purple-200' : 'bg-slate-100'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={sourceType === 'apocryphal' ? 'text-purple-700' : 'text-slate-500'}>
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className={`font-semibold ${sourceType === 'apocryphal' ? 'text-purple-800' : 'text-slate-700'}`}>Apocryphes</span>
                      <p className="text-xs text-slate-500">Deutérocanoniques</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Sélecteur de traduction */}
            {sourceType === 'bible' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Traduction</label>
                {translations.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      <span className="text-sm">Chargement des traductions...</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={translationId}
                      onChange={(e) => setTranslationId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none cursor-pointer"
                    >
                      {translations.map((trans) => (
                        <option key={trans.id} value={trans.id}>
                          {trans.name} {trans.type === 'community' ? '(Communautaire)' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recherche de livre */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rechercher un livre</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Jean, Psaumes, Genèse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Sélection du livre */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Livre <span className="text-red-500">*</span>
              </label>
              {isLoading && books.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    <span className="text-sm">Chargement des livres...</span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedBook}
                    onChange={(e) => {
                      setSelectedBook(e.target.value);
                      setSelectedChapter('');
                      setSelectedVerse('');
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Sélectionner un livre --</option>
                    {filteredBooks.map((book) => (
                      <option key={book.slug} value={book.slug}>
                        {book.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Chapitre et Verset côte à côte */}
            {selectedBook && (
              <div className="grid grid-cols-2 gap-4">
                {/* Sélection du chapitre */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Chapitre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedChapter}
                      onChange={(e) => {
                        setSelectedChapter(e.target.value);
                        setSelectedVerse('');
                      }}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Chapitre --</option>
                      {chapters.map((chapter) => (
                        <option key={chapter} value={chapter.toString()}>
                          {chapter}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Sélection du verset */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Verset <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedVerse}
                      onChange={(e) => setSelectedVerse(e.target.value)}
                      disabled={!selectedChapter}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Verset --</option>
                      {Array.from({ length: 176 }, (_, i) => i + 1).map((verse) => (
                        <option key={verse} value={verse.toString()}>
                          {verse}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview du verset */}
            {selectedBook && selectedChapter && selectedVerse && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl overflow-hidden">
                <div className="bg-amber-100/50 px-4 py-2 border-b border-amber-200 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="text-sm font-semibold text-amber-800">Aperçu du verset</span>
                </div>
                <div className="p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-amber-600">
                      <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      <span className="text-sm font-medium">Chargement du verset...</span>
                    </div>
                  ) : previewError ? (
                    <div className="flex items-center gap-2 text-red-600 py-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span className="text-sm">{previewError}</span>
                    </div>
                  ) : versePreview ? (
                    <div>
                      <p className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-200 rounded-md text-xs">
                          {versePreview.reference}
                        </span>
                      </p>
                      <p className="text-slate-700 italic leading-relaxed">
                        "{versePreview.text}"
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-white font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleInsert}
            disabled={!generateReference()}
            className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M12 6v7" />
              <path d="M9 9h6" />
            </svg>
            Insérer le verset
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

  return chapterCounts[bookName] || 50;
}
