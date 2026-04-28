import type { Metadata } from 'next';
import { getBooksAction, getOfficialBibleTranslationsAction } from '@/app/actions';
import { absoluteUrl, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { BiblePageClient } from './BiblePageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Bible Catholique',
  description: 'Lire la Bible catholique en ligne avec les livres canoniques et les traductions officielles disponibles sur WikiBible.',
  alternates: {
    canonical: absoluteUrl('/bible'),
  },
  openGraph: {
    title: 'Bible Catholique | WikiBible',
    description: 'Lire la Bible catholique en ligne, livre par livre et chapitre par chapitre.',
    url: absoluteUrl('/bible'),
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function BiblePage({
  searchParams,
}: {
  searchParams: Promise<{ translation?: string }>;
}) {
  const { translation } = await searchParams;
  const [result, translationsResult] = await Promise.all([
    getBooksAction(),
    getOfficialBibleTranslationsAction(),
  ]);

  if (!result.success || !result.books) {
    return <div className="text-center py-12 text-danger">Erreur lors du chargement des livres</div>;
  }

  const translations = translationsResult.translations || [];
  const initialTranslation = translations.some((item) => item.id === translation) ? translation : undefined;

  return <BiblePageClient books={result.books} translations={translations} initialTranslation={initialTranslation} />;
}
