import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache, deleteCache } from '@/lib/redis';

/**
 * Notification details stored per user-client combination
 */
interface NotificationDetails {
  url: string;
  token: string;
}

/**
 * Store notification details for a user
 */
async function setUserNotificationDetails(
  fid: number,
  appFid: number,
  details: NotificationDetails
): Promise<void> {
  const key = `notifications:${fid}:${appFid}`;
  await setCache(key, details, 86400 * 30); // 30 days TTL
}

/**
 * Delete notification details for a user
 */
async function deleteUserNotificationDetails(
  fid: number,
  appFid: number
): Promise<void> {
  const key = `notifications:${fid}:${appFid}`;
  await deleteCache(key);
}

/**
 * Get notification details for a user
 */
async function getUserNotificationDetails(
  fid: number,
  appFid: number
): Promise<NotificationDetails | null> {
  const key = `notifications:${fid}:${appFid}`;
  return await getCache<NotificationDetails>(key);
}

/**
 * Send a notification to a user
 */
async function sendMiniAppNotification({
  fid,
  appFid,
  title,
  body,
  targetUrl,
}: {
  fid: number;
  appFid: number;
  title: string;
  body: string;
  targetUrl?: string;
}): Promise<{ state: string; error?: any }> {
  const notificationDetails = await getUserNotificationDetails(fid, appFid);
  if (!notificationDetails) {
    return { state: 'no_token' };
  }

  try {
    const response = await fetch(notificationDetails.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title,
        body,
        targetUrl: targetUrl || process.env.NEXT_PUBLIC_URL || 'https://your-app-url.vercel.app',
        tokens: [notificationDetails.token],
      }),
    });

    if (response.status === 200) {
      return { state: 'success' };
    } else {
      const errorData = await response.json();
      return { state: 'error', error: errorData };
    }
  } catch (error) {
    return { state: 'error', error };
  }
}

/**
 * POST /api/webhook
 * Handle Mini App webhook events from Base App / Farcaster
 */
export async function POST(request: NextRequest) {
  try {
    const requestJson = await request.json();

    console.log('Webhook received:', JSON.stringify(requestJson, null, 2));

    // Extract webhook data
    // Note: In production, you should verify the signature using @farcaster/miniapp-node
    const { fid, appFid, event } = requestJson.data || requestJson;

    if (!fid || !event) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    // Handle different event types
    switch (event.event || event.type) {
      case 'miniapp_added':
        if (event.notificationDetails) {
          await setUserNotificationDetails(fid, appFid, event.notificationDetails);
          // Send welcome notification
          await sendMiniAppNotification({
            fid,
            appFid,
            title: 'Welcome to Find X Friends!',
            body: 'Start discovering your X friends on Farcaster',
          });
        }
        console.log(`Mini app added for FID ${fid}`);
        break;

      case 'miniapp_removed':
        await deleteUserNotificationDetails(fid, appFid);
        console.log(`Mini app removed for FID ${fid}`);
        break;

      case 'notifications_enabled':
        if (event.notificationDetails) {
          await setUserNotificationDetails(fid, appFid, event.notificationDetails);
          await sendMiniAppNotification({
            fid,
            appFid,
            title: 'Notifications enabled!',
            body: "We'll notify you when your friends join Farcaster",
          });
        }
        console.log(`Notifications enabled for FID ${fid}`);
        break;

      case 'notifications_disabled':
        await deleteUserNotificationDetails(fid, appFid);
        console.log(`Notifications disabled for FID ${fid}`);
        break;

      default:
        console.log(`Unknown event type: ${event.event || event.type}`);
    }

    // Return success response quickly (within 10 seconds)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
