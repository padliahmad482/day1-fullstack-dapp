'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { injected } from 'wagmi/connectors';

// ==============================
// 🔹 CONFIG
// ==============================
const CONTRACT_ADDRESS = '0x1e1be66d619aaa0b3e440f8abf06790872008f93';

const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default function Page() {
  // ==============================
  // 🔹 WALLET STATE
  // ==============================
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // ==============================
  // 🔹 LOCAL STATE
  // ==============================
  const [inputValue, setInputValue] = useState('');

  // ==============================
  // 🔹 READ CONTRACT
  // ==============================
  const {
    data: value,
    isLoading: isReading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
  });

  // ==============================
  // 🔹 WRITE CONTRACT
  // ==============================
  const {
    writeContract,
    isPending: isWriting,
    isSuccess,
  } = useWriteContract();

  // UX Improvement: Otomatis refresh value & alert saat tx success
  useEffect(() => {
    if (isSuccess) {
      alert("Transaction Successful! Updating UI...");
      refetch();
      setInputValue(''); 
    }
  }, [isSuccess, refetch]);

  const handleSetValue = async () => {
    if (!inputValue) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: 'setValue',
      args: [BigInt(inputValue)],
    });
  };

  // ==============================
  // 🔹 UI
  // ==============================
  return (
    // UX Improvement: items-start & pt-10 untuk posisi kartu di atas
    <main className="min-h-screen flex justify-center items-start pt-10 bg-black text-white p-4">
      <div className="w-full max-w-md border border-gray-700 rounded-lg p-6 space-y-6 bg-zinc-900 shadow-2xl">

        <h1 className="text-xl font-bold text-center border-b border-gray-800 pb-4">
          Day 3 – Frontend dApp (Avalanche)
        </h1>

        {/* WALLET CONNECT */}
        {!isConnected ? (
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isConnecting}
            className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="space-y-4">
            {/* UX Improvement: Shorten wallet address */}
            <div className="flex flex-col space-y-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold text-center">Connected Account</p>
              <button
                onClick={() => disconnect()}
                className="w-full py-2 border border-gray-700 rounded-lg text-xs text-gray-400 hover:bg-zinc-800 transition font-mono"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)} (Disconnect)
              </button>
            </div>

            {/* READ CONTRACT */}
            <div className="bg-black p-5 rounded-lg border border-gray-800 text-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Contract Value (read)</p>
              {isReading ? (
                <p className="text-2xl font-bold text-blue-400 animate-pulse">Loading...</p>
              ) : (
                <p className="text-5xl font-bold mt-1 text-blue-400">
                  {value !== undefined ? value.toString() : '0'}
                </p>
              )}
              <button
                onClick={() => refetch()}
                className="mt-3 text-blue-500 text-xs hover:text-blue-400 font-medium flex items-center justify-center gap-1 w-full"
              >
                ↻ Refresh value
              </button>
            </div>

            {/* WRITE CONTRACT */}
            <div className="border-t border-gray-800 pt-6 space-y-3">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Update Contract Value</p>
              <input
                type="number"
                placeholder="Enter new uint256 value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-3 rounded-lg bg-black border border-gray-700 outline-none focus:border-blue-500 transition"
              />
              {/* UX Improvement: Disable button saat tx pending (isWriting) */}
              <button
                onClick={handleSetValue}
                disabled={isWriting}
                className={`w-full py-3 rounded-lg font-bold transition text-sm ${
                  isWriting 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                }`}
              >
                {isWriting ? 'Processing in Blockchain...' : 'Set Value'}
              </button>
            </div>
          </div>
        )}

        {/* FOOTNOTE */}
        <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest font-bold pt-2">
          Smart contract = single source of truth
        </p>

      </div>
    </main>
  );
}