'use client';

import { useState, useEffect } from 'react';
import { getBooksAction } from '@/app/actions';

interface VerseSelectorProps {
  onVerseSelected: (bookId: string, chapter: number, verse: number) => void;
}

export function VerseSelector({ onVerseSelected }: VerseSelectorProps) {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [selectedVerse, setSelectedVerse] = useState<number>(0);
  const [verses, setVerses] = useState<any[]>([]);

  // Charger les livres au montage
  useEffect(() => {
    const loadBooks = async () => {
      const result = await getBooksAction();
      if (result.success && result.books) {
        setBooks(result.books);
      }
    };
    loadBooks();
  }, []);

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
          const maxVerses = 150; // Valeur sûre, à ajuster selon DB
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

  const selectedBook = books.find(b => b.id === selectedBookId);

  // Notifier le parent quand les 3 valeurs sont sélectionnées
  useEffect(() => {
    if (selectedBookId && selectedChapter > 0 && selectedVerse > 0) {
      onVerseSelected(selectedBookId, selectedChapter, selectedVerse);
    }
  }, [selectedBookId, selectedChapter, selectedVerse, onVerseSelected]);

  return (
    <div className="space-y-4">
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
              {book.name} ({book.chapters} chapitres)
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
          {selectedBook && Array.from({ length: selectedBook.chapters }, (_, i) => (
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
        <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <p className="text-sm font-medium text-accent">
            📍 {selectedBook?.name} {selectedChapter}:{selectedVerse}
          </p>
        </div>
      )}
    </div>
  );
}
