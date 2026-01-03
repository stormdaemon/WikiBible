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
    <div className="apocrypha-grid apocrypha-grid--cols-1 md:grid-cols-2 lg:grid-cols-3 grid gap-6">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/apocrypha/${book.slug}`}
          className="apocrypha-card apocrypha-card--block block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border p-6"
        >
          <h3 className="apocrypha-card__title apocrypha-card__title--text-xl text-xl font-serif text-primary mb-2">
            {book.name_fr}
          </h3>

          <p className="apocrypha-card__original-name apocrypha-card__original-name--text-sm text-sm text-slate-500 mb-3">
            {book.name}
          </p>

          {book.description_fr && (
            <p className="apocrypha-card__description apocrypha-card__description--text-slate-600 text-slate-600 text-sm mb-4 line-clamp-3">
              {book.description_fr}
            </p>
          )}

          <div className="apocrypha-card__meta apocrypha-card__meta--flex flex items-center justify-between text-sm">
            <span className="apocrypha-card__chapters apocrypha-card__chapters--text-slate-500 text-slate-500">
              {book.chapters} chapitre{book.chapters > 1 ? 's' : ''}
            </span>
            <span className="apocrypha-card__arrow apocrypha-card__arrow--text-accent text-accent">
              Lire →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
