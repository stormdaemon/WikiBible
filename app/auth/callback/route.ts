import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();

    try {
      // Pour signup avec PKCE, on doit utiliser verifyOtp avec token_hash
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        console.error('Token hash:', token_hash);
        console.error('Type:', type);
        return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url));
      }

      console.log('Verification successful!', data);

      // Redirection vers la page d'accueil après confirmation réussie
      return NextResponse.redirect(new URL('/auth/login?verified=true', request.url));
    } catch (error) {
      console.error('Unexpected error during verification:', error);
      return NextResponse.redirect(new URL('/auth/login?error=unexpected_error', request.url));
    }
  }

  // Redirection si pas de token_hash
  console.log('No token_hash or type in URL');
  return NextResponse.redirect(new URL('/auth/login?error=no_token', request.url));
}
