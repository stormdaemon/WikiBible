'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBooksForTranslationAction } from '@/app/actions';
import { useTranslationPreference } from '@/hooks/useTranslationPreference';

interface Book {
  id: string;
  name: string;
  name_en: string;
  testament: string;
  position: number;
  chapters: number;
  slug: string;
  is_deuterocanonical?: boolean;
}

interface BiblePageClientProps {
  books: Book[];
  translations: Array<{
    id: string;
    name: string;
  }>;
  initialTranslation?: string;
}

export function BiblePageClient({ books, translations, initialTranslation }: BiblePageClientProps) {
  const [selectedSection, setSelectedSection] = useState<'all' | 'old' | 'psalms' | 'new'>('all');
  const [availableBooks, setAvailableBooks] = useState(books);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { translation, changeTranslation, isLoaded } = useTranslationPreference();

  useEffect(() => {
    if (
      isLoaded &&
      initialTranslation &&
      translations.some((item) => item.id === initialTranslation) &&
      translation !== initialTranslation
    ) {
      changeTranslation(initialTranslation);
    }
  }, [changeTranslation, initialTranslation, isLoaded, translation, translations]);

  const selectedTranslation = useMemo(() => translations.some((item) => item.id === translation)
    ? translation
    : initialTranslation && translations.some((item) => item.id === initialTranslation)
      ? initialTranslation
      : (translations[0]?.id || 'crampon'), [initialTranslation, translation, translations]);

  useEffect(() => {
    if (!isLoaded) return;

    let isCurrent = true;
    startTransition(() => {
      void getBooksForTranslationAction(selectedTranslation).then((result) => {
        if (isCurrent && result.success && result.books) {
          setAvailableBooks(result.books);
        }
      });
    });

    return () => {
      isCurrent = false;
    };
  }, [isLoaded, selectedTranslation]);

  const oldTestament = availableBooks.filter(book => book.testament === 'old');
  const psalms = availableBooks.filter(book => book.position === 23);
  const newTestament = availableBooks.filter(book => book.testament === 'new');

  const chapterHref = (bookSlug: string) =>
    `/bible/${bookSlug}/1?translation=${encodeURIComponent(selectedTranslation)}`;
  const showOldTestament = oldTestament.length > 0 && (selectedSection === 'all' || selectedSection === 'old');
  const showPsalms = psalms.length > 0 && selectedSection === 'psalms';
  const showNewTestament = newTestament.length > 0 && (selectedSection === 'all' || selectedSection === 'new');
  const showEmptySection =
    (selectedSection === 'old' && oldTestament.length === 0) ||
    (selectedSection === 'psalms' && psalms.length === 0) ||
    (selectedSection === 'new' && newTestament.length === 0) ||
    (selectedSection === 'all' && availableBooks.length === 0);

  const handleTranslationChange = (newTranslation: string) => {
    changeTranslation(newTranslation);
    router.replace(`/bible?translation=${encodeURIComponent(newTranslation)}`, { scroll: false });
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif text-primary mb-8">
          La Bible Catholique
        </h1>

        {/* Sélecteur de traduction */}
        <div className="mb-6 flex items-center gap-4">
          <label htmlFor="translation-select" className="text-sm font-medium text-secondary">
            Traduction :
          </label>
          <select
            id="translation-select"
            value={selectedTranslation}
            onChange={(e) => handleTranslationChange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
          >
            {translations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {isPending && <span className="text-sm text-secondary">Chargement...</span>}
        </div>

        {/* Navigation rapide - Sticky */}
        <div className="sticky top-0 z-40 bg-background border-b border-border py-4 mb-8 shadow-sm">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedSection('old')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSection === 'old' || selectedSection === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📜 Ancien Testament
            </button>
            <button
              onClick={() => setSelectedSection('psalms')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSection === 'psalms'
                  ? 'bg-accent text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🎵 Psaumes
            </button>
            <button
              onClick={() => setSelectedSection('new')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSection === 'new' || selectedSection === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✝️ Nouveau Testament
            </button>
          </div>
        </div>

        {/* Ancien Testament */}
        {showOldTestament && (
          <section id="ancien-testament" className="mb-12 scroll-mt-32">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-primary">Ancien Testament</h2>
              <span className="badge badge--accent">{oldTestament.length} livres</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {oldTestament.map(book => (
                <Link
                  key={book.id}
                  href={chapterHref(book.slug)}
                  className="card card--clickable hover:border-accent transition-colors"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg font-bold text-primary">
                        {book.name}
                      </h3>
                      {book.is_deuterocanonical && (
                        <span className="badge badge--accent text-xs">Deutérocanonique</span>
                      )}
                    </div>
                    <p className="text-sm text-secondary mb-2">{book.name_en}</p>
                    <p className="text-xs text-slate-400">{book.chapters} chapitres</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Psaumes */}
        {showPsalms && (
          <section id="psaumes" className="mb-12 scroll-mt-32">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-primary">Psaumes</h2>
              <span className="badge badge--accent">{psalms.length} livre</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {psalms.map(book => (
                <Link
                  key={book.id}
                  href={chapterHref(book.slug)}
                  className="card card--clickable hover:border-accent transition-colors"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg font-bold text-primary">
                        {book.name}
                      </h3>
                      <span className="badge badge--accent text-xs">150 chapitres</span>
                    </div>
                    <p className="text-sm text-secondary mb-2">{book.name_en}</p>
                    <p className="text-xs text-slate-400">{book.chapters} chapitres</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Nouveau Testament */}
        {showNewTestament && (
          <section id="nouveau-testament" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-primary">Nouveau Testament</h2>
              <span className="badge badge--accent">{newTestament.length} livres</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newTestament.map(book => (
                <Link
                  key={book.id}
                  href={chapterHref(book.slug)}
                  className="card card--clickable hover:border-accent transition-colors"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg font-bold text-primary">
                        {book.name}
                      </h3>
                    </div>
                    <p className="text-sm text-secondary mb-2">{book.name_en}</p>
                    <p className="text-xs text-slate-400">{book.chapters} chapitres</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {showEmptySection && (
          <p className="text-secondary">Aucun livre disponible pour cette section dans la traduction sélectionnée.</p>
        )}
      </div>
    </main>
  );
}
