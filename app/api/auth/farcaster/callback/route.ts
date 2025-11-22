import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/farcaster/callback
 * Handle Neynar Sign in with Farcaster callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Neynar returns these parameters after successful auth
    const fid = searchParams.get('fid');
    const signerUuid = searchParams.get('signer_uuid');
    const username = searchParams.get('username');
    const displayName = searchParams.get('display_name');
    const pfpUrl = searchParams.get('pfp_url');

    // Check for errors
    const error = searchParams.get('error');
    if (error) {
      console.error('Farcaster auth error:', error);
      return NextResponse.redirect(
        new URL(`/?error=farcaster_auth_failed&message=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!fid) {
      return NextResponse.redirect(
        new URL('/?error=farcaster_auth_failed&message=No%20FID%20returned', request.url)
      );
    }

    // Build the redirect URL with user data
    // The client-side will pick this up and store in localStorage
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('farcaster_auth', 'success');
    redirectUrl.searchParams.set('fid', fid);
    if (signerUuid) redirectUrl.searchParams.set('signer_uuid', signerUuid);
    if (username) redirectUrl.searchParams.set('fc_username', username);
    if (displayName) redirectUrl.searchParams.set('fc_display_name', displayName);
    if (pfpUrl) redirectUrl.searchParams.set('fc_pfp_url', pfpUrl);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Farcaster callback error:', error);
    return NextResponse.redirect(
      new URL('/?error=farcaster_auth_failed', request.url)
    );
  }
}
