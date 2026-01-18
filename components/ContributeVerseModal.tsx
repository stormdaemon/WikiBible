'use client';

import { useState, useEffect } from 'react';
import { addVerseAction } from '@/app/actions';

interface ContributeVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseId: string;
  bookName: string;
  chapter: number;
  verse: number;
  translation: string;
  bookId?: string;
  onSuccess?: () => void;
}

export function ContributeVerseModal({
  isOpen,
  onClose,
  verseId,
  bookName,
  chapter,
  verse,
  translation,
  bookId,
  onSuccess,
}: ContributeVerseModalProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setText('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!bookId) {
      setError('ID du livre manquant. Veuillez réessayer.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('book_id', bookId);
    formData.append('chapter', chapter.toString());
    formData.append('verse', verse.toString());
    formData.append('text', text);
    formData.append('translation_id', translation);

    const result = await addVerseAction(null, formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setText('');
        onClose();
        onSuccess?.();
      }, 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal Content - truly responsive */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
          {/* Header */}
          <div className="flex items-start gap-2 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0 pr-2">
              <h2 id="modal-title" className="text-base sm:text-lg md:text-xl font-bold text-primary truncate">
                Ajouter un verset manquant
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg text-secondary hover:text-danger hover:bg-red-50 transition-colors"
              aria-label="Fermer la modal"
            >
              <svg className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Verse Info */}
          <div className="mb-3 sm:mb-4 p-2 sm:p-2.5 md:p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-xs sm:text-xs md:text-sm font-medium text-accent truncate">
              📍 {bookName} {chapter}:{verse}
            </p>
            <p className="mt-1 text-[10px] sm:text-[10px] md:text-xs text-secondary">
              <span className="font-semibold">Traduction :</span>{' '}
              <span className="break-words">{translation}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 md:space-y-4">
            {/* Textarea */}
            <div className="min-w-0">
              <label htmlFor="text" className="block text-xs md:text-sm font-semibold text-slate-700 mb-1">
                Texte du verset <span className="text-red-500">*</span>
              </label>
              <textarea
                id="text"
                name="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full min-w-0 p-2 sm:p-2.5 md:p-3 text-xs sm:text-xs md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-white resize-y"
                placeholder="Entrez le texte complet du verset..."
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Info Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-2 md:p-2.5">
              <p className="text-[10px] sm:text-[10px] md:text-xs text-amber-800">
                <strong>+25 points</strong> pour cette contribution ! Le verset sera ajouté directement à la traduction.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-2 md:p-2.5">
                <p className="text-[10px] sm:text-[10px] md:text-xs text-red-800 break-words">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-2 md:p-2.5">
                <p className="text-[10px] sm:text-[10px] md:text-xs text-green-800">
                  Verset ajouté avec succès ! +25 points
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2.5 md:gap-3 justify-end pt-1 sm:pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-3 sm:px-3.5 md:px-4 py-2 md:py-2.5 border-2 border-slate-300 rounded-lg text-secondary hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium text-xs sm:text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !text.trim()}
                className="w-full sm:w-auto px-3 sm:px-3.5 md:px-4 py-2 md:py-2.5 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-xs md:text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="animate-spin h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Ajout...</span>
                  </span>
                ) : (
                  'Ajouter le verset'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
