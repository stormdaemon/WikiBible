import Link from 'next/link';

interface ApocryphaGridProps {
  books: Array<{
    id: string;
    name: string;
    name_fr: string;
    slug: string;
    category: string;
    chapters: number;
    description_fr: string | null;
  }>;
}

export function ApocryphaGrid({ books }: ApocryphaGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/apocrypha/${book.slug}`}
          className="card card--clickable hover:border-accent transition-colors"
        >
          <div className="p-4">
            <h3 className="font-serif text-lg font-bold text-primary mb-2">
              {book.name_fr}
            </h3>

            <p className="text-sm text-secondary mb-3">
              {book.name}
            </p>

            {book.description_fr && (
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                {book.description_fr}
              </p>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {book.chapters} chapitre{book.chapters > 1 ? 's' : ''}
              </span>
              <span className="text-accent font-medium">
                Lire →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
