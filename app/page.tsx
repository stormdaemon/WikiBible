import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">

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

        {/* Donation Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-8 border border-accent/20 shadow-lg">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center shadow-md">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-3">
                Soutenez WikiBible
              </h2>
              <p className="text-secondary mb-6 max-w-xl mx-auto">
                WikiBible est géré par l&apos;association <strong className="text-accent">Parole et Partage</strong>.
                Votre don nous permet de continuer à développer cette plateforme et à partager
                la Parole de Dieu gratuitement.
              </p>
              <a
                href="https://www.paypal.com/paypalme/revelationradio?country.x=FR&locale.x=fr_FR"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.782.782 0 0 1 .771-.644h6.936c3.466 0 5.899 1.478 5.899 4.525 0 3.099-2.346 4.68-5.054 4.68-.857 0-1.664-.178-2.342-.48l-.617 3.768a.641.641 0 0 1-.632.543h-2.827a.641.641 0 0 1-.632-.74l1.37-8.282a.641.641 0 0 1 .632-.543h2.09c.39 0 .732.285.803.675l.027.145a4.256 4.256 0 0 1 1.96-.474c1.995 0 3.345 1.05 3.345 2.85 0 2.2-1.655 3.523-3.345 3.523-.46 0-.88-.11-1.26-.305l-.38 2.308a.641.641 0 0 1-.632.543h-1.685a.641.641 0 0 1-.632-.74l1.228-7.427a.641.641 0 0 1 .632-.543h1.285c.39 0 .732.285.803.675l.027.145c.425-.285.965-.474 1.585-.474 1.145 0 1.92.6 1.92 1.635 0 1.275-.96 2.04-1.92 2.04-.27 0-.52-.06-.75-.165l-.255 1.543a.641.641 0 0 1-.632.543h-1.07a.641.641 0 0 1-.632-.74l.925-5.6a.641.641 0 0 1 .632-.543h.77c.39 0 .732.285.803.675l.027.145c.285-.19.615-.305.975-.305.675 0 1.13.355 1.13.96 0 .75-.57 1.21-1.13 1.21-.16 0-.31-.03-.445-.09l-.17 1.03a.641.641 0 0 1-.632.543h-.765a.641.641 0 0 1-.632-.74l.68-4.12a.641.641 0 0 1 .632-.543h.49c.39 0 .732.285.803.675l.027.145c.18-.12.395-.19.63-.19.36 0 .6.19.6.54 0 .4-.32.64-.6.64-.085 0-.165-.01-.24-.03l-.085.515a.641.641 0 0 1-.632.543h-.46a.641.641 0 0 1-.632-.74l.435-2.64a.641.641 0 0 1 .632-.543h.31c.39 0 .732.285.803.675l.027.145c.095-.06.21-.095.335-.095.18 0 .3.095.3.255 0 .2-.16.32-.3.32-.04 0-.08-.005-.12-.015l-.05.305a.641.641 0 0 1-.632.543h-.23a.641.641 0 0 1-.632-.74l.19-1.155a.641.641 0 0 1 .632-.543h.15c.39 0 .732.285.803.675l.027.145c.01-.005.025-.01.04-.01.06 0 .1.035.1.09 0 .065-.05.105-.1.105-.015 0-.025 0-.035-.005l-.015.09a.641.641 0 0 1-.632.543H9.39a.641.641 0 0 1-.632-.74l.345-2.09a.641.641 0 0 1 .632-.543h.245c.39 0 .732.285.803.675l.027.145c.155-.105.345-.165.545-.165.28 0 .465.145.465.36 0 .245-.19.39-.465.39-.065 0-.13-.01-.19-.03l-.09.545a.641.641 0 0 1-.632.543h-.245a.641.641 0 0 1-.632-.74l.265-1.605a.641.641 0 0 1 .632-.543h.19c.39 0 .732.285.803.675l.027.145c.115-.08.255-.125.405-.125.205 0 .345.11.345.27 0 .18-.15.29-.345.29-.045 0-.09-.005-.13-.015l-.065.395a.641.641 0 0 1-.632.543h-.19a.641.641 0 0 1-.632-.74l.19-1.15a.641.641 0 0 1 .632-.543h.145c.39 0 .732.285.803.675l.027.145c.075-.05.165-.08.26-.08.135 0 .225.07.225.17 0 .115-.095.185-.225.185-.03 0-.06-.005-.09-.015l-.035.21a.641.641 0 0 1-.632.543h-.145a.641.641 0 0 1-.632-.74l.115-.695a.641.641 0 0 1 .632-.543h.1c.39 0 .732.285.803.675l.027.145c.035-.025.08-.04.125-.04.045 0 .075.025.075.06 0 .04-.035.065-.075.065-.01 0-.02-.005-.03-.01l-.015.095a.641.641 0 0 1-.632.543h-.1a.641.641 0 0 1-.632-.74l.04-.245a.641.641 0 0 1 .632-.543h.055c.39 0 .732.285.803.675l.027.145c.01-.005.02-.01.035-.01.015 0 .025.01.025.02 0 .015-.015.025-.025.025-.005 0-.01 0-.015-.005l-.005.03a.641.641 0 0 1-.632.543h-.055a.641.641 0 0 1-.632-.74l.01-.065a.641.641 0 0 1 .632-.543h.01c.39 0 .732.285.803.675l.027.145c.002-.002.006-.003.01-.003.005 0 .008.005.008.01 0 .005-.004.01-.008.01-.002 0-.004 0-.006-.002l-.002.01a.641.641 0 0 1-.632.543h-.01a.641.641 0 0 1-.632-.74z"/>
                </svg>
                Faire un don
              </a>
              <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Paiement sécurisé via PayPal
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link href="/bible" className="card block hover:border-accent transition-colors">
            <div className="p-6">
              <div className="w-12 h-12 bg-accent-soft text-accent flex items-center justify-center rounded-md mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
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
