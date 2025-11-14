import { NextRequest, NextResponse } from 'next/server';
import { followUser } from '@/lib/neynar';

/**
 * POST /api/farcaster/follow
 * Follow a user on Farcaster
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signerUuid, targetFid } = body;

    if (!signerUuid) {
      return NextResponse.json(
        { error: 'signerUuid is required' },
        { status: 400 }
      );
    }

    if (!targetFid) {
      return NextResponse.json(
        { error: 'targetFid is required' },
        { status: 400 }
      );
    }

    const success = await followUser(signerUuid, parseInt(targetFid));

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully followed user',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to follow user' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json(
      {
        error: 'Failed to follow user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
