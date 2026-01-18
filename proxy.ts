import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Rafraîchit automatiquement la session si expirée
  // Ceci est CRITIQUE - getUser force le rafraîchissement du token
  const { data: { user } } = await supabase.auth.getUser();

  // Pour la compatibilité, on crée un objet session similaire
  const session = user ? { user } : null;

  // Redirection pour les pages protégées
  if (!session && request.nextUrl.pathname.startsWith('/wiki/new')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    response = NextResponse.redirect(url);
    return response;
  }

  if (!session && request.nextUrl.pathname.match(/^\/wiki\/[^/]+\/edit$/)) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    response = NextResponse.redirect(url);
    return response;
  }

  return response;
}

// Configuration du matcher pour Next.js 16
// Le proxy s'exécute sur toutes les routes SAUF les fichiers statiques
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
