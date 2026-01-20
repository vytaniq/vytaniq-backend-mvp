import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Health Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user.email}</p>
          </div>
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Google Fit Connected
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* We will populate these cards in the next step */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Activity</h3>
            <p className="text-2xl font-bold mt-2">--</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Sleep</h3>
            <p className="text-2xl font-bold mt-2">--</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Heart Rate</h3>
            <p className="text-2xl font-bold mt-2">--</p>
          </div>
        </div>

        <div className="mt-12 bg-blue-600 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-2">Analyzing your data...</h2>
          <p className="opacity-90">Give us a moment to fetch your latest health metrics from Google.</p>
        </div>
      </div>
    </div>
  );
}