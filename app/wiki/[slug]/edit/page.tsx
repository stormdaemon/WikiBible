import { getArticleAction } from '@/app/actions';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import EditArticleForm from './EditArticleForm';

export default async function EditArticlePage({
  params,
}: {
  params: { slug: string };
}) {
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
    redirect(`/auth/login?redirect=/wiki/${params.slug}/edit`);
  }

  const result = await getArticleAction(params.slug);

  if (!result.success || !result.article) {
    notFound();
  }

  const article = result.article;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif text-primary mb-2">
          Modifier: {article.title}
        </h1>
        <p className="text-secondary">
          Créez une nouvelle révision de cet article
        </p>
      </div>

      <EditArticleForm article={article} />
    </div>
  );
}
