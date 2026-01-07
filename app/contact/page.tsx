import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ContactForm } from '@/components/contact-form';

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nous contacter
          </h1>
          <p className="text-lg text-gray-600">
            Une question, une suggestion ou un bug à signaler ? Nous serions ravis de vous aider !
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Avant de nous contacter...</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Consultez notre <Link href="/wiki" className="underline hover:text-blue-600">documentation</Link> pour des guides détaillés</li>
                <li>• Recherchez dans les <Link href="/wiki" className="underline hover:text-blue-600">articles existants</Link> pour des réponses courantes</li>
                <li>• Décrivez votre problème avec le plus de détails possible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyer un message</h2>

          {user ? (
            <ContactForm userEmail={user.email!} userName={user.user_metadata?.name || ''} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Vous devez être connecté pour nous envoyer un message.
              </p>
              <Link
                href="/auth/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>

        {/* Alternative contact */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Pour les urgences, vous pouvez aussi nous contacter directement à :</p>
          <a href="mailto:contact@wikibible.dev" className="text-blue-600 hover:underline font-medium">
            contact@wikibible.dev
          </a>
        </div>
      </div>
    </main>
  );
}
