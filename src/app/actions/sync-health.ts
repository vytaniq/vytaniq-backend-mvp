'use server';

import { createClient } from '@/utils/supabase/server';
import { google } from 'googleapis';

export async function syncHealthData() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Fetch refresh token from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_fit_refresh_token')
      .eq('id', user.id)
      .single();

    if (!profile?.google_fit_refresh_token) {
      return { error: 'No Google Fit refresh token found' };
    }

    // Setup Google Auth
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: profile.google_fit_refresh_token,
    });

    // Calculate time range (last 24 hours)
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000;

    const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

    let stepCount = 0;
    let sleepDuration = 0;

    // Fetch steps data
    try {
      const stepsRes = await fitness.users.dataset.aggregate({
        userId: 'me',
        requestBody: {
          aggregateBy: [
            {
              dataSourceId:
                'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
            },
          ],
          bucketByTime: { durationMillis: (24 * 60 * 60 * 1000).toString() },
          startTimeMillis: startTime.toString(),
          endTimeMillis: endTime.toString(),
        },
      });

      if (stepsRes.data.bucket?.[0]?.dataset?.[0]?.point?.[0]) {
        stepCount =
          stepsRes.data.bucket[0].dataset[0].point[0].value?.[0]?.intVal || 0;
      }
    } catch (stepsError: any) {
      console.warn(
        'Failed to fetch steps:',
        stepsError.message || stepsError
      );
    }

    // Fetch sleep data
    try {
      const sleepRes = await fitness.users.dataset.aggregate({
        userId: 'me',
        requestBody: {
          aggregateBy: [
            {
              dataSourceId: 'derived:com.google.sleep.segment:com.google.android.gms:sleep_segment',
            },
          ],
          bucketByTime: { durationMillis: (24 * 60 * 60 * 1000).toString() },
          startTimeMillis: startTime.toString(),
          endTimeMillis: endTime.toString(),
        },
      });

      if (sleepRes.data.bucket?.[0]?.dataset?.[0]?.point) {
        const points = sleepRes.data.bucket[0].dataset[0].point;
        let totalSleepMs = 0;

        points.forEach((point: any) => {
          const startTimeNanos = parseInt(point.startTimeNanos);
          const endTimeNanos = parseInt(point.endTimeNanos);
          totalSleepMs += (endTimeNanos - startTimeNanos) / 1000000; // Convert to ms
        });

        sleepDuration = Math.round((totalSleepMs / 1000 / 60 / 60) * 10) / 10;
      }
    } catch (sleepError: any) {
      console.warn(
        'Failed to fetch sleep:',
        sleepError.message || sleepError
      );
    }

    // Save to health_metrics table
    const { error: saveError } = await supabase
      .from('health_metrics')
      .insert({
        user_id: user.id,
      });

    if (saveError) {
      console.error('Error saving health metrics:', saveError);
      return { error: 'Failed to save health metrics' };
    }

    return {
      success: true,
      data: {
        stepCount,
        sleepDuration,
      },
    };
  } catch (error) {
    console.error('Error syncing health data:', error);
    return { error: 'An error occurred while syncing data' };
  }
}
