import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting middleware
 * Protects API routes from abuse
 */

const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
};

export function rateLimiter(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Verify request origin
 */
export function verifyOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_URL,
    'http://localhost:3000',
    'https://farcaster.xyz',
  ];

  if (!origin) return false;
  return allowedOrigins.some((allowed) => origin.startsWith(allowed || ''));
}

/**
 * Extract user identifier for rate limiting
 */
export function getUserIdentifier(request: NextRequest): string {
  // Use wallet address if available, otherwise IP
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (address) return address;

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

/**
 * Middleware wrapper for API routes
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // 1. Check origin
    if (!verifyOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      );
    }

    // 2. Rate limiting
    const identifier = getUserIdentifier(request);
    if (!rateLimiter(identifier)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 3. Execute handler
    return handler(request);
  };
}

/**
 * Clean up old rate limit entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key);
    }
  }
}, RATE_LIMIT.windowMs);
