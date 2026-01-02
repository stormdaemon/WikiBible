'use client';

import { useActionState } from 'react';
import { updateProfileAction } from '@/app/actions';

interface ProfileSettingsProps {
  profile: any;
  userId: string;
  email: string;
}

const confessions = [
  { value: 'catholic', label: '🇻🇦 Catholique', description: 'Église catholique romaine' },
  { value: 'orthodox', label: '✝️ Orthodoxe', description: 'Églises orthodoxes orientales' },
  { value: 'protestant', label: '⛪ Protestant', description: 'Églises protestantes et réformées' },
  { value: 'anglican', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Anglican', description: 'Communion anglicane' },
  { value: 'other', label: '📿 Autre', description: 'Autre confession chrétienne' },
];

export function ProfileSettings({ profile, userId, email }: ProfileSettingsProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="user_id" value={userId} />

      {/* Success Message */}
      {state?.success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Profil mis à jour avec succès !</span>
        </div>
      )}

      {/* Error Message */}
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
        />
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Nom d'utilisateur
        </label>
        <input
          type="text"
          name="username"
          defaultValue={profile?.username || ''}
          placeholder="votre-pseudo"
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
        />
        <p className="text-xs text-slate-500 mt-1.5">
          Ce nom sera affiché publiquement sur vos contributions
        </p>
      </div>

      {/* Confession */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Confession religieuse <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {confessions.map((conf) => (
            <label
              key={conf.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                (profile?.confession || 'catholic') === conf.value
                  ? 'border-accent bg-accent/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="confession"
                value={conf.value}
                defaultChecked={(profile?.confession || 'catholic') === conf.value}
                className="mt-1 w-4 h-4 text-accent focus:ring-accent"
              />
              <div>
                <div className="font-medium text-slate-800">{conf.label}</div>
                <div className="text-sm text-slate-600">{conf.description}</div>
              </div>
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Cette information sera automatiquement associée à vos contributions théologiques
        </p>
      </div>

      {/* Bio (optionnel) */}
      <div>
        <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Bio (optionnel)
        </label>
        <textarea
          name="bio"
          defaultValue={profile?.bio || ''}
          placeholder="Parlez-nous un peu de vous..."
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
          rows={4}
        />
      </div>

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={pending}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
        >
          {pending ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Enregistrement...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Enregistrer mon profil
            </>
          )}
        </button>
      </div>
    </form>
  );
}
