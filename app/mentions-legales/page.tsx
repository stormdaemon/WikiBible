import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              Ce site est hébergé par Netlify, basé aux États-Unis.
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
    </main>
  );
}
