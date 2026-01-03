'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { createVerseLinkAction } from '@/app/actions';
import { VerseSelector } from './VerseSelector';

type Step = 1 | 2;
type Category = 'bible_link' | 'commentary' | 'external_reference' | null;

interface AddLinkModalProps {
  verseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddLinkModal({ verseId, isOpen, onClose }: AddLinkModalProps) {
  const [state, formAction, pending] = useActionState(createVerseLinkAction, null);
  const [step, setStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [selectedVerse, setSelectedVerse] = useState<{ bookId: string; chapter: number; verse: number } | null>(null);

  // Reset le wizard à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedCategory(null);
      setSelectedVerse(null);
    }
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedVerse(null);
  };

  const handleVerseSelected = (bookId: string, chapter: number, verse: number) => {
    setSelectedVerse({ bookId, chapter, verse });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {step === 1 ? 'Ajouter une contribution' : 'Détails de la contribution'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {step === 1 ? 'Choisissez le type de contribution' : 'Remplissez les informations'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-accent' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-accent' : 'bg-slate-200'}`} />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-600">
            <span>Étape 1 : Catégorie</span>
            <span>Étape 2 : Détails</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {/* Error Message */}
          {state?.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{state.error}</span>
            </div>
          )}

          {/* Success Message */}
          {state?.success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Contribution ajoutée avec succès !</span>
            </div>
          )}

          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="space-y-3">
              <button
                onClick={() => handleCategorySelect('bible_link')}
                className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">📖 Renvoi biblique</h3>
                    <p className="text-sm text-slate-600">Créer un lien vers un autre verset de la Bible</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-accent transition-colors">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => handleCategorySelect('commentary')}
                className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-700">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">💭 Commentaire / Méditation</h3>
                    <p className="text-sm text-slate-600">Ajouter votre réflexion sur ce verset</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-accent transition-colors">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => handleCategorySelect('external_reference')}
                className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-700">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">📚 Référence externe</h3>
                    <p className="text-sm text-slate-600">Saint, Père de l'Église, Concile, Catéchisme...</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-accent transition-colors">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Form based on category */}
          {step === 2 && selectedCategory && (
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="source_verse_id" value={verseId} />
              <input type="hidden" name="category" value={selectedCategory} />

              {/* Back button */}
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors mb-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Retour
              </button>

              {/* Bible Link Form */}
              {selectedCategory === 'bible_link' && (
                <>
                  <input type="hidden" name="link_type" value="parallel" />
                  <input type="hidden" name="book_id" value={selectedVerse?.bookId || ''} />
                  <input type="hidden" name="chapter" value={selectedVerse?.chapter || ''} />
                  <input type="hidden" name="verse" value={selectedVerse?.verse || ''} />

                  <VerseSelector onVerseSelected={handleVerseSelected} />

                  {/* Type de renvoi */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Type de renvoi <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="radio" name="link_subtype" value="figure" className="w-4 h-4 text-accent" required />
                        <span className="text-2xl">🎭</span>
                        <div className="flex-1">
                          <span className="font-medium">Figure</span>
                          <p className="text-xs text-slate-600">Préfiguration (foi, type, figure)</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="radio" name="link_subtype" value="type" className="w-4 h-4 text-accent" />
                        <span className="text-2xl">⚏</span>
                        <div className="flex-1">
                          <span className="font-medium">Type</span>
                          <p className="text-xs text-slate-600">Antitype (accomplissement)</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="radio" name="link_subtype" value="prophecy" className="w-4 h-4 text-accent" />
                        <span className="text-2xl">☀️</span>
                        <div className="flex-1">
                          <span className="font-medium">Prophétie</span>
                          <p className="text-xs text-slate-600">Prophétie biblique</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Checkbox prophétie accomplie */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" name="is_prophecy" value="true" className="w-4 h-4 mt-1 text-accent" />
                      <div>
                        <span className="font-medium text-yellow-900">Cocher si c'est une prophétie accomplie</span>
                        <p className="text-xs text-yellow-700">Ajoutera le soleil ☀️ à ce renvoi</p>
                      </div>
                    </label>
                  </div>
                </>
              )}

              {/* Commentary Form */}
              {selectedCategory === 'commentary' && (
                <>
                  <input type="hidden" name="link_type" value="commentary" />

                  <div>
                    <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Votre commentaire ou méditation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={6}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Partagez votre réflexion, exégèse ou méditation sur ce verset..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Type de contribution
                    </label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="commentary_type" value="commentary" className="w-4 h-4 text-accent" defaultChecked />
                        <span>Commentaire</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="commentary_type" value="meditation" className="w-4 h-4 text-accent" />
                        <span>Méditation</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* External Reference Form */}
              {selectedCategory === 'external_reference' && (
                <>
                  <input type="hidden" name="link_type" value="external" />

                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Auteur / Document <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Ex: Saint Augustin, Catéchisme de l'Église Catholique..."
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="reference" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Référence précise
                    </label>
                    <input
                      type="text"
                      id="reference"
                      name="reference"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Ex: § 1234, Livre III, Chapitre 2..."
                    />
                  </div>

                  <div>
                    <label htmlFor="source_type" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Type de source <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="source_type"
                      name="source_type"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-white"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      <option value="saint">Saint</option>
                      <option value="father">Père de l'Église</option>
                      <option value="council">Concile</option>
                      <option value="catechism">Catéchisme</option>
                      <option value="document">Document officiel</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Description ou citation
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Citez le passage ou décrivez la référence..."
                    />
                  </div>
                </>
              )}

              {/* Description optionnelle pour tous */}
              {selectedCategory === 'bible_link' && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-90">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                      <span>Ajouter une description (optionnel)</span>
                    </summary>
                    <div className="mt-3">
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Expliquez ce lien théologique, son contexte, sa signification..."
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none text-sm"
                        rows={3}
                      />
                    </div>
                  </details>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {pending ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      Ajout...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Ajouter
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
