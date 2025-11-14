import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/contract';

/**
 * GET /api/payment/check
 * Check if user needs to pay for next query
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    const { needsPayment, queryCount } = await checkPaymentStatus(address);

    return NextResponse.json({
      needsPayment,
      queryCount,
      message: queryCount === 0
        ? 'First query is free!'
        : `This will be query #${queryCount + 1}. Payment required.`,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
