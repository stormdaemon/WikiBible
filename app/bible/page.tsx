import { getBooksAction } from '@/app/actions';
import { BiblePageClient } from './BiblePageClient';
import { createPublicClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function BiblePage() {
  const [result, translationsResult] = await Promise.all([
    getBooksAction(),
    createPublicClient()
      .from('bible_translations')
      .select('slug, name')
      .eq('is_active', true)
      .eq('type', 'official')
      .in('slug', ['crampon', 'jerusalem', 'septante', 'grec']),
  ]);

  if (!result.success || !result.books) {
    return <div className="text-center py-12 text-danger">Erreur lors du chargement des livres</div>;
  }

  const translationOrder = ['crampon', 'jerusalem', 'septante', 'grec'];
  const translations = (translationsResult.data || [])
    .map((translation) => ({
      id: translation.slug,
      name: translation.name,
    }))
    .sort((a, b) => translationOrder.indexOf(a.id) - translationOrder.indexOf(b.id));

  return <BiblePageClient books={result.books} translations={translations} />;
}
