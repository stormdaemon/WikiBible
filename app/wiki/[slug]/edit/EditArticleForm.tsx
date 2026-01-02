'use client';

import { updateArticleAction } from '@/app/actions';
import { useActionState } from 'react';
import Link from 'next/link';
import type { Tables } from '@/lib/database.types';

interface EditArticleFormProps {
  article: Tables<'wiki_articles'>;
}

export default function EditArticleForm({ article }: EditArticleFormProps) {
  const [state, formAction] = useActionState(updateArticleAction, null as Awaited<ReturnType<typeof updateArticleAction>> | null);

  return (
    <div className="card">
      <form action={formAction} className="space-y-6 p-6">
        <input type="hidden" name="article_id" value={article.id} />

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
            placeholder="Ex: Correction de la formulation, ajout de sources..."
          />
        </div>

        <div className="form__group">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_minor_edit"
              value="true"
              className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
            />
            <span className="text-sm text-primary">Modification mineure (correction typos, formatage)</span>
          </label>
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
          >
            Publier la modification
          </button>
          <Link href={`/wiki/${article.slug}`} className="btn btn--secondary">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
