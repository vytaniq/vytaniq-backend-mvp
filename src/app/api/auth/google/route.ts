import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL('/api/auth/callback', request.url));
    }
  }

  // If no code, initiate OAuth flow
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
      scopes: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.sleep.read',
    //   scopes: [
    //     'https://www.googleapis.com/auth/fitness.activity.read',
    //     'https://www.googleapis.com/auth/fitness.body.read',
    //     'https://www.googleapis.com/auth/fitness.sleep.read',
    //   ],
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.json({ error: 'Unable to authenticate' }, { status: 400 });
}
