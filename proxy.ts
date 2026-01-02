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
  // Ceci est CRITIQUE - doit toujours être appelé
  const { data: { session } } = await supabase.auth.getSession();

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
