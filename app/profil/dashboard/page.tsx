import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getUserDashboardAction } from '@/app/actions';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Récupérer les données du dashboard
  const result = await getUserDashboardAction(user.id);

  if (!result.success || !result.score) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-red-600">Erreur lors du chargement du dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  const { score, badges, breakdown } = result;

  // Calculer les badges manquants pour l'affichage
  const badgeTypes = [
    { type: 'first_contribution', icon: '🌱', title: 'Première contribution', description: 'Avoir créé votre première contribution' },
    { type: 'ten_contributions', icon: '📝', title: 'Dix contributions', description: 'Avoir créé 10 contributions' },
    { type: 'hundred_hearts', icon: '💝', title: '100 cœurs', description: 'Avoir atteint 100 cœurs' },
    { type: 'thousand_hearts', icon: '💖', title: '1000 cœurs', description: 'Avoir atteint 1000 cœurs' },
    { type: 'top_ten', icon: '🏆', title: 'Top 10', description: 'Être dans le top 10 du classement' },
    { type: 'first_like', icon: '❤️', title: 'Premier like', description: 'Avoir reçu votre premier like' },
  ];

  const earnedBadges = new Set(badges.map(b => b.badge_type));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Mon Dashboard</h1>
            <p className="text-white/80 mt-1">Suivez votre progression et vos accomplissements</p>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cœurs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Cœurs</h2>
              <span className="text-4xl">❤️</span>
            </div>
            <p className="text-4xl font-bold text-red-600">{score.total_hearts.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-2">Contributions × Likes reçus</p>
          </div>

          {/* Contributions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Contributions</h2>
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-4xl font-bold text-blue-600">{score.total_contributions.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-2">Total de vos contributions</p>
          </div>

          {/* Likes reçus */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Likes reçus</h2>
              <span className="text-4xl">👍</span>
            </div>
            <p className="text-4xl font-bold text-green-600">{score.total_likes_received.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-2">Total des likes sur vos contributions</p>
          </div>
        </div>

        {/* Classement */}
        {score.rank && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Votre classement</h2>
                <p className="text-white/90">Vous êtes parmi les meilleurs contributeurs</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold">#{score.rank}</p>
              </div>
            </div>
          </div>
        )}

        {/* Détail des contributions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Répartition des contributions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-3xl font-bold text-purple-600">{breakdown.links}</p>
              <p className="text-sm text-purple-700 mt-1">Renvois bibliques</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-blue-600">{breakdown.annotations}</p>
              <p className="text-sm text-blue-700 mt-1">Annotations</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-3xl font-bold text-green-600">{breakdown.external_sources}</p>
              <p className="text-sm text-green-700 mt-1">Sources externes</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-3xl font-bold text-orange-600">{breakdown.wiki_articles}</p>
              <p className="text-sm text-orange-700 mt-1">Articles wiki</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badgeTypes.map((badge) => {
              const isEarned = earnedBadges.has(badge.type);
              const earnedBadge = badges.find(b => b.badge_type === badge.type);
              const earnedDate = earnedBadge ? new Date(earnedBadge.earned_at).toLocaleDateString('fr-FR') : null;

              return (
                <div
                  key={badge.type}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isEarned
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-4xl ${isEarned ? '' : 'grayscale'}`}>
                      {badge.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className={`font-bold ${isEarned ? 'text-slate-800' : 'text-slate-500'}`}>
                        {badge.title}
                      </h3>
                      <p className={`text-sm mt-1 ${isEarned ? 'text-slate-600' : 'text-slate-400'}`}>
                        {badge.description}
                      </p>
                      {earnedDate && (
                        <p className="text-xs text-yellow-600 mt-2 font-semibold">
                          Gagné le {earnedDate}
                        </p>
                      )}
                    </div>
                    {isEarned && (
                      <span className="text-green-500 text-xl">✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {badges.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-lg mb-2">Aucun badge pour le moment</p>
              <p className="text-sm">Commencez à contribuer pour gagner vos premiers badges !</p>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/classement"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <span className="text-3xl">🏆</span>
              <div>
                <p className="font-bold">Voir le classement</p>
                <p className="text-sm text-white/80">Découvrez les meilleurs contributeurs</p>
              </div>
            </Link>
            <Link
              href="/bible"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <span className="text-3xl">📖</span>
              <div>
                <p className="font-bold">Contribuer</p>
                <p className="text-sm text-white/80">Ajoutez des renvois et annotations</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
