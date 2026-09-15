import { useEffect, useState } from 'react';
import { midnightWallet, type MidnightWalletState } from '../lib/midnightWallet';

export function WalletConnectButton() {
  const [walletState, setWalletState] = useState<MidnightWalletState>(midnightWallet.getState());
  const [connecting, setConnecting] = useState(false);
  const [showNoWalletModal, setShowNoWalletModal] = useState(false);

  useEffect(() => {
    return midnightWallet.subscribe((state) => {
      setWalletState(state);
    });
  }, []);

  async function handleConnect() {
    setConnecting(true);
    try {
      if (!midnightWallet.hasWallet()) {
        setShowNoWalletModal(true);
        return;
      }
      await midnightWallet.connect();
    } catch (e: any) {
      console.warn('Wallet connection error:', e);
    } finally {
      setConnecting(false);
    }
  }

  const formatAddress = (addr: string) => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {walletState.isConnected && walletState.address ? (
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">{formatAddress(walletState.address)}</span>
            <span className="text-emerald-400/60 font-semibold uppercase text-[10px]">Preprod</span>
            <button
              type="button"
              onClick={() => midnightWallet.disconnect()}
              title="Disconnect wallet"
              className="ml-1 text-white/40 hover:text-white"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={connecting}
            onClick={handleConnect}
            className="flex items-center gap-2 rounded-full border border-moonlight-400/40 bg-moonlight-400/20 px-4 py-1.5 text-xs font-semibold text-moonlight-200 shadow-sm transition hover:bg-moonlight-400/30 disabled:opacity-50"
          >
            <span className="h-2 w-2 rounded-full bg-moonlight-300" />
            {connecting ? 'Waiting for signature…' : 'Connect Midnight Wallet'}
          </button>
        )}
      </div>

      {showNoWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-w-md rounded-2xl border border-white/10 bg-midnight-900 p-6 shadow-2xl">
            <h3 className="font-display text-lg font-semibold text-white">Midnight Wallet Required</h3>
            <p className="mt-2 text-sm text-white/70">
              To sign zero-knowledge proofs and submit real on-chain transactions on the Midnight Preprod network, please install a supported browser wallet:
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="https://1am.com/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <span>🦊 1AM Wallet Extension</span>
                <span className="text-xs text-moonlight-300">Install ↗</span>
              </a>
              <a
                href="https://www.lace.io/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <span>✨ Midnight Lace Wallet</span>
                <span className="text-xs text-moonlight-300">Install ↗</span>
              </a>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowNoWalletModal(false)}
                className="rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
