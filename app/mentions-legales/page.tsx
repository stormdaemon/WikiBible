import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">WikiBible</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/bible" className="text-sm font-medium text-secondary hover:text-primary">Bible</Link>
            <Link href="/wiki" className="text-sm font-medium text-secondary hover:text-primary">Wiki</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif text-primary mb-8">
          Mentions Légales
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Éditeur du site</h2>
            <p className="text-secondary">
              Association Parole et Partage<br/>
              841890692 00012<br/>
              France
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Hébergement</h2>
            <p className="text-secondary">
              Ce site est hébergé par Supabase (Supabase Inc.), basé aux États-Unis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Propriété intellectuelle</h2>
            <p className="text-secondary">
              Les textes bibliques proviennent de la Bible Crampon 1923 (domaine public en France).
              Le contenu wiki est soumis à licence libre.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Protection des données personnelles</h2>
            <p className="text-secondary">
              Conformément au RGPD, nous collectons uniquement les données nécessaires au fonctionnement du service
              (email et nom pour l'authentification). Ces données ne sont jamais transmises à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Contact</h2>
            <p className="text-secondary">
              Pour toute question relative à ce site ou à vos données personnelles,
              vous pouvez nous contacter via la page de connexion.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-secondary">
          <p>© 2025 WikiBible - La Bible Catholique (73 livres)</p>
        </div>
      </footer>
    </main>
  );
}
