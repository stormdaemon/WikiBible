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
      className={`card p-6 flex items-center gap-6 transition-all ${
        isCurrentUser ? 'border-accent border-2 bg-accent/5' : ''
      }`}
    >
      <div className="text-4xl w-16 text-center">{medal}</div>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl text-primary">
            {entry.user_profiles?.username || 'Anonyme'}
          </h3>
          {isCurrentUser && (
            <span className="badge badge--accent">Vous</span>
          )}
        </div>
        <div className="flex gap-6 mt-2 text-sm text-secondary">
          <span className="flex items-center gap-1">
            <span>📝</span>
            {entry.total_contributions} contributions
          </span>
          <span className="flex items-center gap-1">
            <span>❤️</span>
            {entry.total_likes_received} j'aime reçus
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="text-3xl font-bold text-accent">{entry.total_hearts}</div>
        <div className="text-sm text-secondary">points</div>
      </div>
    </div>
  );
}
