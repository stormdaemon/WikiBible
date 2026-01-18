/**
 * Client Supabase spécialement conçu pour les Server Actions Next.js 16
 *
 * PROBLÈME: Dans Next.js 16, les Server Actions ne passent pas par le proxy.ts,
 * donc les cookies de session ne sont pas automatiquement rafraîchis.
 *
 * SOLUTION: Utiliser createClient() avec cookies() pour avoir accès aux cookies
 * de la requête actuelle, et FORCER le rafraîchissement avec getUser().
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Crée un client Supabase pour les Server Actions avec rafraîchissement automatique
 *
 * IMPORTANT: Toujours appeler supabase.auth.getUser() avant toute opération
 * pour s'assurer que la session est à jour.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorer les erreurs dans Server Actions
            // Les cookies seront mis à jour via le proxy.ts lors des prochaines requêtes HTTP
          }
        },
      },
    }
  );

  // FORCER le rafraîchissement de la session
  // Ceci est CRITIQUE pour que auth.uid() fonctionne correctement
  await supabase.auth.getUser();

  return supabase;
}

/**
 * Raccourci pour créer un client et récupérer l'utilisateur en un seul appel
 * Évite d'oublier d'appeler getUser()
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
