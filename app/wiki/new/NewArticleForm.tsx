'use client';

import { createArticleAction } from '@/app/actions';
import { useActionState, useState, useEffect } from 'react';
import Link from 'next/link';
import WikiEditor from '@/components/wiki-editor/WikiEditor';

export default function NewArticleForm() {
  const [state, formAction, isPending] = useActionState(createArticleAction, null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Gérer la redirection en cas de succès
  useEffect(() => {
    if (state?.success && state?.slug) {
      window.location.href = `/wiki/${state.slug}`;
    }
  }, [state]);

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <form action={formAction} className="space-y-6">
        {/* Titre */}
        <div className="form__group">
          <label htmlFor="title" className="form__label flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Titre de l'article <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="form__input"
            placeholder="Ex: Saint Pierre, Concile de Trente, Transsubstantiation..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {title && (
            <p className="text-xs text-slate-500 mt-1">
              Slug: <code className="bg-slate-100 px-2 py-0.5 rounded">
              {title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || 'auto-généré'}
              </code>
            </p>
          )}
        </div>

        {/* Éditeur WYSIWYG */}
        <div className="form__group">
          <label className="form__label flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Contenu <span className="text-red-500">*</span>
          </label>

          <WikiEditor
            content={content}
            onChange={(html, _text) => setContent(html)}
            placeholder="Rédigez votre article ici..."
          />

          {/* Champ caché pour le formulaire */}
          <input type="hidden" name="content" value={content} />

          <p className="text-xs text-secondary mt-2 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Utilisez les boutons de la barre d'outils pour formater le texte, insérer des versets bibliques et des liens wiki.
          </p>
        </div>

        {/* Commentaire */}
        <div className="form__group">
          <label htmlFor="comment" className="form__label flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Commentaire de révision
          </label>
          <input
            id="comment"
            name="comment"
            type="text"
            className="form__input"
            placeholder="Ex: Création initiale de l'article"
          />
          <p className="text-xs text-slate-500 mt-1">
            Ce commentaire sera visible dans l'historique des révisions.
          </p>
        </div>

        {/* Erreur */}
        {state?.error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800" role="alert">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className="font-medium">{state.error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="btn btn--primary flex-1 flex items-center justify-center gap-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Publication en cours...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Publier l'article
              </>
            )}
          </button>
          <Link
            href="/wiki"
            className="btn btn--secondary flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Annuler
          </Link>
        </div>
      </form>

      {/* Conseils de création */}
      <div className="bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-xl p-6">
        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Conseils pour un bon article
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span><strong>Titre clair :</strong> Utilisez des noms propres et des termes précis (ex: "Saint Augustin d'Hippone" plutôt que "Augustin")</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span><strong>Sources :</strong> Citez vos sources avec les références externes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span><strong>Liens Wiki :</strong> Utilisez le bouton "Lien Wiki" pour créer des liens vers d'autres articles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span><strong>Références bibliques :</strong> Utilisez le bouton "Verset" pour insérer des citations bibliques</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
