// import { createClient } from '@/utils/supabase/server';
// import { NextResponse } from 'next/server';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const code = searchParams.get('code');
//   const error = searchParams.get('error');
//   const errorDescription = searchParams.get('error_description');

//   if (error) {
//     return NextResponse.json(
//       { error: errorDescription || error },
//       { status: 400 }
//     );
//   }

//   if (!code) {
//     return NextResponse.json(
//       { error: 'No authorization code provided' },
//       { status: 400 }
//     );
//   }

//   const supabase = await createClient();

//   // Exchange code for session
//   const { data: sessionData, error: sessionError } =
//     await supabase.auth.exchangeCodeForSession(code);

//   if (sessionError || !sessionData.user) {
//     return NextResponse.json(
//       { error: sessionError?.message || 'Failed to exchange code for session' },
//       { status: 400 }
//     );
//   }

//   const user = sessionData.user;

//   // Get the provider refresh token from the session
//   const providerRefreshToken =
//     sessionData.session?.provider_refresh_token || null;

//   // Check if profile exists
//   const { data: existingProfile } = await supabase
//     .from('profiles')
//     .select('id')
//     .eq('id', user.id)
//     .single();

//   if (!existingProfile) {
//     // Create profile if it doesn't exist
//     const { error: profileError } = await supabase.from('profiles').insert({
//       id: user.id,
//       email: user.email,
//       google_fit_refresh_token: providerRefreshToken,
//       created_at: new Date().toISOString(),
//     });

//     if (profileError) {
//       console.error('Error creating profile:', profileError);
//       return NextResponse.json(
//         { error: 'Failed to create user profile' },
//         { status: 500 }
//       );
//     }
//   } else if (providerRefreshToken) {
//     // Update refresh token if it exists
//     const { error: updateError } = await supabase
//       .from('profiles')
//       .update({
//         google_fit_refresh_token: providerRefreshToken,
//       })
//       .eq('id', user.id);

//     if (updateError) {
//       console.error('Error updating refresh token:', updateError);
//     }
//   }

//   // Redirect to dashboard
//   return NextResponse.redirect(new URL('/dashboard', request.url));
// }


// import { createClient } from '@/utils/supabase/server';
// import { NextResponse } from 'next/server';

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get('code');
//   // If "next" is in the params, use it, otherwise go to dashboard
//   const next = searchParams.get('next') ?? '/dashboard';

//   if (code) {
//     const supabase = await createClient();
//     const { error } = await supabase.auth.exchangeCodeForSession(code);
    
//     if (!error) {
//       // Use 'origin' to ensure we stay on the same domain (Vercel)
//       return NextResponse.redirect(`${origin}${next}`);
//     }
//   }

//   // Return the user to an error page or home if it fails
//   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
// }


import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Directs the user to the dashboard once session is saved
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // If error or no code, return to landing page
  return NextResponse.redirect(`${origin}`);
}