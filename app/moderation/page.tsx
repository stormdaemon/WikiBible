import { getPendingContributionsAction, isModeratorAction } from '@/app/actions';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ModerationDashboard } from '@/components/ModerationDashboard';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/moderation');
  }

  // Vérifier si l'utilisateur est modérateur
  const moderatorCheck = await isModeratorAction();

  if (!moderatorCheck.success || !moderatorCheck.isModerator) {
    redirect('/?error=not_moderator');
  }

  // Récupérer les contributions en attente
  const contributionsResult = await getPendingContributionsAction();

  if (!contributionsResult.success) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8">Modération</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{contributionsResult.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const contributions = contributionsResult.contributions || [];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-primary mb-2">
            Modération des Traductions
          </h1>
          <p className="text-secondary">
            Validez ou rejetez les traductions communautaires en attente
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Contributions en attente</p>
              <p className="text-3xl font-bold text-primary">{contributions.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-secondary">Votre rôle</p>
              <p className="text-lg font-semibold text-accent">Modérateur</p>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <ModerationDashboard contributions={contributions} />
      </div>
    </main>
  );
}
