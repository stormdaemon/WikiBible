interface UserRankCardProps {
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
      full_name: string | null;
      confession: string | null;
    } | null;
  };
  isCurrentUser?: boolean;
}

export function UserRankCard({ rank, entry, isCurrentUser = false }: UserRankCardProps) {
  const medals = ['🥇', '🥈', '🥉'];
  const medal = rank <= 3 ? medals[rank - 1] : `#${rank}`;

  return (
    <div
      className={`card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 transition-all ${
        isCurrentUser ? 'border-accent border-2 bg-accent/5' : ''
      }`}
    >
      <div className="text-3xl sm:text-4xl w-16 text-center">{medal}</div>

      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <h3 className="font-bold text-lg sm:text-xl text-primary">
            {entry.user_profiles?.full_name || entry.user_profiles?.username || 'Anonyme'}
          </h3>
          {isCurrentUser && (
            <span className="badge badge--accent text-xs sm:text-sm">Vous</span>
          )}
        </div>
        <div className="flex gap-4 sm:gap-6 mt-2 text-xs sm:text-sm text-secondary">
          <span className="flex items-center gap-1">
            <span>📝</span>
            {entry.total_contributions} contrib.
          </span>
          <span className="flex items-center gap-1">
            <span>❤️</span>
            {entry.total_likes_received} j'aime
          </span>
        </div>
      </div>

      <div className="text-right w-full sm:w-auto flex sm:block justify-between sm:justify-start items-center gap-2">
        <div className="text-2xl sm:text-3xl font-bold text-accent">{entry.total_hearts}</div>
        <div className="text-sm text-secondary">points</div>
      </div>
    </div>
  );
}
