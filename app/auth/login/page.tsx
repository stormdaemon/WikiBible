'use client';

import { loginAction } from '@/app/actions';
import { useFormState } from 'react-dom';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, null as Awaited<ReturnType<typeof loginAction>> | null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Connexion
          </h1>
          <p className="text-secondary">
            Accédez à Wiki Catholic
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-border p-8 shadow-card">
          <form action={formAction} className="space-y-6">
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
                autoComplete="current-password"
                required
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
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-secondary">
            Pas encore de compte?{' '}
            <Link href="/auth/register" className="text-accent hover:underline font-medium">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
