interface LeaderboardCardProps {
  rank: number;
  entry: {
    id: string;
    user_id: string;
    total_hearts: number;
    total_contributions: number;
    total_likes_received: number;
    rank: number | null;
    user_profiles?: {
      username: string | null;
      confession: string | null;
    } | null;
  };
  isCurrentUser?: boolean;
}

export function LeaderboardCard({ rank, entry, isCurrentUser = false }: LeaderboardCardProps) {
  const medals = ['🥇', '🥈', '🥉'];
  const medal = rank <= 3 ? medals[rank - 1] : `#${rank}`;

  return (
    <div
      className={`card p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all ${
        isCurrentUser ? 'border-accent border-2 bg-accent/5' : ''
      }`}
    >
      <div className="text-xl sm:text-2xl w-12 text-center">{medal}</div>

      <div className="flex-1 w-full">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base sm:text-lg text-primary">
            {entry.user_profiles?.username || 'Anonyme'}
          </h3>
          {isCurrentUser && (
            <span className="badge badge--accent text-xs">Vous</span>
          )}
        </div>
        <div className="flex gap-3 sm:gap-4 mt-1 text-xs sm:text-sm text-secondary">
          <span>{entry.total_contributions} contrib.</span>
          <span>{entry.total_likes_received} j'aime</span>
        </div>
      </div>

      <div className="text-right w-full sm:w-auto flex sm:block justify-between sm:justify-start items-center gap-2">
        <div className="text-xl sm:text-2xl font-bold text-primary">{entry.total_hearts}</div>
        <div className="text-xs text-secondary">points</div>
      </div>
    </div>
  );
}
