'use client';

import { registerAction } from '@/app/actions';
import { useActionState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, null as Awaited<ReturnType<typeof registerAction>> | null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Créer un compte
          </h1>
          <p className="text-secondary">
            Rejoignez WikiBible
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-border p-8 shadow-card">
          <form action={formAction} className="space-y-6">
            <div className="form__group">
              <label htmlFor="name" className="form__label">
                Nom
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="form__input"
                placeholder="Votre nom"
              />
            </div>

            <div className="form__group">
              <label htmlFor="email" className="form__label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form__input"
                placeholder="vous@exemple.com"
              />
            </div>

            <div className="form__group">
              <label htmlFor="password" className="form__label">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="form__input"
                placeholder="••••••••"
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

            <button
              type="submit"
              className="btn btn--primary btn--block"
            >
              Créer un compte
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-secondary">
            Déjà un compte?{' '}
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
