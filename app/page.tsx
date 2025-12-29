import Link from 'next/link';
import { Header } from '@/components/Header';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 flex-1">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-primary mb-4">
            WikiBible
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            La Bible Catholique complète (73 livres) et l&apos;encyclopédie catholique collaborative
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <Link href="/bible" className="btn btn--primary">
            Explorer la Bible
          </Link>
          <Link href="/wiki" className="btn btn--secondary">
            Accéder au Wiki
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link href="/bible" className="card block hover:border-accent transition-colors">
            <div className="p-6">
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
          </Link>

          <Link href="/wiki" className="card block hover:border-accent transition-colors">
            <div className="p-6">
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
          </Link>

          <Link href="/auth/register" className="card block hover:border-accent transition-colors">
            <div className="p-6">
              <div className="w-12 h-12 bg-accent-soft text-accent flex items-center justify-center rounded-md mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-primary mb-2">
                Rejoignez la communauté
              </h3>
              <p className="text-sm text-secondary">
                Créez un compte pour contribuer au wiki et partager la Parole
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Bible Preview */}
      <section className="bg-surface border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">Canon Biblique</h2>
            <p className="text-secondary">73 livres de la Bible Catholique</p>
          </div>
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
          <div className="text-center mt-8">
            <Link href="/bible" className="btn btn--accent">
              Explorer la Bible →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-primary mb-4">WikiBible</h3>
              <p className="text-sm text-secondary">La Parole de Dieu accessible à tous.</p>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/bible" className="text-secondary hover:text-accent">Bible</Link></li>
                <li><Link href="/wiki" className="text-secondary hover:text-accent">Wiki</Link></li>
                <li><Link href="/auth/login" className="text-secondary hover:text-accent">Connexion</Link></li>
                <li><Link href="/auth/register" className="text-secondary hover:text-accent">Inscription</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/mentions-legales" className="text-secondary hover:text-accent">Mentions légales</Link></li>
                <li><Link href="https://annuaire-entreprises.data.gouv.fr/entreprise/parole-et-partage-841890692" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent">Données entreprise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="text-secondary hover:text-accent">Se connecter</Link></li>
                <li><Link href="/auth/register" className="text-secondary hover:text-accent">Créer un compte</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-secondary">
            <p>© 2025 WikiBible - La Bible Catholique (73 livres)</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
