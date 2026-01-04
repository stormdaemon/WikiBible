import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApocryphaContent } from '@/components/ApocryphaContent';

export const dynamic = 'force-dynamic';

interface ApocryphaBookPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ApocryphaBookPage({ params }: ApocryphaBookPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Récupérer le livre
  const { data: book } = await supabase
    .from('apocryphal_books')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!book) {
    notFound();
  }

  // Récupérer les versets
  const { data: verses } = await supabase
    .from('apocryphal_verses')
    .select('*')
    .eq('book_id', book.id)
    .order('chapter', { ascending: true })
    .order('verse', { ascending: true });

  // Grouper par chapitre
  const chapters = verses?.reduce((acc, verse) => {
    if (!acc[verse.chapter]) acc[verse.chapter] = [];
    acc[verse.chapter].push(verse);
    return acc;
  }, {} as Record<number, typeof verses>);

  // Vérifier l'authentification
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li><Link href="/apocrypha" className="text-secondary hover:text-primary">Apocryphes</Link></li>
            <li><span className="text-slate-300">/</span></li>
            <li><span className="text-accent font-medium">{book.name_fr}</span></li>
          </ol>
        </nav>

        {/* Title */}
        <h1 className="text-4xl font-serif text-primary mb-2">
          {book.name_fr}
        </h1>

        <p className="text-lg text-slate-600 mb-4">
          {book.name}
        </p>

        {book.description_fr && (
          <p className="text-slate-700 mb-8">
            {book.description_fr}
          </p>
        )}

        {/* Chapter Navigation */}
        <div className="mb-8 pb-6 border-b border-border">
          <h3 className="text-lg font-bold text-primary mb-4">Chapitres</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(chapters).map((ch) => (
              <Link
                key={ch}
                href={`#chapter-${ch}`}
                className="px-3 py-2 rounded text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Chapitre {ch}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <ApocryphaContent book={book} chapters={chapters} isAuthenticated={isAuthenticated} />
      </div>
    </main>
  );
}
