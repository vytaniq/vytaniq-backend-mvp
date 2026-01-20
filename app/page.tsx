'use client';

export default function Home() {
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
            Connect your Google Fit account to get personalized daily health summaries. We compare your recent data against your personal baseline and explain what has changed in simple terms.
          </p>
        </div>        
        <a href="/api/auth/google"
          className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Connect Google Fit
        </a>
      </main>
    </div>
  );
}
