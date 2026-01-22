'use client';

import { useState, useEffect } from 'react';
import { getBooksAction, getApocryphalBooksAction } from '@/app/actions';

export type VerseSourceType = 'bible' | 'contributive' | 'apocryphal';

interface VerseSelectorProps {
  onVerseSelected: (bookId: string, bookName: string, chapter: number, verse: number, sourceType?: VerseSourceType) => void;
  selectedBook?: { id: string; name: string } | null;
  initialSourceType?: 'bible' | 'apocryphal'; // Only 2 options in UI
}

export function UniversalVerseSelector({
  onVerseSelected,
  selectedBook,
  initialSourceType = 'bible'
}: VerseSelectorProps) {
  const [sourceType, setSelectedSourceType] = useState<VerseSourceType>(initialSourceType === 'apocryphal' ? 'apocryphal' : 'bible');
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>(selectedBook?.id || '');
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [selectedVerse, setSelectedVerse] = useState<number>(0);
  const [verses, setVerses] = useState<any[]>([]);

  // Charger les livres selon le type de source
  useEffect(() => {
    const loadBooks = async () => {
      if (sourceType === 'bible' || sourceType === 'contributive') {
        // Bible regroupe officielle + contributive
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
        onVerseSelected(selectedBookId, book.name, selectedChapter, selectedVerse, sourceType);
      }
    }
  }, [selectedBookId, selectedChapter, selectedVerse, sourceType, onVerseSelected, books]);

  return (
    <div className="space-y-4">
      {/* Sélecteur de source */}
      <div>
        <label htmlFor="source_type" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Source <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedSourceType('bible')}
            className={`p-3 border-2 rounded-lg text-center transition-all ${
              sourceType === 'bible' || sourceType === 'contributive'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-slate-200 hover:border-accent/50 hover:bg-accent/5'
            }`}
          >
            <div className="text-2xl mb-1">📖</div>
            <div className="text-sm font-medium">Bible</div>
            <div className="text-xs text-slate-500">Officielle & Communautaire</div>
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
            <div className="text-xs text-slate-500">Textes deutérocanoniques</div>
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
          sourceType === 'bible' || sourceType === 'contributive' ? 'bg-accent/10 border-accent/30' :
          'bg-amber-50 border-amber-300'
        }`}>
          <p className={`text-sm font-medium ${
            sourceType === 'bible' || sourceType === 'contributive' ? 'text-accent' :
            'text-amber-700'
          }`}>
            📍 {currentBook?.name} {selectedChapter}:{selectedVerse}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
              sourceType === 'bible' || sourceType === 'contributive' ? 'bg-accent text-white' :
              'bg-amber-500 text-white'
            }`}>
              {sourceType === 'bible' || sourceType === 'contributive' ? 'Bible' : 'Apocryphe'}
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
