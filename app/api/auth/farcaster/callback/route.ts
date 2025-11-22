import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';

/**
 * GET /api/auth/farcaster/callback
 * Handle Neynar Sign in with Farcaster callback
 *
 * Neynar SIWF returns: fid, signer_uuid, is_authenticated
 * We then fetch user details from Neynar API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Log all params for debugging
    console.log('Farcaster callback params:', Object.fromEntries(searchParams.entries()));

    // Neynar returns these parameters after successful auth
    const fid = searchParams.get('fid');
    const signerUuid = searchParams.get('signer_uuid');

    // Check for errors
    const error = searchParams.get('error');
    if (error) {
      console.error('Farcaster auth error:', error);
      return NextResponse.redirect(
        new URL(`/?error=farcaster_auth_failed&message=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!fid) {
      // Log what we received for debugging
      console.error('No FID in callback. Received params:', Object.fromEntries(searchParams.entries()));
      return NextResponse.redirect(
        new URL('/?error=farcaster_auth_failed&message=No%20FID%20returned', request.url)
      );
    }

    // Fetch user data from Neynar API using FID
    let username = '';
    let displayName = '';
    let pfpUrl = '';

    try {
      const neynarResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
        {
          headers: {
            'api_key': NEYNAR_API_KEY,
          },
        }
      );

      if (neynarResponse.ok) {
        const data = await neynarResponse.json();
        const user = data.users?.[0];
        if (user) {
          username = user.username || '';
          displayName = user.display_name || user.username || '';
          pfpUrl = user.pfp_url || '';
        }
      }
    } catch (fetchError) {
      console.error('Error fetching user data from Neynar:', fetchError);
      // Continue with just FID - client can fetch user data later
    }

    // Build the redirect URL with user data
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('farcaster_auth', 'success');
    redirectUrl.searchParams.set('fid', fid);
    if (signerUuid) redirectUrl.searchParams.set('signer_uuid', signerUuid);
    if (username) redirectUrl.searchParams.set('fc_username', username);
    if (displayName) redirectUrl.searchParams.set('fc_display_name', displayName);
    if (pfpUrl) redirectUrl.searchParams.set('fc_pfp_url', encodeURIComponent(pfpUrl));

    console.log('Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Farcaster callback error:', error);
    return NextResponse.redirect(
      new URL('/?error=farcaster_auth_failed', request.url)
    );
  }
}
