'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { syncHealthData } from '@/app/actions/sync-health';

interface HealthMetrics {
  step_count: number | null;
  heart_rate: number | null;
  sleep_duration: number | null;
  measured_at: string;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        fetchLatestMetrics(data.user.id);
      }
    });
  }, []);

  const fetchLatestMetrics = async (userId: string) => {
    const supabase = createClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncHealthData();
      if (result.success && user) {
        await fetchLatestMetrics(user.id);
      } else {
        alert(result.error || 'Failed to sync data');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      alert('An error occurred while syncing data');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Health Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back! Here's your daily health summary.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Today's Metrics
            </h2>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {syncing ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>

          {loading ? (
            <p className="text-center text-slate-500">Loading metrics...</p>
          ) : metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Steps
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics.step_count ?? '--'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-lg p-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Heart Rate
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {metrics.heart_rate ? `${metrics.heart_rate} bpm` : '--'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Sleep
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {metrics.sleep_duration ? `${metrics.sleep_duration}h` : '--'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No data synced yet
              </p>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {syncing ? 'Syncing...' : 'Sync Your First Data'}
              </button>
            </div>
          )}

          {metrics && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 text-center">
              Last updated: {new Date(metrics.measured_at).toLocaleString()}
            </p>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
