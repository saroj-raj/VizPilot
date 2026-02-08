import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`
    );
  }

  // Exchange code for session
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Session exchange error:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    // Redirect to onboarding after successful auth
    return NextResponse.redirect(`${requestUrl.origin}/onboarding/upload`);
  }

  // No code or error, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
