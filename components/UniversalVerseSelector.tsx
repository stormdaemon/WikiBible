'use client';

import { useState, useEffect } from 'react';
import { getBooksAction, getAvailableTranslationsAction, getApocryphalBooksAction } from '@/app/actions';

type VerseSourceType = 'bible' | 'contributive' | 'apocryphal';

interface VerseSelectorProps {
  onVerseSelected: (bookId: string, bookName: string, chapter: number, verse: number, translation?: string, sourceType?: VerseSourceType) => void;
  selectedBook?: { id: string; name: string } | null;
  initialTranslation?: string;
  initialSourceType?: VerseSourceType;
}

interface Translation {
  id: string;
  name: string;
  type: string;
}

export function UniversalVerseSelector({
  onVerseSelected,
  selectedBook,
  initialTranslation = 'crampon',
  initialSourceType = 'bible'
}: VerseSelectorProps) {
  const [sourceType, setSelectedSourceType] = useState<VerseSourceType>(initialSourceType);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>(selectedBook?.id || '');
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [selectedVerse, setSelectedVerse] = useState<number>(0);
  const [selectedTranslation, setSelectedTranslation] = useState<string>(initialTranslation);
  const [verses, setVerses] = useState<any[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);

  // Charger les traductions disponibles
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoadingTranslations(true);
      const result = await getAvailableTranslationsAction();
      if (result.success && result.translations) {
        setTranslations(result.translations);
      }
      setIsLoadingTranslations(false);
    };
    loadTranslations();
  }, []);

  const bibleTranslations = translations.filter(t => t.type === 'official');
  // Pour la bible contributive, on utilise les traductions communautaires (Osty, Tob, Septante, etc.)
  const contributiveTranslations = translations.filter(t => t.type === 'community');

  // Debug: voir ce qui est chargé
  console.log('[UniversalVerseSelector] Translations loaded:', translations.length);
  console.log('[UniversalVerseSelector] Bible translations:', bibleTranslations.length);
  console.log('[UniversalVerseSelector] Contributive translations:', contributiveTranslations.length);
  console.log('[UniversalVerseSelector] Community translations:', translations.filter(t => t.type === 'community'));

  const apocryphalTranslations = [
    { id: 'auto', name: 'Traduction automatique', type: 'apocryphal' },
    { id: 'original', name: 'Texte original', type: 'apocryphal' },
  ];

  // Charger les livres selon le type de source
  useEffect(() => {
    const loadBooks = async () => {
      if (sourceType === 'bible' || sourceType === 'contributive') {
        const result = await getBooksAction();
        if (result.success && result.books) {
          setBooks(result.books);
        }
      } else if (sourceType === 'apocryphal') {
        // Charger les livres apocryphes via l'action
        const result = await getApocryphalBooksAction();
        if (result.success && result.books) {
          setBooks(result.books);
        }
      }
    };
    loadBooks();
  }, [sourceType]);

  // Reset les sélections quand le type de source change
  useEffect(() => {
    setSelectedBookId('');
    setSelectedChapter(0);
    setSelectedVerse(0);
    setVerses([]);
    // Réinitialiser la traduction selon le nouveau type
    if (sourceType === 'bible') {
      setSelectedTranslation('crampon');
    } else if (sourceType === 'contributive') {
      // La bible contributive utilise les mêmes traductions que la bible classique
      setSelectedTranslation('crampon');
    } else if (sourceType === 'apocryphal') {
      setSelectedTranslation('auto');
    }
  }, [sourceType]);

  // Reset chapitre et verset quand le livre change
  useEffect(() => {
    if (selectedBookId) {
      setSelectedChapter(0);
      setSelectedVerse(0);
      setVerses([]);
    }
  }, [selectedBookId]);

  // Charger les versets quand le chapitre change
  useEffect(() => {
    if (selectedBookId && selectedChapter > 0) {
      const loadVerses = async () => {
        const book = books.find(b => b.id === selectedBookId);
        if (book) {
          // Simuler les versets (1 à max_versets_chapitre)
          const maxVerses = book.chapters || 150;
          const verseList = Array.from({ length: maxVerses }, (_, i) => ({
            number: i + 1,
            id: `${selectedBookId}-${selectedChapter}-${i + 1}`
          }));
          setVerses(verseList);
        }
      };
      loadVerses();
    }
  }, [selectedBookId, selectedChapter, books]);

  const currentBook = books.find(b => b.id === selectedBookId);

  // Notifier le parent quand les 3 valeurs sont sélectionnées
  useEffect(() => {
    if (selectedBookId && selectedChapter > 0 && selectedVerse > 0) {
      const book = books.find(b => b.id === selectedBookId);
      if (book) {
        onVerseSelected(selectedBookId, book.name, selectedChapter, selectedVerse, selectedTranslation, sourceType);
      }
    }
  }, [selectedBookId, selectedChapter, selectedVerse, selectedTranslation, sourceType, onVerseSelected, books]);

  const getTranslations = () => {
    switch (sourceType) {
      case 'bible':
        return bibleTranslations;
      case 'contributive':
        return contributiveTranslations;
      case 'apocryphal':
        return apocryphalTranslations;
      default:
        return bibleTranslations;
    }
  };

  return (
    <div className="space-y-4">
      {/* Sélecteur de source */}
      <div>
        <label htmlFor="source_type" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Source <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedSourceType('bible')}
            className={`p-3 border-2 rounded-lg text-center transition-all ${
              sourceType === 'bible'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-slate-200 hover:border-accent/50 hover:bg-accent/5'
            }`}
          >
            <div className="text-2xl mb-1">📖</div>
            <div className="text-sm font-medium">Bible</div>
            <div className="text-xs text-slate-500">Officielle</div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedSourceType('contributive')}
            className={`p-3 border-2 rounded-lg text-center transition-all ${
              sourceType === 'contributive'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-slate-200 hover:border-purple-300 hover:bg-purple-5'
            }`}
          >
            <div className="text-2xl mb-1">✍️</div>
            <div className="text-sm font-medium">Bible</div>
            <div className="text-xs text-slate-500">Contributive</div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedSourceType('apocryphal')}
            className={`p-3 border-2 rounded-lg text-center transition-all ${
              sourceType === 'apocryphal'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-slate-200 hover:border-amber-300 hover:bg-amber-5'
            }`}
          >
            <div className="text-2xl mb-1">📜</div>
            <div className="text-sm font-medium">Apocryphes</div>
            <div className="text-xs text-slate-500">Textes anciens</div>
          </button>
        </div>
      </div>

      {/* Sélection du livre */}
      <div>
        <label htmlFor="book_id" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Livre <span className="text-red-500">*</span>
        </label>
        <select
          id="book_id"
          name="book_id"
          value={selectedBookId}
          onChange={(e) => setSelectedBookId(e.target.value)}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-white"
          required
        >
          <option value="">Choisir un livre...</option>
          {books.map(book => (
            <option key={book.id} value={book.id}>
              {book.name} {book.chapters ? `(${book.chapters} chapitres)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Sélection de la traduction */}
      <div>
        <label htmlFor="translation" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Traduction <span className="text-red-500">*</span>
        </label>
        <select
          id="translation"
          name="translation"
          value={selectedTranslation}
          onChange={(e) => setSelectedTranslation(e.target.value)}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-white"
          required
        >
          {getTranslations().map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Sélection du chapitre */}
      <div>
        <label htmlFor="chapter" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Chapitre <span className="text-red-500">*</span>
        </label>
        <select
          id="chapter"
          name="chapter"
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
          disabled={!selectedBookId}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          required
        >
          <option value="">Choisir un chapitre...</option>
          {currentBook && currentBook.chapters && Array.from({ length: currentBook.chapters }, (_, i) => (
            <option key={i + 1} value={i + 1}>Chapitre {i + 1}</option>
          ))}
        </select>
      </div>

      {/* Sélection du verset */}
      <div>
        <label htmlFor="verse" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Verset <span className="text-red-500">*</span>
        </label>
        <select
          id="verse"
          name="verse"
          value={selectedVerse}
          onChange={(e) => setSelectedVerse(parseInt(e.target.value))}
          disabled={!selectedChapter}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          required
        >
          <option value="">Choisir un verset...</option>
          {verses.map(v => (
            <option key={v.id} value={v.number}>Verset {v.number}</option>
          ))}
        </select>
      </div>

      {/* Résumé de la sélection */}
      {selectedVerse > 0 && (
        <div className={`p-3 border rounded-lg ${
          sourceType === 'bible' ? 'bg-accent/10 border-accent/30' :
          sourceType === 'contributive' ? 'bg-purple-50 border-purple-300' :
          'bg-amber-50 border-amber-300'
        }`}>
          <p className={`text-sm font-medium ${
            sourceType === 'bible' ? 'text-accent' :
            sourceType === 'contributive' ? 'text-purple-700' :
            'text-amber-700'
          }`}>
            📍 {currentBook?.name} {selectedChapter}:{selectedVerse}
            <span className="ml-2 text-xs bg-white px-2 py-0.5 rounded">
              {getTranslations().find(t => t.id === selectedTranslation)?.name}
            </span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
              sourceType === 'bible' ? 'bg-accent text-white' :
              sourceType === 'contributive' ? 'bg-purple-500 text-white' :
              'bg-amber-500 text-white'
            }`}>
              {sourceType === 'bible' ? 'Bible' :
               sourceType === 'contributive' ? 'Contributive' :
               'Apocryphe'}
            </span>
          </p>
        </div>
      )}

      {/* Champs cachés pour le formulaire */}
      <input type="hidden" name="source_type" value={sourceType} />
      <input type="hidden" name="book_slug" value={currentBook?.slug || ''} />
    </div>
  );
}
