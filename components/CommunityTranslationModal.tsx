'use client';

import { useState } from 'react';
import { submitCommunityTranslationAction } from '@/app/actions';

interface CommunityTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  translationId: string;
  translationName: string;
  onSuccess?: () => void;
}

export function CommunityTranslationModal({
  isOpen,
  onClose,
  bookId,
  bookName,
  chapter,
  verse,
  translationId,
  translationName,
  onSuccess,
}: CommunityTranslationModalProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('book_id', bookId);
    formData.append('chapter', chapter.toString());
    formData.append('verse', verse.toString());
    formData.append('text', text);
    formData.append('translation_id', translationId);

    const result = await submitCommunityTranslationAction(null, formData);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Contribuer une traduction
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Référence :</strong> {bookName} {chapter}:{verse}
            </p>
            <p className="text-sm text-purple-700 mt-1">
              Traduction : <span className="font-semibold">{translationName}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Traduction soumise avec succès ! Elle sera examinée avant publication. +25 points
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="verseText" className="block text-sm font-medium text-gray-700 mb-2">
                Votre traduction *
              </label>
              <textarea
                id="verseText"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[120px] font-serif text-base"
                placeholder="Entrez votre traduction du verset..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Votre traduction sera soumise pour modération avant d'être publiée.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-500">
                Vous gagnerez <span className="font-semibold text-purple-600">+25 points</span> pour cette contribution
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !text.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Soumission...' : 'Soumettre'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
