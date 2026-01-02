import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  if (token) {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as 'email' | 'recovery' | 'signup' || 'email',
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url));
      }

      // Redirection vers la page d'accueil après confirmation réussie
      return NextResponse.redirect(new URL('/?verified=true', request.url));
    } catch (error) {
      console.error('Unexpected error during verification:', error);
      return NextResponse.redirect(new URL('/auth/login?error=unexpected_error', request.url));
    }
  }

  // Redirection si pas de token
  return NextResponse.redirect(new URL('/auth/login?error=no_token', request.url));
}
