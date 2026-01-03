import Link from 'next/link';

interface ApocryphaContentProps {
  book: {
    id: string;
    name_fr: string;
    slug: string;
  };
  chapters: Record<string, Array<{
    id: string;
    chapter: number;
    verse: number;
    text_original: string;
    text_fr: string;
  }>>;
}

export function ApocryphaContent({ book, chapters }: ApocryphaContentProps) {
  return (
    <div className="apocrypha-content">
      {Object.entries(chapters).map(([chapterNum, verses]) => (
        <section
          key={chapterNum}
          id={`chapter-${chapterNum}`}
          className="apocrypha-content__chapter apocrypha-content__chapter--mb-12 mb-12"
        >
          <h2 className="apocrypha-content__chapter-title apocrypha-content__chapter-title--text-2xl text-2xl font-serif text-primary mb-6 pb-2 border-b border-border">
            Chapitre {chapterNum}
          </h2>

          <div className="apocrypha-content__verses space-y-6">
            {verses.map((verse) => (
              <article
                key={verse.id}
                id={`verse-${verse.verse}`}
                className="apocrypha-content__verse apocrypha-content__verse--bg-white bg-white p-6 rounded-lg border border-border hover:border-accent transition-colors"
              >
                {/* Verse Number */}
                <div className="apocrypha-content__verse-header flex items-center gap-3 mb-3">
                  <span className="apocrypha-content__verse-num apocrypha-content__verse-num--bg-accent bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                    {verse.verse}
                  </span>
                  <Link
                    href={`/apocrypha/${book.slug}#${verse.chapter}:${verse.verse}`}
                    className="apocrypha-content__verse-link apocrypha-content__verse-link--text-xs text-xs text-slate-400 hover:text-accent"
                  >
                    🔗 Lien permanent
                  </Link>
                </div>

                {/* French Text */}
                {verse.text_fr && (
                  <div className="apocrypha-content__text-fr apocrypha-content__text-fr--mb-4 mb-4">
                    <p className="apocrypha-content__text apocrypha-content__text--text-lg text-lg text-slate-800 leading-relaxed">
                      {verse.text_fr}
                    </p>
                  </div>
                )}

                {/* Original Text */}
                <details className="apocrypha-content__original apocrypha-content__original--mt-4 mt-4">
                  <summary className="apocrypha-content__original-toggle apocrypha-content__original-toggle--cursor-pointer cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                    Voir le texte original ({book.slug})
                  </summary>
                  <div className="apocrypha-content__original-text apocrypha-content__original-text--mt-3 mt-3 p-4 bg-slate-50 rounded text-slate-600 italic">
                    <p className="text-sm leading-relaxed">
                      {verse.text_original}
                    </p>
                  </div>
                </details>

                {/* Actions */}
                <div className="apocrypha-content__actions apocrypha-content__actions--flex apocrypha-content__actions--flex-row flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button className="apocrypha-content__btn apocrypha-content__btn--text-sm text-sm px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    📌 Annoter
                  </button>
                  <button className="apocrypha-content__btn apocrypha-content__btn--text-sm text-sm px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    📤 Partager
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
