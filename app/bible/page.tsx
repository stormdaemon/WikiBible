import { getBooksAction } from '@/app/actions';
import { BiblePageClient } from './BiblePageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function BiblePage() {
  const result = await getBooksAction();

  if (!result.success || !result.books) {
    return <div className="text-center py-12 text-danger">Erreur lors du chargement des livres</div>;
  }

  return <BiblePageClient books={result.books} />;
}
