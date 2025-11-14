'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction';
import type { ContractFunctionParameters } from 'viem';
import { CONTRACT_ABI, ERC20_ABI, CONTRACT_ADDRESS, USDC_ADDRESS, PAYMENT_AMOUNT } from '@/lib/contract';

interface PaymentGateProps {
  onSuccess: (txHash?: string) => void;
}

export function PaymentGate({ onSuccess }: PaymentGateProps) {
  const { address } = useAccount();
  const [queryCount, setQueryCount] = useState<number>(0);
  const [needsPayment, setNeedsPayment] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      checkPaymentStatus();
    }
  }, [address]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payment/check?address=${address}`);
      const data = await response.json();
      setQueryCount(data.queryCount);
      setNeedsPayment(data.needsPayment);
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Free query contract call
  const freeQueryContract: ContractFunctionParameters = {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'freeQuery',
    args: [],
  };

  // Paid query contracts (approve + payAndQuery)
  const paidQueryContracts: ContractFunctionParameters[] = [
    // 1. Approve USDC spending
    {
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, PAYMENT_AMOUNT],
    },
    // 2. Execute paid query
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'payAndQuery',
      args: [],
    },
  ];

  const handleOnStatus = (status: any) => {
    console.log('Transaction status:', status);
    if (status.statusName === 'success') {
      // Wait a moment for blockchain confirmation
      setTimeout(() => {
        onSuccess(status.statusData?.transactionHash);
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Query Info Banner */}
      <div
        className={`${
          queryCount === 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
        } border rounded-lg p-4`}
      >
        <p className="text-sm font-medium text-gray-900">
          {queryCount === 0 ? (
            <>
              <span className="text-green-600">🎉 First query is FREE!</span>
              <br />
              <span className="text-gray-600 text-xs">
                Subsequent queries cost $1 USDC on Base
              </span>
            </>
          ) : (
            <>
              <span className="text-blue-600">Query #{queryCount + 1}</span>
              <br />
              <span className="text-gray-600 text-xs">Cost: $1 USDC</span>
            </>
          )}
        </p>
      </div>

      {/* Transaction Component */}
      {!needsPayment ? (
        // Free query (first time)
        <Transaction contracts={[freeQueryContract]} onStatus={handleOnStatus}>
          <TransactionButton
            text="Find My X Friends (FREE)"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          />
          <TransactionStatus>
            <TransactionStatusLabel />
            <TransactionStatusAction />
          </TransactionStatus>
        </Transaction>
      ) : (
        // Paid query (subsequent times)
        <Transaction contracts={paidQueryContracts} onStatus={handleOnStatus}>
          <TransactionButton
            text="Find My X Friends ($1 USDC)"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          />
          <TransactionStatus>
            <TransactionStatusLabel />
            <TransactionStatusAction />
          </TransactionStatus>
        </Transaction>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {needsPayment ? (
            <>
              This transaction will approve and spend 1 USDC from your wallet.
              <br />
              Your X following list will be fetched and matched with Farcaster users.
            </>
          ) : (
            <>
              Your first query is completely free!
              <br />
              We'll fetch your X following list and find matches on Farcaster.
            </>
          )}
        </p>
      </div>

      {/* USDC Balance Warning */}
      {needsPayment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            Make sure you have at least 1 USDC in your wallet on Base.
            <br />
            <a
              href="https://app.uniswap.org/swap?chain=base"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Get USDC on Uniswap
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
