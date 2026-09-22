/**
 * midnightWallet.ts
 * -------------------------------------------------------------------------
 * Midnight Browser Wallet (1AM & Lace) DApp Connector Integration.
 *
 * Pattern based on the Signet reference project (github.com/anshusingh97/Signet)
 * which successfully runs real on-chain transactions on Midnight Preprod.
 *
 * Features:
 *  - Detects 1AM wallet under all known key variants
 *  - Triggers browser extension popup for wallet authorization
 *  - Persists session to localStorage — survives page refresh
 *  - Auto-reconnects on mount without re-prompting the user
 *  - Disconnects only on explicit user click
 *  - Signs & submits real on-chain transactions, returning verifiable links
 * -------------------------------------------------------------------------
 *
 * IMPORTANT — from Signet onchain.ts:
 *  Explorer: https://explorer.1am.xyz/tx/{txId}?network=preprod
 *  Proof server: https://api-preprod.1am.xyz
 *  The PUBLIC Midnight proof server is INCOMPATIBLE with 1AM wallet (error 182).
 *  Always use the wallet's own getProvingProvider() or the 1AM proof server.
 * -------------------------------------------------------------------------
 */

export type WalletId = '1am' | 'lace' | string;

export interface InjectedWalletProvider {
  name?: string;
  icon?: string;
  apiVersion?: string;
  /** 1AM style: connect(networkId) */
  connect?: (networkId?: string) => Promise<any>;
  /** Lace style: enable() */
  enable?: () => Promise<any>;
  isEnabled?: () => Promise<boolean>;
  isConnected?: () => Promise<boolean>;
  [key: string]: unknown;
}

export interface DiscoveredWallet {
  id: WalletId;
  name: string;
  icon?: string;
  installed: boolean;
  provider?: InjectedWalletProvider;
}

export interface MidnightWalletState {
  isConnected: boolean;
  walletId: WalletId | null;
  walletName: string | null;
  address: string | null;
  coinPublicKey: string | null;
  networkId: string;
  error: string | null;
  availableWallets: DiscoveredWallet[];
}

export interface OnChainTxResult {
  txId: string;
  explorerUrl: string;
  blockTimestamp?: string;
}

declare global {
  interface Window {
    midnight?: Record<string, InjectedWalletProvider>;
  }
}

// ---------------------------------------------------------------------------
// localStorage keys (match Signet naming convention)
// ---------------------------------------------------------------------------
const STORAGE_CONNECTED = 'halflight_wallet_connected';
const STORAGE_WALLET_ID = 'halflight_wallet_id';

// ---------------------------------------------------------------------------
// Discover all installed Midnight wallets from window.midnight
// Matches the detection logic from Signet's useLaceWallet.ts
// ---------------------------------------------------------------------------
export function discoverMidnightWallets(): DiscoveredWallet[] {
  if (typeof window === 'undefined') return [];

  const midnight = window.midnight;
  const discovered: DiscoveredWallet[] = [];

  // ── 1AM Wallet ────────────────────────────────────────────────────────────
  // Can inject as: window.midnight['1am'], window.midnight.oneam,
  //                window.midnight['1AM'], or any key containing "1am"
  let oneAmProvider: InjectedWalletProvider | undefined =
    midnight?.['1am'] ?? midnight?.['oneam'] ?? midnight?.['1AM'];

  if (!oneAmProvider && midnight) {
    for (const key of Object.keys(midnight)) {
      const entry = midnight[key];
      if (
        key.toLowerCase().includes('1am') ||
        (entry?.name && String(entry.name).toLowerCase().includes('1am'))
      ) {
        oneAmProvider = entry;
        break;
      }
    }
  }

  discovered.push({
    id: '1am',
    name: oneAmProvider?.name ?? '1AM Wallet',
    icon: oneAmProvider?.icon,
    installed: !!oneAmProvider,
    provider: oneAmProvider,
  });

  // ── Lace Wallet ───────────────────────────────────────────────────────────
  const laceProvider: InjectedWalletProvider | undefined =
    midnight?.['mnLace'] ?? midnight?.['lace'];

  discovered.push({
    id: 'lace',
    name: laceProvider?.name ?? 'Midnight Lace Wallet',
    icon: laceProvider?.icon,
    installed: !!laceProvider,
    provider: laceProvider,
  });

  return discovered;
}

// ---------------------------------------------------------------------------
// MidnightWalletManager — singleton with subscriber pattern
// ---------------------------------------------------------------------------
class MidnightWalletManager {
  private connectedAPI: any = null;
  private state: MidnightWalletState = {
    isConnected: false,
    walletId: null,
    walletName: null,
    address: null,
    coinPublicKey: null,
    networkId: 'preprod',
    error: null,
    availableWallets: [],
  };
  private listeners: Array<(state: MidnightWalletState) => void> = [];

  constructor() {
    // Refresh available wallets list immediately
    this.state.availableWallets = discoverMidnightWallets();

    // Auto-reconnect from localStorage session without prompting the user
    if (typeof window !== 'undefined') {
      const wasConnected = localStorage.getItem(STORAGE_CONNECTED) === 'true';
      const savedWalletId = localStorage.getItem(STORAGE_WALLET_ID) ?? '1am';
      if (wasConnected) {
        // Delay slightly to let wallet extensions inject into window.midnight
        setTimeout(() => this.silentReconnect(savedWalletId), 800);
      }
    }
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  subscribe(listener: (state: MidnightWalletState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const snapshot = { ...this.state, availableWallets: [...this.state.availableWallets] };
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  getState(): MidnightWalletState {
    return { ...this.state };
  }

  hasWallet(): boolean {
    return typeof window !== 'undefined' &&
      !!window.midnight &&
      Object.keys(window.midnight).length > 0;
  }

  refreshAvailableWallets(): DiscoveredWallet[] {
    const wallets = discoverMidnightWallets();
    this.state = { ...this.state, availableWallets: wallets };
    this.notify();
    return wallets;
  }

  // ── Silent reconnect (no popup) ───────────────────────────────────────────

  private async silentReconnect(walletId: WalletId) {
    try {
      const wallets = discoverMidnightWallets();
      this.state = { ...this.state, availableWallets: wallets };

      const target = wallets.find((w) => w.id === walletId && w.installed);
      if (!target?.provider) return;

      // Check if already enabled without prompting
      const alreadyEnabled = await target.provider.isEnabled?.() ??
        await target.provider.isConnected?.() ?? false;

      if (!alreadyEnabled) return;

      // Reconnect silently — no popup since already authorized
      const connected = target.provider.connect
        ? await target.provider.connect('preprod')
        : await target.provider.enable?.();

      if (!connected) return;
      this.connectedAPI = connected;

      const { address, coinPublicKey } = await this.extractAddressAndKey(connected);

      this.state = {
        ...this.state,
        isConnected: true,
        walletId,
        walletName: target.name,
        address: address ?? 'mn_preprod_wallet',
        coinPublicKey: coinPublicKey ?? null,
        error: null,
      };
      this.notify();
    } catch {
      // Silent failure — user will see the Connect button
      localStorage.removeItem(STORAGE_CONNECTED);
      localStorage.removeItem(STORAGE_WALLET_ID);
    }
  }

  // ── Connect (with popup) ──────────────────────────────────────────────────

  /**
   * Connects to the specified wallet, triggering the browser extension popup.
   * Persists session to localStorage so it survives page refresh.
   */
  async connect(walletId: WalletId = '1am'): Promise<MidnightWalletState> {
    if (typeof window === 'undefined') throw new Error('Window is not available');

    const wallets = this.refreshAvailableWallets();
    const target = wallets.find((w) => w.id === walletId);

    if (!target) {
      throw new Error(`Wallet "${walletId}" not found.`);
    }

    if (!target.installed || !target.provider) {
      const err = `${target.name} is not installed. Please install the browser extension.`;
      this.state = { ...this.state, error: err };
      this.notify();
      throw new Error(err);
    }

    try {
      // This call triggers the wallet extension popup asking the user to authorize
      const connected = target.provider.connect
        ? await target.provider.connect('preprod')
        : await target.provider.enable?.();

      if (!connected) throw new Error('Wallet returned no connection object.');
      this.connectedAPI = connected;

      const { address, coinPublicKey } = await this.extractAddressAndKey(connected);

      this.state = {
        ...this.state,
        isConnected: true,
        walletId,
        walletName: target.name,
        address: address ?? 'mn_preprod_wallet',
        coinPublicKey: coinPublicKey ?? null,
        networkId: 'preprod',
        error: null,
      };

      // Persist session — survives page refresh
      localStorage.setItem(STORAGE_CONNECTED, 'true');
      localStorage.setItem(STORAGE_WALLET_ID, walletId);

      this.notify();
      return this.state;
    } catch (err: any) {
      const message = err?.message ?? 'User rejected wallet connection or popup was closed.';
      this.state = { ...this.state, isConnected: false, error: message };
      localStorage.removeItem(STORAGE_CONNECTED);
      localStorage.removeItem(STORAGE_WALLET_ID);
      this.notify();
      throw new Error(message);
    }
  }

  // ── Disconnect ────────────────────────────────────────────────────────────

  /** Clears wallet session. Only fires when the user explicitly clicks disconnect. */
  async disconnect() {
    this.connectedAPI = null;
    localStorage.removeItem(STORAGE_CONNECTED);
    localStorage.removeItem(STORAGE_WALLET_ID);
    this.state = {
      isConnected: false,
      walletId: null,
      walletName: null,
      address: null,
      coinPublicKey: null,
      networkId: 'preprod',
      error: null,
      availableWallets: this.state.availableWallets,
    };
    this.notify();
  }

  // ── Sign & Submit Transaction ─────────────────────────────────────────────

  /**
   * Submits a real on-chain transaction via the connected wallet.
   * Returns the transaction hash and a verifiable explorer link.
   *
   * Uses the 1AM wallet's own proving provider (getProvingProvider) — same
   * pattern as Signet's onchain.ts. The public Midnight proof server is
   * INCOMPATIBLE with 1AM wallet and causes error 182.
   *
   * Explorer: https://explorer.1am.xyz (1AM's Preprod explorer)
   */
  async signAndSubmitTx(payload: Record<string, unknown>): Promise<OnChainTxResult> {
    if (!this.state.isConnected || !this.connectedAPI) {
      // Prompt connect if not already connected
      await this.connect(this.state.walletId ?? '1am');
    }

    let txId = '';

    try {
      // Pattern from Signet onchain.ts:
      // Use the wallet's own getProvingProvider() for ZK proof generation.
      // This avoids the public proof server incompatibility with 1AM (error 182).
      const provingProvider = typeof this.connectedAPI?.getProvingProvider === 'function'
        ? this.connectedAPI.getProvingProvider()
        : null;

      // Try each known transaction submission API surface in order
      if (typeof this.connectedAPI?.submitTransaction === 'function') {
        txId = await this.connectedAPI.submitTransaction(payload);
      } else if (typeof this.connectedAPI?.balanceUnsealedTransaction === 'function') {
        // 1AM / Lace Midnight flow: balance → prove → submit
        const balanced = await this.connectedAPI.balanceUnsealedTransaction(payload);
        if (provingProvider && typeof provingProvider.proveTransaction === 'function') {
          const proved = await provingProvider.proveTransaction(balanced);
          txId = await this.connectedAPI.submitBalancedTransaction(proved);
        } else if (typeof this.connectedAPI?.submitBalancedTransaction === 'function') {
          txId = await this.connectedAPI.submitBalancedTransaction(balanced);
        } else {
          txId = balanced?.txId ?? balanced;
        }
      } else if (typeof this.connectedAPI?.proveAndSubmitTransaction === 'function') {
        txId = await this.connectedAPI.proveAndSubmitTransaction(payload);
      }
    } catch (e: any) {
      console.warn('[MidnightWallet] Transaction submission error:', e?.message ?? e);
      throw new Error(
        e?.message ??
        'Transaction failed. Ensure your 1AM wallet is on Midnight Preprod and has sufficient tDUST.'
      );
    }

    if (!txId || typeof txId !== 'string') {
      throw new Error(
        'No transaction ID returned. Ensure your 1AM wallet is connected to Midnight Preprod and has sufficient tDUST.'
      );
    }

    // Strip any leading 0x for the 1AM explorer URL format
    const cleanId = txId.replace(/^0x/, '');

    // Use 1AM's explorer (matches Signet onchain.ts explorerTxUrl function)
    // The midnightexplorer.com is NOT used — 1AM has its own Preprod explorer
    const explorerUrl = `https://explorer.1am.xyz/tx/${cleanId}?network=preprod`;

    return {
      txId,
      explorerUrl,
      blockTimestamp: new Date().toISOString(),
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async extractAddressAndKey(
    connected: any
  ): Promise<{ address: string | null; coinPublicKey: string | null }> {
    let address: string | null = null;
    let coinPublicKey: string | null = null;

    try {
      // 1AM pattern (from Signet repo)
      if (typeof connected.getPublicKeys === 'function') {
        const keys = await connected.getPublicKeys();
        coinPublicKey = keys?.coinPublicKey ?? null;
        address = coinPublicKey;
      } else if (connected.coinPublicKey) {
        coinPublicKey = connected.coinPublicKey;
        address = coinPublicKey;
      }

      // State pattern
      if (!address && connected.state?.address) {
        address = connected.state.address;
      }

      // Lace / shielded address pattern
      if (!address && typeof connected.getShieldedAddresses === 'function') {
        const shielded = await connected.getShieldedAddresses();
        address = shielded?.shieldedCoinPublicKey ?? shielded?.shieldedEncryptionPublicKey ?? null;
        coinPublicKey = address;
      }

      if (!address && typeof connected.getUnshieldedAddress === 'function') {
        address = await connected.getUnshieldedAddress();
      }
    } catch {
      // Safe fallback — connection succeeded even if address extraction fails
    }

    return { address, coinPublicKey };
  }
}

export const midnightWallet = new MidnightWalletManager();
