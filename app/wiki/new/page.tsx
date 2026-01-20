import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import NewArticleForm from './NewArticleForm';

export default async function NewArticlePage() {
  const supabase = await createClient();

  // Gestion robuste de l'authentification
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    console.error('Error getting user:', error);
  }

  if (!user) {
    redirect('/auth/login?redirect=/wiki/new');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/20">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Créer un nouvel article
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Wiki
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Enrichissez le Wiki Catholique avec votre connaissance
              </p>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-700">50</p>
                <p className="text-slate-600">points</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-left">
                <p className="font-medium text-slate-900">+50 XP</p>
                <p className="text-slate-600">pour cet article</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewArticleForm />
      </div>
    </div>
  );
}
