// 'use server';

// import { createClient } from '@/utils/supabase/server';
// import { OAuth2Client } from 'google-auth-library';

// export async function syncHealthData() {
//   try {
//     const supabase = await createClient();

//     // Get current user
//     const {
//       data: { user },
//       error: userError,
//     } = await supabase.auth.getUser();

//     if (userError || !user) {
//       return { error: 'User not authenticated' };
//     }

//     // Fetch refresh token from profiles table
//     const { data: profile, error: profileError } = await supabase
//       .from('profiles')
//       .select('google_fit_refresh_token')
//       .eq('id', user.id)
//       .single();

//     if (profileError || !profile?.google_fit_refresh_token) {
//       return { error: 'No Google Fit refresh token found' };
//     }

//     // Create OAuth2Client and refresh access token
//     const oauth2Client = new OAuth2Client(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_CLIENT_SECRET,
//       process.env.GOOGLE_REDIRECT_URI
//     );

//     oauth2Client.setCredentials({
//       refresh_token: profile.google_fit_refresh_token,
//     });

//     const { credentials } = await oauth2Client.refreshAccessToken();
//     const accessToken = credentials.access_token;

//     if (!accessToken) {
//       return { error: 'Failed to refresh access token' };
//     }

//     // Calculate date range (last 24 hours)
//     const now = new Date();
//     const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

//     const startTimeMillis = yesterday.getTime();
//     const endTimeMillis = now.getTime();

//     // Fetch aggregated data from Google Fit
//     const aggregateUrl =
//       'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';

//     const aggregateBody = {
//       aggregateBy: [
//         {
//           dataTypeName: 'com.google.step_count.delta',
//         },
//         {
//           dataTypeName: 'com.google.heart_rate.bpm',
//           dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
//         },
//         {
//           dataTypeName: 'com.google.sleep.segment',
//         },
//       ],
//       bucketByTime: { durationMillis: 86400000 }, // 24 hours
//       startTimeMillis,
//       endTimeMillis,
//     };

//     const response = await fetch(aggregateUrl, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(aggregateBody),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('Google Fit API error:', errorData);
//       return { error: 'Failed to fetch Google Fit data' };
//     }

//     const fitData = await response.json();

//     // Parse the aggregated data
//     let stepCount = 0;
//     let heartRate = 0;
//     let sleepDuration = 0;

//     if (fitData.bucket && fitData.bucket.length > 0) {
//       const bucket = fitData.bucket[0];

//       // Extract step count
//       const stepDataset = bucket.dataset?.find(
//         (ds: any) => ds.dataSourceId?.includes('step_count') || ds.dataSourceId?.includes('com.google.step_count')
//       );
//       if (stepDataset?.point?.[0]?.value?.[0]?.intVal) {
//         stepCount = stepDataset.point[0].value[0].intVal;
//       }

//       // Extract heart rate
//       const heartRateDataset = bucket.dataset?.find(
//         (ds: any) => ds.dataSourceId?.includes('heart_rate')
//       );
//       if (heartRateDataset?.point?.[0]?.value?.[0]?.fpVal) {
//         heartRate = Math.round(heartRateDataset.point[0].value[0].fpVal);
//       }

//       // Extract sleep duration
//       const sleepDataset = bucket.dataset?.find(
//         (ds: any) => ds.dataSourceId?.includes('sleep')
//       );
//       if (sleepDataset?.point && sleepDataset.point.length > 0) {
//         // Calculate total sleep from sleep segments
//         sleepDuration = sleepDataset.point.reduce((total: number, point: any) => {
//           const startTime = parseInt(point.startTimeNanos) / 1000000;
//           const endTime = parseInt(point.endTimeNanos) / 1000000;
//           return total + (endTime - startTime);
//         }, 0);
//         // Convert milliseconds to hours
//         sleepDuration = Math.round((sleepDuration / 1000 / 60 / 60) * 10) / 10;
//       }
//     }

//     // Save to health_metrics table
//     const { error: saveError } = await supabase
//       .from('health_metrics')
//       .insert({
//         user_id: user.id,
//         step_count: stepCount,
//         heart_rate: heartRate || null,
//         sleep_duration: sleepDuration || null,
//         measured_at: new Date().toISOString(),
//       });

//     if (saveError) {
//       console.error('Error saving health metrics:', saveError);
//       return { error: 'Failed to save health metrics' };
//     }

//     return {
//       success: true,
//       data: {
//         stepCount,
//         heartRate,
//         sleepDuration,
//       },
//     };
//   } catch (error) {
//     console.error('Error syncing health data:', error);
//     return { error: 'An error occurred while syncing data' };
//   }
// }

// 'use server';

// import { createClient } from '@/utils/supabase/server';
// import { google } from 'googleapis';

// export async function syncHealthData() {
//   try {
//     const supabase = await createClient();

//     // Get current user
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       return { error: 'User not authenticated' };
//     }

//     // Fetch refresh token from profiles table
//     const { data: profile } = await supabase
//       .from('profiles')
//       .select('google_fit_refresh_token')
//       .eq('id', user.id)
//       .single();

//     if (!profile?.google_fit_refresh_token) {
//       return { error: 'No Google Fit refresh token found' };
//     }

//     // Setup Google Auth
//     const oauth2Client = new google.auth.OAuth2(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_CLIENT_SECRET,
//       process.env.GOOGLE_REDIRECT_URI
//     );

//     oauth2Client.setCredentials({
//       refresh_token: profile.google_fit_refresh_token,
//     });

//     // Calculate time range (last 24 hours)
//     const endTime = Date.now();
//     const startTime = endTime - 24 * 60 * 60 * 1000;

//     const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

//     let stepCount = 0;
//     let sleepDuration = 0;

//     // Fetch steps data
//     try {
//       const stepsRes = await fitness.users.dataset.aggregate({
//         userId: 'me',
//         requestBody: {
//           aggregateBy: [
//             {
//               dataSourceId:
//                 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
//             },
//           ],
//           bucketByTime: { durationMillis: (24 * 60 * 60 * 1000).toString() },
//           startTimeMillis: startTime.toString(),
//           endTimeMillis: endTime.toString(),
//         },
//       });

//       if (stepsRes.data.bucket?.[0]?.dataset?.[0]?.point?.[0]) {
//         stepCount =
//           stepsRes.data.bucket[0].dataset[0].point[0].value?.[0]?.intVal || 0;
//       }
//     } catch (stepsError: any) {
//       console.warn(
//         'Failed to fetch steps:',
//         stepsError.message || stepsError
//       );
//     }

//     // Fetch sleep data
//     try {
//       const sleepRes = await fitness.users.dataset.aggregate({
//         userId: 'me',
//         requestBody: {
//           aggregateBy: [
//             {
//               dataSourceId: 'derived:com.google.sleep.segment:com.google.android.gms:sleep_segment',
//             },
//           ],
//           bucketByTime: { durationMillis: (24 * 60 * 60 * 1000).toString() },
//           startTimeMillis: startTime.toString(),
//           endTimeMillis: endTime.toString(),
//         },
//       });

//       if (sleepRes.data.bucket?.[0]?.dataset?.[0]?.point) {
//         const points = sleepRes.data.bucket[0].dataset[0].point;
//         let totalSleepMs = 0;

//         points.forEach((point: any) => {
//           const startTimeNanos = parseInt(point.startTimeNanos);
//           const endTimeNanos = parseInt(point.endTimeNanos);
//           totalSleepMs += (endTimeNanos - startTimeNanos) / 1000000; // Convert to ms
//         });

//         sleepDuration = Math.round((totalSleepMs / 1000 / 60 / 60) * 10) / 10;
//       }
//     } catch (sleepError: any) {
//       console.warn(
//         'Failed to fetch sleep:',
//         sleepError.message || sleepError
//       );
//     }

//     // Save to health_metrics table
//     const { error: saveError } = await supabase
//       .from('health_metrics')
//       .insert({
//         user_id: user.id,
//         step_count: stepCount,
//         heart_rate: null, // Heart rate requires explicit permission
//         sleep_duration: sleepDuration || null,
//         measured_at: new Date().toISOString(),
//       });

//     if (saveError) {
//       console.error('Error saving health metrics:', saveError);
//       return { error: 'Failed to save health metrics' };
//     }

//     return {
//       success: true,
//       data: {
//         stepCount,
//         heartRate: null,
//         sleepDuration,
//       },
//     };
//   } catch (error) {
//     console.error('Error syncing health data:', error);
//     return { error: 'An error occurred while syncing data' };
//   }
// }



'use server';

import { createClient } from '@/utils/supabase/server';
import { google } from 'googleapis';

export async function syncHealthData() {
  try {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'User not authenticated' };

    // 2. Fetch refresh token
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_fit_refresh_token')
      .eq('id', user.id)
      .single();

    if (!profile?.google_fit_refresh_token) {
      return { error: 'No Google Fit refresh token found' };
    }

    // 3. Setup Google Auth
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: profile.google_fit_refresh_token,
    });

    const fitness = google.fitness({ version: 'v1', auth: oauth2Client });
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000;

    let stepCount = 0;
    let sleepDuration = 0;
    let averageHeartRate = 0;

    // 4. Unified Fetch Request
    try {
      const res = await fitness.users.dataset.aggregate({
        userId: 'me',
        requestBody: {
          aggregateBy: [
            { dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" },
            { dataSourceId: "derived:com.google.heart_rate.summary:com.google.android.gms:merge_heart_rate_bpm" },
            { dataSourceId: "derived:com.google.sleep.segment:com.google.android.gms:merged" }
          ],
          bucketByTime: { durationMillis: (24 * 60 * 60 * 1000).toString() },
          startTimeMillis: startTime.toString(),
          endTimeMillis: endTime.toString(),
        },
      });

      const bucket = res.data.bucket?.[0];

      if (bucket && bucket.dataset) {
        // Steps (Index 0)
        stepCount = bucket.dataset[0]?.point?.[0]?.value?.[0]?.intVal || 0;
        // Heart Rate (Index 1)
        averageHeartRate = Math.round(bucket.dataset[1]?.point?.[0]?.value?.[0]?.fpVal || 0);
        // Sleep (Index 2)
        const sleepPoints = bucket.dataset[2]?.point || [];
        let totalSleepMs = 0;
        sleepPoints.forEach((point: any) => {
          const start = parseInt(point.startTimeNanos);
          const end = parseInt(point.endTimeNanos);
          totalSleepMs += (end - start) / 1000000;
        });
        sleepDuration = Math.round((totalSleepMs / 1000 / 60 / 60) * 10) / 10;
      }
    } catch (googleError: any) {
      console.error('Google Fit API error:', googleError.response?.data || googleError.message);
    }

    // 5. Save to the NEW health_metrics table (One single clean insert)
    const { error: saveError } = await supabase
      .from('health_metrics')
      .insert({
        user_id: user.id,
        step_count: stepCount,
        heart_rate: averageHeartRate || null,
        sleep_duration: sleepDuration || null,
        measured_at: new Date().toISOString(),
      });

    if (saveError) {
      console.error('Database Save Error:', saveError);
      return { error: `Database Error: ${saveError.message}` };
    }

    return {
      success: true,
      data: { stepCount, heartRate: averageHeartRate, sleepDuration },
    };
  } catch (error) {
    console.error('Sync process error:', error);
    return { error: 'An unexpected error occurred' };
  }
}