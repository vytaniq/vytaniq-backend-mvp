// 'use client';

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
//       <main className="flex flex-col items-center justify-center gap-8 text-center px-6">
//         <div className="space-y-4">
//           <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
//             Vytaniq
//           </h1>
//           <p className="text-xl text-slate-600 dark:text-slate-300">
//             Your Health, Understood
//           </p>
//           <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
//             Connect your Google Fit account to get personalized daily health summaries. We compare your recent data against your personal baseline and explain what has changed in simple terms.
//           </p>
//         </div>        
//         <a href="/api/auth/google"
//           className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
//         >
//           Connect Google Fit
//         </a>
//       </main>
//     </div>
//   );
// }


'use client';

import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const supabase = createClient();

  // const handleLogin = async () => {
  //   await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: {
  //       // This line is the magic fix: it uses your Vercel URL when live
  //       redirectTo: `${window.location.origin}/api/auth/callback`,
  //       queryParams: {
  //         access_type: 'offline',
  //         prompt: 'consent',
  //         // Health Scopes
  //         scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.sleep.read'
  //       },
  //     },
  //   });
  // };
//   const handleLogin = async () => {
//   await supabase.auth.signInWithOAuth({
//     provider: 'google',
//     options: {
//       redirectTo: `${window.location.origin}/api/auth/callback`,
//       queryParams: {
//         access_type: 'offline',
//         prompt: 'consent',
//         // CRITICAL: We must add the first two scopes for Supabase to work
//         scope: 'https://www.googleapis.com/auth/userinfo.email ' + 
//                'https://www.googleapis.com/auth/userinfo.profile ' + 
//                'https://www.googleapis.com/auth/fitness.activity.read ' + 
//                'https://www.googleapis.com/auth/fitness.body.read'
//       },
//     },
//   });
// };
// Inside app/page.tsx
const handleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
      queryParams: {
        access_type: 'offline', // Requests the refresh token
        prompt: 'consent',     // FORCES Google to show the screen you just saw again
      },
    },
  });
};
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <main className="flex flex-col items-center justify-center gap-8 text-center px-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vytaniq
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Your Health, Understood
          </p>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Connect your Google Fit account to get personalized daily health summaries.
          </p>
        </div>        
        
        {/* Changed from <a> tag to <button> with handleLogin */}
        <button
          onClick={handleLogin}
          className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Connect Google Fit
        </button>
      </main>
    </div>
  );
}