'use client';

import { useState, useActionState } from 'react';
import { deleteAnnotationAction, updateAnnotationAction } from '@/app/actions';

interface AnnotationCardProps {
  id: string;
  content: string;
  author: {
    id: string;
    username: string | null;
  };
  confession: string;
  createdAt: string;
  isOwner: boolean;
}

const confessionColors = {
  catholic: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  orthodox: 'bg-blue-100 text-blue-800 border-blue-300',
  protestant: 'bg-purple-100 text-purple-800 border-purple-300',
  anglican: 'bg-green-100 text-green-800 border-green-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300',
};

const confessionLabels = {
  catholic: '🙏 Catholique',
  orthodox: '✝️ Orthodoxe',
  protestant: '📖 Protestante',
  anglican: '⛪ Anglicane',
  other: '❓ Autre',
};

export function AnnotationCard({
  id,
  content,
  author,
  confession,
  createdAt,
  isOwner,
}: AnnotationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [, deleteFormAction, deletePending] = useActionState(deleteAnnotationAction, null);
  const [, updateFormAction, updatePending] = useActionState(updateAnnotationAction, null);

  const date = new Date(createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const confessionColor = confessionColors[confession as keyof typeof confessionColors] || confessionColors.other;
  const confessionLabel = confessionLabels[confession as keyof typeof confessionLabels] || confessionLabels.other;

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
      {/* Header avec confession et auteur */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Badge confession */}
          <span className={`px-2 py-1 rounded text-xs font-medium border ${confessionColor}`}>
            {confessionLabel}
          </span>

          {/* Nom auteur */}
          <span className="text-sm text-slate-600">
            Par {author.username || 'Anonyme'}
          </span>

          {/* Date */}
          <span className="text-xs text-slate-500">
            {date}
          </span>
        </div>

        {/* Actions si propriétaire */}
        {isOwner && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-500 hover:text-accent hover:bg-accent/10 rounded transition-colors"
              title="Modifier"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <form action={deleteFormAction}>
              <input type="hidden" name="annotation_id" value={id} />
              <button
                type="submit"
                disabled={deletePending}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Contenu */}
      {isEditing ? (
        <form action={updateFormAction} className="space-y-3">
          <input type="hidden" name="annotation_id" value={id} />
          <textarea
            name="content"
            defaultValue={content}
            rows={4}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
            required
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={updatePending}
              className="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {updatePending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}
