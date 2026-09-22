/**
 * WalletConnectButton.tsx
 * -------------------------------------------------------------------------
 * Wallet connection UI using the same pattern as Signet (github.com/anshusingh97/Signet).
 *
 * - Shows a modal listing all detected Midnight wallets (1AM, Lace)
 * - Triggers browser extension popup on wallet select
 * - Session persists across page refreshes (localStorage)
 * - Only disconnects when user explicitly clicks ✕
 * -------------------------------------------------------------------------
 */
import { useEffect, useRef, useState } from 'react';
import {
  midnightWallet,
  discoverMidnightWallets,
  type MidnightWalletState,
  type DiscoveredWallet,
  type WalletId,
} from '../lib/midnightWallet';

export function WalletConnectButton() {
  const [walletState, setWalletState] = useState<MidnightWalletState>(midnightWallet.getState());
  const [connecting, setConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Subscribe to wallet state changes (including auto-reconnect)
  useEffect(() => {
    return midnightWallet.subscribe((state) => {
      setWalletState(state);
    });
  }, []);

  // Refresh wallet list when modal opens
  useEffect(() => {
    if (showModal) {
      setWallets(discoverMidnightWallets());
    }
  }, [showModal]);

  // Close modal on outside click
  useEffect(() => {
    if (!showModal) return;
    function onOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [showModal]);

  async function handleSelectWallet(walletId: WalletId) {
    setConnecting(true);
    try {
      await midnightWallet.connect(walletId);
      setShowModal(false);
    } catch (e: any) {
      console.warn('[WalletConnect] Error:', e?.message ?? e);
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    midnightWallet.disconnect();
  }

  const formatAddress = (addr: string) => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
  };

  const anyInstalled = wallets.some((w) => w.installed);

  // ── Connected state ───────────────────────────────────────────────────────
  if (walletState.isConnected && walletState.address) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-emerald-300 text-[10px] uppercase">
          {walletState.walletName ?? '1AM'}
        </span>
        <span className="font-mono">{formatAddress(walletState.address)}</span>
        <span className="text-emerald-400/60 font-semibold uppercase text-[10px]">Preprod</span>
        <button
          type="button"
          onClick={handleDisconnect}
          title="Disconnect wallet"
          className="ml-1 rounded-full px-1 text-white/40 hover:text-red-300 transition"
        >
          ✕
        </button>
      </div>
    );
  }

  // ── Disconnected state + Modal ────────────────────────────────────────────
  return (
    <>
      <button
        type="button"
        disabled={connecting}
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-full border border-moonlight-400/40 bg-moonlight-400/20 px-4 py-1.5 text-xs font-semibold text-moonlight-200 shadow-sm transition hover:bg-moonlight-400/30 disabled:opacity-50"
      >
        <span className="h-2 w-2 rounded-full bg-moonlight-300" />
        {connecting ? 'Waiting for wallet…' : 'Connect Midnight Wallet'}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d1a] shadow-2xl overflow-hidden"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Connect Midnight Wallet
                </h3>
                <p className="mt-0.5 text-xs text-white/40">
                  Select a wallet to sign transactions on Midnight Preprod
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white/30 hover:text-white/80 transition text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Wallet list */}
            <div className="p-4 space-y-2">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  type="button"
                  disabled={!wallet.installed || connecting}
                  onClick={() => handleSelectWallet(wallet.id)}
                  className={[
                    'w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition',
                    wallet.installed
                      ? 'border-moonlight-400/30 bg-moonlight-400/10 text-white hover:bg-moonlight-400/20 cursor-pointer'
                      : 'border-white/5 bg-white/[0.02] text-white/30 cursor-not-allowed',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    {wallet.icon ? (
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        className="h-7 w-7 rounded-lg object-contain"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-base">
                        {wallet.id === '1am' ? '🌑' : '✨'}
                      </span>
                    )}
                    <div className="text-left">
                      <div className="font-semibold">{wallet.name}</div>
                      {wallet.id === '1am' && (
                        <div className="text-[10px] text-moonlight-300/70">
                          API v{/* runtime version shown after connect */}Midnight DApp Connector
                        </div>
                      )}
                    </div>
                  </div>

                  {wallet.installed ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      {connecting ? 'Connecting…' : 'Detected ↗'}
                    </span>
                  ) : (
                    <a
                      href={wallet.id === '1am' ? 'https://1am.com/' : 'https://www.lace.io/'}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/50 hover:text-white transition"
                    >
                      Install ↗
                    </a>
                  )}
                </button>
              ))}

              {/* No wallets at all */}
              {!anyInstalled && (
                <p className="text-center text-xs text-white/40 py-2">
                  No Midnight wallet detected. Please install 1AM Wallet or Lace Wallet for Midnight.
                </p>
              )}
            </div>

            {/* Footer note */}
            <div className="border-t border-white/5 px-5 py-3 text-[10px] text-white/30">
              ⛓️ Signing triggers a wallet popup. Transactions go to{' '}
              <strong className="text-white/50">Midnight Preprod</strong> and generate a verifiable
              block explorer link.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
