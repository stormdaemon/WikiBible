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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif text-primary mb-2">
          Créer un nouvel article
        </h1>
        <p className="text-secondary">
          Rédigez un article pour le Wiki Catholique
        </p>
      </div>

      <div className="card">
        <NewArticleForm />
      </div>
    </div>
  );
}
