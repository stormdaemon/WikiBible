'use client';

import { createArticleAction } from '@/app/actions';
import { useActionState } from 'react';
import Link from 'next/link';

export default function NewArticleForm() {
  const [state, formAction, isPending] = useActionState(createArticleAction, null);

  return (
    <form action={formAction} className="space-y-6 p-6">
      <div className="form__group">
        <label htmlFor="title" className="form__label">
          Titre de l'article
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="form__input"
          placeholder="Ex: Saint Pierre, Concile de Trente..."
        />
      </div>

      <div className="form__group">
        <label htmlFor="content" className="form__label">
          Contenu (Markdown supporté)
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={15}
          className="form__textarea"
          placeholder="# Introduction&#10;&#10;Rédigez votre article ici...&#10;&#10;Vous pouvez utiliser des liens wiki comme [[Jean 3:16]] ou [[Article Title]]"
        />
        <p className="text-xs text-secondary mt-2">
          💡 Utilisez [[Livre Chapitre:Verset]] pour les références bibliques (ex: [[Jean 3:16]])
        </p>
      </div>

      <div className="form__group">
        <label htmlFor="comment" className="form__label">
          Commentaire de révision
        </label>
        <input
          id="comment"
          name="comment"
          type="text"
          className="form__input"
          placeholder="Ex: Création initiale de l'article"
        />
      </div>

      {state?.error && (
        <div className="alert alert--error" role="alert">
          <svg className="alert__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isPending}
        >
          {isPending ? 'Publication en cours...' : 'Publier l\'article'}
        </button>
        <Link href="/wiki" className="btn btn--secondary">
          Annuler
        </Link>
      </div>
    </form>
  );
}
