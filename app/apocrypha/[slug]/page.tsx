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

  return (
    <main className="apocrypha-book">
      {/* Header */}
      <div className="apocrypha-book__header bg-slate-50 border-b border-border">
        <div className="apocrypha-book__container container px-6 py-8">
          {/* Breadcrumb */}
          <nav className="apocrypha-book__breadcrumb breadcrumb mb-4">
            <ol className="breadcrumb__list inline-flex items-center space-x-1 md:space-x-3 text-sm">
              <li><Link href="/apocrypha" className="breadcrumb__link text-secondary hover:text-primary">Apocryphes</Link></li>
              <li><span className="breadcrumb__separator text-slate-300">/</span></li>
              <li><span className="breadcrumb__current text-accent font-medium">{book.name_fr}</span></li>
            </ol>
          </nav>

          <h1 className="apocrypha-book__title text-4xl font-serif text-primary mb-2">
            {book.name_fr}
          </h1>

          <p className="apocrypha-book__subtitle text-lg text-slate-600 mb-4">
            {book.name}
          </p>

          {book.description_fr && (
            <p className="apocrypha-book__description text-slate-700">
              {book.description_fr}
            </p>
          )}
        </div>
      </div>

      {/* Chapter Navigation */}
      <div className="apocrypha-book__nav bg-white border-b border-border sticky top-0 z-10">
        <div className="apocrypha-book__container container px-6 py-4">
          <div className="apocrypha-book__chapters-nav flex flex-wrap gap-2">
            {Object.keys(chapters).map((ch) => (
              <Link
                key={ch}
                href={`#chapter-${ch}`}
                className="apocrypha-book__chapter-link apocrypha-book__chapter-link--px-3 px-3 py-2 rounded text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Chapitre {ch}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="apocrypha-book__content py-12">
        <div className="apocrypha-book__container container px-6">
          <ApocryphaContent book={book} chapters={chapters} />
        </div>
      </div>
    </main>
  );
}
