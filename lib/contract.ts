import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

/**
 * ABI for XFriendsFinder contract
 */
export const CONTRACT_ABI = parseAbi([
  'function canQuery(address user) view returns (bool needsPayment, uint256 queryCount)',
  'function payAndQuery() returns (uint256 queryNumber)',
  'function freeQuery() returns (uint256 queryNumber)',
  'function userQueryCount(address user) view returns (uint256)',
  'event QueryExecuted(address indexed user, uint256 queryNumber)',
  'event PaymentReceived(address indexed user, uint256 amount, uint256 timestamp)',
]);

/**
 * ABI for ERC20 (USDC) token
 */
export const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
]);

/**
 * Contract addresses
 */
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
export const PAYMENT_AMOUNT = BigInt(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT || '1000000');

/**
 * Create a public client for reading contract data
 */
export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
});

/**
 * Check if a user needs to pay for the next query
 * @param userAddress - The user's wallet address
 * @returns Object containing needsPayment flag and query count
 */
export async function checkPaymentStatus(
  userAddress: string
): Promise<{ needsPayment: boolean; queryCount: number }> {
  try {
    const [needsPayment, queryCount] = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'canQuery',
      args: [userAddress as `0x${string}`],
    });

    return {
      needsPayment,
      queryCount: Number(queryCount),
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw new Error('Failed to check payment status');
  }
}

/**
 * Verify that a payment transaction was successful
 * @param userAddress - The user's wallet address
 * @param txHash - Optional transaction hash to verify
 * @returns True if payment is verified or not needed
 */
export async function verifyPayment(
  userAddress: string,
  txHash?: string
): Promise<boolean> {
  try {
    const [needsPayment, queryCount] = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'canQuery',
      args: [userAddress as `0x${string}`],
    });

    // First query is free
    if (queryCount === BigInt(0)) {
      return true;
    }

    // If txHash provided, verify the transaction
    if (txHash) {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });
      return receipt.status === 'success';
    }

    return false;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

/**
 * Get the current query count for a user
 * @param userAddress - The user's wallet address
 * @returns The number of queries made by the user
 */
export async function getUserQueryCount(userAddress: string): Promise<number> {
  try {
    const queryCount = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'userQueryCount',
      args: [userAddress as `0x${string}`],
    });

    return Number(queryCount);
  } catch (error) {
    console.error('Error getting user query count:', error);
    return 0;
  }
}
