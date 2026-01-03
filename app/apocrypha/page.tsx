import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ApocryphaGrid } from '@/components/ApocryphaGrid';
import { ApocryphaFilter } from '@/components/ApocryphaFilter';

export const dynamic = 'force-dynamic';

export default async function ApocryphaPage() {
  const supabase = await createClient();

  // Récupérer tous les livres apocryphes
  const { data: books } = await supabase
    .from('apocryphal_books')
    .select('*')
    .order('slug', { ascending: true });

  // Type pour les livres apocryphes
  type ApocryphaBook = {
    id: string;
    name: string;
    name_fr: string;
    slug: string;
    category: string;
    chapters: number;
    description_fr: string | null;
  };

  // Grouper par catégorie
  const categories = books?.reduce((acc, book) => {
    if (!acc[book.category]) acc[book.category] = [];
    acc[book.category].push(book);
    return acc;
  }, {} as Record<string, ApocryphaBook[]>);

  return (
    <main className="apocrypha">
      {/* Header */}
      <div className="apocrypha__header">
        <div className="apocrypha__container container">
          <nav className="apocrypha__breadcrumb breadcrumb">
            <ol className="breadcrumb__list inline-flex items-center space-x-1 md:space-x-3">
              <li><Link href="/" className="breadcrumb__link text-secondary hover:text-primary">Accueil</Link></li>
              <li><span className="breadcrumb__separator text-slate-300">/</span></li>
              <li><span className="breadcrumb__current text-accent font-medium">Apocryphes</span></li>
            </ol>
          </nav>

          <h1 className="apocrypha__title text-4xl font-serif text-primary mt-4">
            Textes Apocryphes
          </h1>

          <p className="apocrypha__description text-lg text-slate-600 mt-4">
            Collection de textes apocryphes et deutérocanoniques de la tradition juive et chrétienne.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="apocrypha__filter-section py-6 bg-slate-50 border-b border-border">
        <div className="apocrypha__container container">
          <ApocryphaFilter />
        </div>
      </div>

      {/* Content */}
      <div className="apocrypha__content py-12">
        <div className="apocrypha__container container">
          {categories && Object.entries(categories).map(([category, categoryBooks]) => (
            <section key={category} className="apocrypha__category apocrypha__category--mb-12 mb-12">
              <h2 className="apocrypha__category-title apocrypha__category-title--text-2xl text-2xl font-bold text-primary mb-6">
                {getCategoryLabel(category)}
              </h2>
              <ApocryphaGrid books={categoryBooks as ApocryphaBook[]} />
            </section>
          ))}

          {books && books.length === 0 && (
            <div className="apocrypha__empty apocrypha__empty--text-center text-center py-12">
              <p className="text-slate-500">Aucun texte apocryphe disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'deutero': 'Deutérocanoniques',
    'apocrypha': 'Apocryphes',
    'second_temple': 'Second Temple',
    'dss': 'Manuscrits de la Mer Morte',
  };
  return labels[category] || category;
}
