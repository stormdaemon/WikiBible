export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">WikiBible</span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium text-secondary hover:text-primary">Bible</a>
            <a href="#" className="text-sm font-medium text-secondary hover:text-primary">Wiki</a>
            <a href="#" className="text-sm font-medium text-secondary hover:text-primary">À propos</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-primary mb-4">
            WikiBible
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            La Bible Catholique complète (73 livres) et l'encyclopédie catholique collaborative
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
            <div className="w-12 h-12 bg-accent-soft text-accent flex items-center justify-center rounded-md mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-primary mb-2">
              Canon Catholique Complet
            </h3>
            <p className="text-sm text-secondary">
              Les 73 livres de la Bible Catholique, incluant les livres deutérocanoniques
            </p>
          </div>

          <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
            <div className="w-12 h-12 bg-accent-soft text-accent flex items-center justify-center rounded-md mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-primary mb-2">
              Wiki Collaboratif
            </h3>
            <p className="text-sm text-secondary">
              Articles encyclopédiques avec historique des révisions et sources bibliques
            </p>
          </div>

          <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
            <div className="w-12 h-12 bg-accent-soft text-accent flex items-center justify-center rounded-md mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M7 8h10"/>
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-primary mb-2">
              Navigation Intuitive
            </h3>
            <p className="text-sm text-secondary">
              Liens automatiques vers les versets bibliques dans les articles
            </p>
          </div>
        </div>
      </section>

      {/* Bible Preview */}
      <section className="bg-surface border-t border-border border-b py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-primary mb-6">Canon Biblique</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-accent uppercase">Ancien Testament</h3>
              <p className="text-xs text-secondary">46 livres</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-accent uppercase">Pentateuque</h3>
              <p className="text-xs text-secondary">Genèse, Exode, Lévitique, Nombres, Deutéronome</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-accent uppercase">Livres Historiques</h3>
              <p className="text-xs text-secondary">Josué, Juges, Ruth, 1-4 Rois, 1-2 Chroniques, Esdras, Néhémie, Tobie, Judith, Esther, 1-2 Maccabées</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-accent uppercase">Nouveau Testament</h3>
              <p className="text-xs text-secondary">27 livres</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-sm text-secondary">
          <p>WikiBible - La Bible Catholique (73 livres)</p>
          <p className="mt-2">Powered by Next.js 16.1, React 19.2, Tailwind v4, Supabase</p>
        </div>
      </footer>
    </main>
  );
}
