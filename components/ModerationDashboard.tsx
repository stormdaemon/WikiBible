'use client';

import { useState } from 'react';
import { validateContributionAction, rejectContributionAction } from '@/app/actions';

interface Contribution {
  contribution_id: string;
  submitted_at: string;
  text: string;
  translation_id: string;
  contributor_id: string;
  contributor_username: string | null;
  contributor_email: string;
}

interface ModerationDashboardProps {
  contributions: Contribution[];
}

export function ModerationDashboard({ contributions }: ModerationDashboardProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (contributions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
        <span className="text-6xl mb-4 block">✅</span>
        <p className="text-xl text-primary font-medium">Aucune contribution en attente</p>
        <p class="text-secondary mt-2">Toutes les traductions ont été traitées</p>
      </div>
    );
  }

  const handleValidate = async (contributionId: string) => {
    setProcessingId(contributionId);
    const formData = new FormData();
    formData.append('contribution_id', contributionId);

    const result = await validateContributionAction(null, formData);

    setResults(prev => ({
      ...prev,
      [contributionId]: {
        success: !result.error,
        message: result.error || 'Traduction validée et publiée !'
      }
    }));

    setProcessingId(null);

    if (!result.error) {
      // Retirer la contribution de la liste
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleReject = async (contributionId: string) => {
    const notes = prompt('Raison du rejet (optionnel) :');
    if (notes === null) return; // Annulé

    setProcessingId(contributionId);
    const formData = new FormData();
    formData.append('contribution_id', contributionId);
    formData.append('review_notes', notes || '');

    const result = await rejectContributionAction(null, formData);

    setResults(prev => ({
      ...prev,
      [contributionId]: {
        success: !result.error,
        message: result.error || 'Traduction rejetée'
      }
    }));

    setProcessingId(null);

    if (!result.error) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const getTranslationName = (id: string) => {
    const names: Record<string, string> = {
      'osty': 'Bible Osty',
      'liturgique': 'Traduction Liturgique',
      'tob': 'Bible Tob',
      'vulgate': 'Vulgate',
      'septante': 'Septante',
      'hebreu': 'Texte Hébreu',
      'latin': 'Texte Latin',
      'grec': 'Texte Grec',
    };
    return names[id] || id;
  };

  return (
    <div className="space-y-4">
      {contributions.map((contribution) => {
        const result = results[contribution.contribution_id];

        return (
          <div
            key={contribution.contribution_id}
            className={`bg-white rounded-lg shadow-sm border transition-all ${
              result?.success
                ? 'border-green-300 bg-green-50'
                : result?.success === false
                ? 'border-red-300 bg-red-50'
                : 'border-border hover:border-accent'
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge--accent">
                      {getTranslationName(contribution.translation_id)}
                    </span>
                    <span className="text-sm text-secondary">
                      par {contribution.contributor_username || contribution.contributor_email}
                    </span>
                  </div>
                  <p className="text-xs text-secondary">
                    Soumis le {new Date(contribution.submitted_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {result && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? '✓ Validé' : '✗ Erreur'}
                  </div>
                )}
              </div>

              {/* Text content */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedId(expandedId === contribution.contribution_id ? null : contribution.contribution_id)}
                  className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className={`font-serif text-base ${expandedId === contribution.contribution_id ? '' : 'line-clamp-3'}`}>
                    "{contribution.text}"
                  </p>
                  {expandedId !== contribution.contribution_id && (
                    <p className="text-sm text-accent mt-2">Cliquez pour voir le texte complet</p>
                  )}
                </button>
              </div>

              {/* Result message */}
              {result && (
                <div className={`mb-4 p-3 rounded-lg ${
                  result.success
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <p className="text-sm font-medium">{result.message}</p>
                </div>
              )}

              {/* Actions */}
              {!result && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleValidate(contribution.contribution_id)}
                    disabled={processingId === contribution.contribution_id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {processingId === contribution.contribution_id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Validation...
                      </span>
                    ) : (
                      <span>✓ Valider et publier</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(contribution.contribution_id)}
                    disabled={processingId === contribution.contribution_id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {processingId === contribution.contribution_id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Rejet...
                      </span>
                    ) : (
                      <span>✗ Rejeter</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
