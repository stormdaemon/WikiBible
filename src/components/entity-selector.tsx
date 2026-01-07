'use client';

import React, { useState } from 'react';
import { BibleEntity, createEntityAction } from '@/app/actions';

interface EntitySelectorProps {
  selectedText: string;
  verseId: string;
  onClose: () => void;
  onEntityCreated: (entity: BibleEntity) => void;
}

export function EntitySelector({ selectedText, verseId, onClose, onEntityCreated }: EntitySelectorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: selectedText,
    entity_type: 'person' as 'person' | 'place' | 'concept' | 'event',
    summary: '',
    aliases: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Préparer les données
    const formDataObj = new FormData();
    formDataObj.append('name', formData.name);
    formDataObj.append('entity_type', formData.entity_type);
    formDataObj.append('summary', formData.summary);
    formDataObj.append('aliases', formData.aliases);

    const result = await createEntityAction(null, formDataObj);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else if (result.entity) {
      onEntityCreated(result.entity);
      setIsOpen(false);
      onClose();
    }
  };

  if (showForm) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Ajouter une entité : "{selectedText}"
            </h3>
            <button
              onClick={() => {
                setIsOpen(false);
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entité
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'entité
              </label>
              <select
                value={formData.entity_type}
                onChange={(e) => setFormData({ ...formData, entity_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="person">👤 Personnage</option>
                <option value="place">📍 Lieu</option>
                <option value="concept">💡 Concept</option>
                <option value="event">⚡ Événement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Résumé (pour le tooltip)
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Description courte qui apparaîtra au survol..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autres noms (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.aliases}
                onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ex: Ponce Pilate, Pontius Pilatus"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium"
              >
                {isSubmitting ? 'Création...' : "Créer l'entité"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 max-w-sm"
      style={{
        top: `${window.scrollY + 200}px`,
        left: `${Math.min(window.innerWidth / 2 - 150, window.innerWidth - 350)}px`,
      }}
    >
      <p className="text-sm text-gray-700 mb-3">
        Texte sélectionné : <strong>"{selectedText}"</strong>
      </p>
      <div className="space-y-2">
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          ✨ Ajouter comme entité
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
