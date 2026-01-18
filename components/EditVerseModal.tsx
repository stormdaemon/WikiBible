'use client';

import { useState } from 'react';
import { updateVerseAction } from '@/app/actions';

interface EditVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseId: string;
  bookName: string;
  chapter: number;
  verse: number;
  currentText: string;
  translationId: string;
  onSuccess?: () => void;
}

export function EditVerseModal({
  isOpen,
  onClose,
  verseId,
  bookName,
  chapter,
  verse,
  currentText,
  translationId,
  onSuccess,
}: EditVerseModalProps) {
  const [text, setText] = useState(currentText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('verse_id', verseId);
    formData.append('text', text);

    const result = await updateVerseAction(null, formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
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
              Modifier le verset
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

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Référence :</strong> {bookName} {chapter}:{verse}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Traduction : <span className="font-semibold">{translationId === 'jerusalem' ? 'Bible de Jérusalem' : 'Crampon'}</span>
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
                Verset modifié avec succès ! +25 points
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="verseText" className="block text-sm font-medium text-gray-700 mb-2">
                Texte actuel :
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 italic mb-3">
                {currentText}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="newVerseText" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau texte *
              </label>
              <textarea
                id="newVerseText"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] font-serif text-base"
                placeholder="Entrez le texte corrigé du verset..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-500">
                Vous gagnerez <span className="font-semibold text-blue-600">+25 points</span> pour cette contribution
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
                  disabled={isSubmitting || text === currentText || !text.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Modification...' : 'Modifier le verset'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
