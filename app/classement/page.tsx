import { getLeaderboardAction } from '@/app/actions';
import Link from 'next/link';

export default async function LeaderboardPage() {
  const result = await getLeaderboardAction(100);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-red-600">Erreur lors du chargement du classement</p>
          </div>
        </div>
      </div>
    );
  }

  const leaderboard = result.leaderboard || [];

  // Podium : top 3
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Médailes pour le podium
  const medals = [
    { rank: 1, emoji: '🥇', color: 'from-yellow-400 to-yellow-500', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { rank: 2, emoji: '🥈', color: 'from-slate-300 to-slate-400', textColor: 'text-slate-600', bgColor: 'bg-slate-50' },
    { rank: 3, emoji: '🥉', color: 'from-orange-400 to-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">🏆 Classement des contributeurs</h1>
              <p className="text-white/90 text-lg">Les plus grands contributeurs de WikiBible</p>
            </div>
          </div>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {top3.map((entry, index) => {
              const medal = medals[index];
              const username = entry.user?.raw_user_meta_data?.username || 'Anonyme';
              const hearts = entry.total_hearts || 0;

              return (
                <div
                  key={entry.id}
                  className={`bg-gradient-to-br ${medal.color} rounded-2xl shadow-xl p-8 text-white transform hover:scale-105 transition-all`}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">{medal.emoji}</div>
                    <h3 className="text-2xl font-bold mb-2">{username}</h3>
                    <p className="text-5xl font-bold mb-2">{hearts.toLocaleString()}</p>
                    <p className="text-white/90">cœurs</p>
                    <div className="mt-4 text-sm text-white/80">
                      {entry.total_contributions} contributions • {entry.total_likes_received} likes
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reste du classement */}
        {rest.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Top 100</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Rang</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Contributeur</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Cœurs</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Contributions</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Likes reçus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rest.map((entry, index) => {
                    const rank = index + 4; // Commence à 4
                    const username = entry.user?.raw_user_meta_data?.username || 'Anonyme';
                    const hearts = entry.total_hearts || 0;

                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                            {rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-800">{username}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-red-600">
                            <span>❤️</span>
                            <span>{hearts.toLocaleString()}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-600">
                          {entry.total_contributions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-600">
                          {entry.total_likes_received.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Si pas de classement */}
        {leaderboard.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <span className="text-6xl mb-4 block">📊</span>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Aucun classement pour le moment</h2>
            <p className="text-slate-600 mb-6">Soyez le premier à contribuer et apparaître dans le classement !</p>
            <Link
              href="/bible"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md font-semibold"
            >
              <span>📖</span>
              <span>Commencer à contribuer</span>
            </Link>
          </div>
        )}

        {/* Lien vers le dashboard */}
        <div className="text-center">
          <Link
            href="/profil/dashboard"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <span>←</span>
            <span>Retour à mon dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
