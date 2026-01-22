import { getLeaderboardAction } from '@/app/actions';
import { createClient } from '@/utils/supabase/server';
import { LeaderboardCard } from '@/components/LeaderboardCard';
import { UserRankCard } from '@/components/UserRankCard';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // 10 minutes

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const result = await getLeaderboardAction(100);

  if (!result.success || !result.leaderboard) {
    return <div className="text-center py-12 text-danger">Erreur lors du chargement du classement</div>;
  }

  // Trouver le rang de l'utilisateur actuel
  const userRank = user ? result.leaderboard.findIndex((entry: any) => entry.user_id === user.id) : -1;
  const userEntry = userRank !== -1 ? result.leaderboard[userRank] : null;

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-primary mb-4">
            🏆 Classement des Contributeurs
          </h1>
          <p className="text-secondary">
            Récompensons ceux qui construisent la Bible communautaire
          </p>
        </div>

        {/* User's Rank */}
        {user && userEntry && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">Votre classement</h2>
            <UserRankCard
              rank={userRank + 1}
              entry={userEntry}
              isCurrentUser={true}
            />
          </div>
        )}

        {/* Top Contributors */}
        <div>
          <h2 className="text-xl font-bold text-primary mb-4">
            Top {result.leaderboard.length} Contributeurs
          </h2>
          <div className="space-y-4">
            {result.leaderboard.map((entry: any, index: number) => (
              <LeaderboardCard
                key={entry.id}
                rank={index + 1}
                entry={entry}
                isCurrentUser={user?.id === entry.user_id}
              />
            ))}
          </div>
        </div>

        {/* Points System Info */}
        <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="text-lg font-bold text-primary mb-4">💎 Système de Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <span className="font-semibold">Renvoi biblique</span>
                <span className="ml-2 text-accent font-bold">+1 pt</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💭</span>
              <div>
                <span className="font-semibold">Commentaire</span>
                <span className="ml-2 text-accent font-bold">+1 pt</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <span className="font-semibold">Référence externe</span>
                <span className="ml-2 text-accent font-bold">+5 pts</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">❤️</span>
              <div>
                <span className="font-semibold">Like reçu</span>
                <span className="ml-2 text-accent font-bold">+1 pt</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✍️</span>
              <div>
                <span className="font-semibold">Traduction verset</span>
                <span className="ml-2 text-accent font-bold">+2 pts</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📖</span>
              <div>
                <span className="font-semibold">Article wiki</span>
                <span className="ml-2 text-accent font-bold">+50 pts</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <span className="font-semibold">Traduction approuvée</span>
                <span className="ml-2 text-accent font-bold">+50 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
