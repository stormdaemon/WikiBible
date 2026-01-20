'use client';

import { useState } from 'react';
import { updateApocryphaVerseAction } from '@/app/actions';

interface EditApocryphaVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseId: string;
  bookName: string;
  chapter: number;
  verse: number;
  currentTextOriginal: string;
  currentTextFr: string;
  onSuccess?: () => void;
}

export function EditApocryphaVerseModal({
  isOpen,
  onClose,
  verseId,
  bookName,
  chapter,
  verse,
  currentTextOriginal,
  currentTextFr,
  onSuccess,
}: EditApocryphaVerseModalProps) {
  const [textOriginal, setTextOriginal] = useState(currentTextOriginal);
  const [textFr, setTextFr] = useState(currentTextFr);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Vérifier qu'au moins un champ a été modifié
    if (textOriginal === currentTextOriginal && textFr === currentTextFr) {
      setError('Aucune modification détectée');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('verse_id', verseId);
    formData.append('text_original', textOriginal);
    formData.append('text_fr', textFr);

    const result = await updateApocryphaVerseAction(null, formData);

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
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Modifier le verset apocryphe
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

          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Référence :</strong> {bookName} {chapter}:{verse}
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
                Verset modifié avec succès !
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Texte original */}
            <div className="mb-4">
              <label htmlFor="textOriginal" className="block text-sm font-medium text-gray-700 mb-2">
                Texte original :
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 italic mb-2">
                {currentTextOriginal}
              </div>
              <textarea
                id="textOriginal"
                value={textOriginal}
                onChange={(e) => setTextOriginal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-h-[100px] text-sm"
                placeholder="Entrez le texte original corrigé..."
                disabled={isSubmitting}
              />
            </div>

            {/* Texte français */}
            <div className="mb-4">
              <label htmlFor="textFr" className="block text-sm font-medium text-gray-700 mb-2">
                Traduction française :
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 italic mb-2">
                {currentTextFr}
              </div>
              <textarea
                id="textFr"
                value={textFr}
                onChange={(e) => setTextFr(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-h-[100px]"
                placeholder="Entrez la traduction française corrigée..."
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-500">
                Modifiez le ou les champs que vous souhaitez corriger
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
                  disabled={isSubmitting || (textOriginal === currentTextOriginal && textFr === currentTextFr)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
