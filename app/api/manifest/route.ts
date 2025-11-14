import { NextResponse } from 'next/server';
import manifestJson from '@/public/.well-known/farcaster.json';

/**
 * GET /.well-known/farcaster.json
 * Serve the Farcaster manifest
 */
export async function GET() {
  return NextResponse.json(manifestJson);
}
