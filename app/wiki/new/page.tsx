'use client';

import { createArticleAction } from '@/app/actions';
import { useFormState } from 'react-dom';
import Link from 'next/link';

export default function NewArticlePage() {
  const [state, formAction] = useFormState(createArticleAction, null as Awaited<ReturnType<typeof createArticleAction>> | null);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">WikiCatholic</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/bible" className="text-sm font-medium text-secondary hover:text-primary">Bible</Link>
            <Link href="/wiki" className="text-sm font-medium text-secondary hover:text-primary">Wiki</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-primary mb-2">
            Créer un nouvel article
          </h1>
          <p className="text-secondary">
            Rédigez un article pour le Wiki Catholique
          </p>
        </div>

        <div className="card">
          <form action={formAction} className="card__body space-y-6">
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
              >
                Publier l'article
              </button>
              <Link href="/wiki" className="btn btn--secondary">
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
