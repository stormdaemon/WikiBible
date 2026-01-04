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
    <main className="min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-6">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
            <li><Link href="/" className="text-secondary hover:text-primary">Accueil</Link></li>
            <li><span className="text-slate-300">/</span></li>
            <li><span className="text-accent font-medium">Apocryphes</span></li>
          </ol>
        </nav>

        <h1 className="text-4xl font-serif text-primary mb-4">
          Textes Apocryphes
        </h1>

        <p className="text-lg text-slate-600">
          Collection de textes apocryphes et deutérocanoniques de la tradition juive et chrétienne.
        </p>
      </div>

      {/* Filter */}
      <div className="py-6 bg-slate-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ApocryphaFilter />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories && Object.entries(categories).map(([category, categoryBooks]) => (
          <section key={category} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-primary">
                {getCategoryLabel(category)}
              </h2>
              <span className="badge badge--accent">
                {(categoryBooks as ApocryphaBook[]).length} texte{(categoryBooks as ApocryphaBook[]).length > 1 ? 's' : ''}
              </span>
            </div>
            <ApocryphaGrid books={categoryBooks as ApocryphaBook[]} />
          </section>
        ))}

        {books && books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Aucun texte apocryphe disponible pour le moment.</p>
          </div>
        )}
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
