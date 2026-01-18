import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client public simple pour les requêtes sans authentification (lecture publique)
export const createPublicClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey);
};

// Client SSR avec gestion des cookies pour les utilisateurs authentifiés
// NOTE: Ce client est conçu pour les Server Components
// Pour les Server Actions, utilisez le fichier server-action.ts
export const createClient = async () => {
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // FORCER le rafraîchissement de la session pour Server Components
  // Ceci assure que auth.uid() fonctionne correctement
  await supabase.auth.getUser();

  return supabase;
};
