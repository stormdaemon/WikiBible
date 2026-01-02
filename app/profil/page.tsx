import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileSettings } from './ProfileSettings';

export default async function ProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Récupérer le profil
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
            <p className="text-white/80 mt-1">Gérez vos préférences théologiques</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <ProfileSettings profile={profile} userId={user.id} email={user.email || ''} />
          </div>
        </div>
      </div>
    </div>
  );
}
